import { NextFunction } from "express";
import { Container, inject } from "inversify";
import {
    controller,
    httpPost
} from "inversify-express-utils";
import ICustomErrorsGenerator from "../../classes/interfaces/ICustomErrorsGenerator";
import MyRequest from "../../constants/interfaces/MyRequest";
import MyResponse from "../../constants/interfaces/MyResponse";
import Types from "../../constants/Types";
import IHandlerService from "../../services/interfaces/IHandlerService";
import IMarketBusiness from "../business/interfaces/IMarketBusiness";
import IPurchaseBusiness from "../business/interfaces/IPurchaseBusiness";
import IPurchaseController from "./interfaces/IPurchaseController";


export default function purchaseControllerFactory(container: Container) {
    @controller("/purchase")
    class PurchaseController implements IPurchaseController {



        constructor(
            @inject(Types.PurchaseBusiness) private _purchaseBusiness: IPurchaseBusiness,
            @inject(Types.HandlerService) private _handlerService: IHandlerService,
            @inject(Types.MarketBusiness) private _marketBusiness: IMarketBusiness,
            @inject(Types.CustomErrorsGenerator) private _customErrors: ICustomErrorsGenerator,
        ) { }

        @httpPost('/check')
        @httpPost('/init')
        async check(req: MyRequest, res: MyResponse, next: NextFunction) {
            try {

                const {market, token, productId, type} = req.allParams;

                if (!market || !token || !productId || !type) {
                    throw this._customErrors.generateError(this._customErrors.types.BAD_REQUEST);
                }

                let result = await this._purchaseBusiness.check(market, token, productId, type);

                return res.customSend(result);

            } catch(e) {

                res.handleError(e);

            }
        }
    }
    return PurchaseController;
}
