import { RequestHandler } from "express";
import { Container } from 'inversify';
import AppleBusiness from "./app/business/AppleBusiness";
import GoogleBusiness from "./app/business/GoogleBusiness";
import PurchaseBusiness from "./app/business/PurchaseBusiness";
import { AllParams } from './app/config/middlewares/AllParams';
import { ExtendResponse } from './app/config/middlewares/ExtendResponse';
import { CustomErrorsGenerator } from './classes/CustomErrorsGenerator';
import Constants from './constants/Constants';
import ErrorsTypes from './constants/enums/ErrorsTypes';
import Types from './constants/Types';
import HandlerService from './services/HandlerService';

let container = new Container();

/**
 * Business
 */
container.bind(Types.PurchaseBusiness).to(PurchaseBusiness).inSingletonScope();
container.bind(Types.AppleBusiness).to(AppleBusiness).inSingletonScope();
container.bind(Types.GoogleBusiness).to(GoogleBusiness).inSingletonScope();

/**
 * Controllers
 */

/**
 * Constants
 */
container.bind(Types.Constants).to(Constants).inSingletonScope();

/**
 * Classes
 */
container.bind(Types.CustomErrorsGenerator).to(CustomErrorsGenerator).inSingletonScope();


/**
 * Services
 */
container.bind(Types.HandlerService).to(HandlerService).inSingletonScope();

/**
 * Middlewares
 */
// container.bind(Types.Session).to(Session).inSingletonScope();
container.bind(Types.ExtendResponse).to(ExtendResponse).inSingletonScope();
container.bind(Types.AllParams).to(AllParams).inSingletonScope();


container.bind<RequestHandler>('ExtendResponse').toConstantValue((req: any, res: any, next: any) => {
  let extendResponse = container.get<ExtendResponse>(Types.ExtendResponse);
  extendResponse.configuration(req, res, next);
});
container.bind<RequestHandler>('AllParams').toConstantValue((req: any, res: any, next: any) => {
  let allParams = container.get<AllParams>(Types.AllParams);
  allParams.configuration(req, res, next);
});

export default container;
