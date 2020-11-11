import { ProductType } from "../../../classes/utils";

export default interface IPurchaseBusiness {
    check(market: string, token: string, productId: string, type: ProductType): Promise<any>
}
