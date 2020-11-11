import { JWT } from 'google-auth-library';
import { inject, injectable } from 'inversify';
import moment from 'moment-timezone';
import ICustomErrorsGenerator from '../../classes/interfaces/ICustomErrorsGenerator';
import { ProductType } from '../../classes/utils';
import IPurchaseParsedResultFromProvider from '../../constants/interfaces/IAppleParsedResult';
import IConstants from "../../constants/interfaces/IConstants";
import Types from '../../constants/Types';
import IHandlerService from "../../services/interfaces/IHandlerService";
import IGoogleBusiness from "./interfaces/IGoogleBusiness";

type ResultFromGoogle = {
  kind: string,
  developerPayload: string,
  orderId: string,
  purchaseType: number,
  acknowledgementState: number
}

type SubscriptionResultFromGoogle = ResultFromGoogle & {
  startTimeMillis: string,
  expiryTimeMillis: string,
  autoRenewing: false,
  priceCurrencyCode: string,
  priceAmountMicros: string,
  countryCode: string,
  cancelReason: number
};

type ProductResultFromGoogle = ResultFromGoogle & {
  purchaseTimeMillis: string,
  purchaseState: number,
  consumptionState: number,
  purchaseToken: string,
  productId: string,
  quantity: number,
  obfuscatedExternalAccountId: string,
  obfuscatedExternalProfileId: string
};

type ErrorFromGoogle = Error;
type ReqPurchaseParams = {
  //json
  json: string,
  signature: string,
  //json
  skuDetails: string,
  isPurchaseHistorySupported: boolean,
  isOwned: boolean
}

@injectable()
export default class GoogleBusiness implements IGoogleBusiness {
  constructor(

    @inject(Types.Constants) private _constants: IConstants,
    @inject(Types.HandlerService) private _handlerService: IHandlerService,
    @inject(Types.CustomErrorsGenerator) private _customErrorsGenerator: ICustomErrorsGenerator
  ) {

  }


  async verifyAndParseReceipt(productId: string, token: string, type: ProductType) {
    let result = await this._getPurchaseInfoFromGoogle(productId, token, type);
    console.log('result from google', result);
    return this._parseResponse(productId, result, type);
  }

  private _parseResponse(product: string, result: ResultFromGoogle | ErrorFromGoogle, type: ProductType) {
    let parsedResult: IPurchaseParsedResultFromProvider = {
      validated: false,
      trial: false,
      checked: true,
      sandBox: false,
      productType: type,
      lastResponseFromProvider: JSON.stringify(result),
    };

    if (this._isResultFromGoogle(result)) {
      if (this._isSubscriptionResult(result)) {
        parsedResult.expiredAt = moment(result.expiryTimeMillis, 'x').toDate();
        parsedResult.validated = this._checkDateIsAfter(parsedResult.expiredAt);
      } else if (this._isProductResult(result)) {
        parsedResult.validated = true;
      }
    }
    return parsedResult;
  }

  private _checkDateIsAfter(expiredAt: Date) {
    let expired = (expiredAt &&
      moment(expiredAt).isAfter(moment()));

    return expired;
  }

  private _isResultFromGoogle(result: ResultFromGoogle | ErrorFromGoogle): result is ResultFromGoogle {
    return (result as ResultFromGoogle).purchaseType !== undefined;
  }

  private _isSubscriptionResult(result: ResultFromGoogle): result is SubscriptionResultFromGoogle {
    return (result as SubscriptionResultFromGoogle).expiryTimeMillis !== undefined;
  }
  private _isProductResult(result: ResultFromGoogle): result is ProductResultFromGoogle {
    return (result as ProductResultFromGoogle).purchaseTimeMillis !== undefined;
  }


  private async _getPurchaseInfoFromGoogle(product: string, token: string, productType: ProductType) {
    try {
      let options = {
        email: this._constants.google.email,
        key: this._constants.google.key,
        scopes: ['https://www.googleapis.com/auth/androidpublisher'],
      };
      const client = new JWT(options);  
      let productOrSubscriptionUrlPart = productType === ProductType.Subscription ? 'subscriptions' : 'products';

      const url = `https://${this._constants.google.host}${this._constants.google.path}/${this._constants.google.storeName}/purchases/${productOrSubscriptionUrlPart}/${product}/tokens/${token}`;
      const res = await client.request({ url });
      return res.data as ResultFromGoogle;
    } catch(e) {
      return e as ErrorFromGoogle;
    }
  }
}
