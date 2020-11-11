import { ProductType } from "../../../classes/utils";
import IPurchaseParsedResultFromProvider from "../../../constants/interfaces/IAppleParsedResult";

export default interface IMarketBusiness {
    verifyReceipt(market: string, product: string, token: string, type: ProductType): Promise<IPurchaseParsedResultFromProvider>;
}
