export default interface IPurchaseParsedResultFromProvider {
    originalTransactionId?: string;
    expiredAt?: Date;
    validated: boolean;
    trial: boolean;
    checked: boolean;
    sandBox: boolean;
    productType: string;
    lastResponseFromProvider?: string;
}