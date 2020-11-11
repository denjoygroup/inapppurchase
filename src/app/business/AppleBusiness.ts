import { inject, injectable } from 'inversify';
import moment from 'moment-timezone';
import util from 'util';
import ICustomErrorsGenerator from '../../classes/interfaces/ICustomErrorsGenerator';
import { ProductType } from "../../classes/utils";
import IPurchaseParsedResultFromProvider from '../../constants/interfaces/IAppleParsedResult';
import IConstants from "../../constants/interfaces/IConstants";
import Types from '../../constants/Types';
import IHandlerService from "../../services/interfaces/IHandlerService";
import IAppleBusiness from "./interfaces/IAppleBusiness";


@injectable()
export default class AppleBusiness implements IAppleBusiness {
    constructor(
        @inject(Types.Constants) private _constants: IConstants,
        @inject(Types.HandlerService) private _handlerService: IHandlerService,
        @inject(Types.CustomErrorsGenerator) private _customErrorsGenerator: ICustomErrorsGenerator,
    ) {

    }
    async verifyAndParseReceipt(productId: string, token: string, productType: ProductType) {
        try {
            return await this._verifyAndParseReceipt(productId, token, productType, false);
        } catch (e) {
            if (e.type === this._customErrorsGenerator.types.IS_SANDBOX_PURCHASE) {
                return await this._verifyAndParseReceipt(productId, token, productType, true);
            } else throw e;
        }
    }


    private async _verifyReceipt(receiptValue: string, sandBox: boolean) {
        let options = {
            host: sandBox ? this._constants.apple.sandbox : this._constants.apple.host,
            path: this._constants.apple.path,
            method: 'POST'
        };
        let body = {
            'receipt-data': receiptValue,
            'password': this._constants.apple.password
        };
        let result = null;
        let stringResult = await this._handlerService.sendHttp(options, body, 'https');
        result = JSON.parse(stringResult);
        return result;
    }


    private _getTransactionIdFromAppleResponse(currentPurchaseFromApple: any) {
        return currentPurchaseFromApple.original_transaction_id;
    }


    private async _verifyAndParseReceipt(product: string, receiptValue: string, productType: ProductType, sandBox: boolean) {
        let resultFromApple = await this._verifyReceipt(receiptValue, sandBox);
        if (!resultFromApple || !resultFromApple.hasOwnProperty('status')) throw this._customErrorsGenerator.generateError(this._customErrorsGenerator.types.INCORRECT_RESPONSE_FROM_APPLE);
        return await this._parseResponse(product, resultFromApple, productType, sandBox);
    }

    private async _parseResponse(product: string, resultFromApple: any, productType: ProductType, sandBox: boolean) {
        let parsedResult: IPurchaseParsedResultFromProvider = {
            validated: false,
            trial: false,
            checked: false,
            sandBox,
            productType: productType,
            lastResponseFromProvider: JSON.stringify(resultFromApple)
        };

        switch (resultFromApple.status) {
            /**
             * Валидная подписка
             */
            case 0: {
                let currentPurchaseFromApple = this._getCurrentPurchaseFromAppleResult(resultFromApple, product!, productType);
                parsedResult.checked = true;
                if (!currentPurchaseFromApple) break;
                parsedResult.originalTransactionId = this._getTransactionIdFromAppleResponse(currentPurchaseFromApple);
                if (productType === ProductType.Subscription) {
                    parsedResult.validated = (this._checkDateIsAfter(currentPurchaseFromApple.expires_date_ms)) ? true : false;
                    parsedResult.expiredAt = (this._checkDateIsValid(currentPurchaseFromApple.expires_date_ms)) ?
                        this._formatDate(currentPurchaseFromApple.expires_date_ms) : undefined;
                } else {
                    parsedResult.validated = true;
                }
                parsedResult.trial = this._checkPurchaseIsTrial(currentPurchaseFromApple);
                break;
            }
            /**
             * Неправильный sharedKey
             */
            case 21004: {
                parsedResult.checked = true;
                parsedResult.validated = false;
                break;
            }
            /**
             * Подписка истекла
             */
            case 21006: {
                let currentPurchaseFromApple = this._getCurrentPurchaseFromAppleResult(resultFromApple, product!, productType);
                if (!currentPurchaseFromApple) break;
                parsedResult.originalTransactionId = this._getTransactionIdFromAppleResponse(currentPurchaseFromApple);
                parsedResult.checked = true;
                parsedResult.validated = false;
                parsedResult.expiredAt = moment(currentPurchaseFromApple.expires_date_ms, 'x').toDate();
                parsedResult.trial = this._checkPurchaseIsTrial(currentPurchaseFromApple);
                break;
            }
            /**
             * Подписка из сэндбокса
             */
            case 21007: {
                throw this._customErrorsGenerator.generateError(this._customErrorsGenerator.types.IS_SANDBOX_PURCHASE);
            }
            default:
                if (!resultFromApple) console.log('empty result from apple');
                else console.log('incorrect result from apple, status:', resultFromApple.status);
        }

        return parsedResult;
    }

    private _checkDateIsValid(dateFromApple?: string) {
        return (dateFromApple &&
            moment(dateFromApple, 'x').isValid());
    }

    private _checkDateIsAfter(dateFromApple?: string) {
        return (dateFromApple &&
            moment(dateFromApple, 'x').isValid() &&
            moment(dateFromApple, 'x').isAfter(moment()));
    }

    private _formatDate(dateFromApple: string) {
        return moment(dateFromApple, 'x').toDate();
    }

    private _checkPurchaseIsTrial(currentPurchaseFromApple: any) {
        return (currentPurchaseFromApple && currentPurchaseFromApple.is_trial_period === 'false') ? true : false;
    }

    private _getCurrentPurchaseFromAppleResult(resultFromApple: any, productIdToCheck: string, productType: string) {

        let findPurchase: any;
        let lastTimestamp: Date;
        const isSubscription = productType === ProductType.Subscription;
        const purchases: any[] = (isSubscription) ? resultFromApple.latest_receipt_info : resultFromApple.receipt.in_app;

        try {
            purchases.forEach((item: any) => {

                if (item.product_id !== productIdToCheck) return;

                let currentDate: Date;

                if (!isSubscription) {
                    findPurchase = item;
                    return;
                }

                currentDate = this._formatDate(item.expires_date_ms);

                if (moment(lastTimestamp).isBefore(currentDate!)) {
                    findPurchase = item
                    lastTimestamp = currentDate;
                }

            })
        } catch(e) {
            console.error(util.inspect(resultFromApple, {depth: null}));
            throw e;
        }

        // TODO ??
        return findPurchase;
    }

}
