import { ProductType } from "../../../classes/utils";
import IPurchaseParsedResultFromProvider from "../../../constants/interfaces/IAppleParsedResult";

export default interface IGoogleBusiness {
    verifyAndParseReceipt(productId: string, token: string, type: ProductType): Promise<IPurchaseParsedResultFromProvider>;
}
