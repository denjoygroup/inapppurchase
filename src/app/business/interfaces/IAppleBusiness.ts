import { ProductType } from "../../../classes/utils";
import IPurchaseParsedResultFromProvider from "../../../constants/interfaces/IAppleParsedResult";

export default interface IAppleBusiness {
    verifyAndParseReceipt(productId: string, token: string, productType: ProductType): Promise<IPurchaseParsedResultFromProvider>;
    // getTransactionIdFromAppleResponse(result: any): string;
}
