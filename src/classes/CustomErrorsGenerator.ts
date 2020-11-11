/**
 * Шаблоны ошибок для отправки на клиент
 */

import {injectable, unmanaged} from "inversify";
import ICustomErrorsGenerator from "./interfaces/ICustomErrorsGenerator";
import ErrorsTypes from "../constants/enums/ErrorsTypes";




export class CustomError extends Error {
  constructor(public type: ErrorsTypes, public message: string = 'error', public code?: number) {
    super();
  }
}

@injectable()
export class CustomErrorsGenerator implements ICustomErrorsGenerator {

  constructor(
      @unmanaged() public types: typeof ErrorsTypes) {
  }


  generateError(type: ErrorsTypes, message?: string) {
    return new CustomError(type, message);
  }

  isCustomError(error: Error): error is CustomError {
    return (error as CustomError).type !== undefined;
  }
}
