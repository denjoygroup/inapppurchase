import { inject, injectable } from 'inversify';
import ICustomErrorsGenerator from '../../classes/interfaces/ICustomErrorsGenerator';
import { Market, ProductType } from '../../classes/utils';
import Types from '../../constants/Types';
import IAppleBusiness from './interfaces/IAppleBusiness';
import IGoogleBusiness from './interfaces/IGoogleBusiness';
import IPurchaseBusiness from "./interfaces/IPurchaseBusiness";


@injectable()
export default class PurchaseBusiness implements IPurchaseBusiness {
  constructor(
    @inject(Types.AppleBusiness) private _appleBusiness: IAppleBusiness,
    @inject(Types.GoogleBusiness) private _googleBusiness: IGoogleBusiness,
    @inject(Types.CustomErrorsGenerator) private _customErrors: ICustomErrorsGenerator,
  ) {}
  
  async check(market: string, token: string, productId: string, type: ProductType) {
    if (market === Market.Apple) {
      return await this._appleBusiness.verifyAndParseReceipt(productId, token, type);
    } else if (market === Market.Google) {
        return await this._googleBusiness.verifyAndParseReceipt(productId, token, type);
    } else {
        throw this._customErrors.generateError(this._customErrors.types.NOT_FOUND, 'Market');
    }
  }
}
