import 'reflect-metadata';
import readline from 'readline';


import container from '../../inversify.config';
import IHandlerService from '../../services/interfaces/IHandlerService';
import Types from '../../constants/Types';
import IPurchaseBusiness from './interfaces/IPurchaseBusiness';
import { Market, ProductType } from '../../classes/utils';

const handlerService = container.get<IHandlerService>(Types.HandlerService);
const purchaseBusiness = container.get<IPurchaseBusiness>(Types.PurchaseBusiness);

describe('PurchaseBusiness', async () => {
  let productId = '';
  let receipt = '';
  let market: Market;
  let productType: ProductType;
  before(async () => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    console.log('==============================');
    productId = await handlerService.prompt(rl, 'Enter productId: \n');
    console.log('==============================');
    receipt = await handlerService.prompt(rl, 'Enter receipt: \n');
    console.log('==============================');
    market = await handlerService.prompt(rl, 'Choose market: \n1. Apple\n2. Google\n', [{number: 1, value: Market.Apple}, {number: 2, value: Market.Google}]);
    console.log('==============================');
    productType = await handlerService.prompt(rl, 'Choose market: \n1. Subscription\n2. Consumable\n3. NonConsumable\n', [
      {number: 1, value: ProductType.Subscription}, 
      {number: 2, value: ProductType.Consumable},
      {number: 3, value: ProductType.NonConsumable},
    ]);
    console.log('==============================');
  })

  it('check', async () => {
    if (!productId || !receipt) throw new Error('ProductId and receipt are required');
    await purchaseBusiness.check(market, receipt, productId, productType);
  })
})