import express, {Request, Response, Application, NextFunction} from 'express';
import {inject, injectable} from "inversify";
import IHandlerService from '../../../services/interfaces/IHandlerService';
import IConstants from '../../../constants/interfaces/IConstants';
import Types from '../../../constants/Types';
import MyResponse from '../../../constants/interfaces/MyResponse';
import { CustomError } from '../../../classes/CustomErrorsGenerator';
import ErrorsTypes from '../../../constants/enums/ErrorsTypes';
import ICustomErrorsGenerator from '../../../classes/interfaces/ICustomErrorsGenerator';
import { IncomingMessage } from 'http';
import MyRequest from '../../../constants/interfaces/MyRequest';

type ErrorResponse = {
  error: {
    code: number,
    description?: string,
    statusCode?: string
  }
}
type SuccessResponse = {
  data: any,
  description?: string
}

@injectable()
export class ExtendResponse {
  constructor(
    @inject(Types.HandlerService) private _handlerService: IHandlerService,
    @inject(Types.Constants) private _constants: IConstants,
    @inject(Types.CustomErrorsGenerator) private _customErrors: ICustomErrorsGenerator,
  ) {

  }

  formatErrorResponseBy(code: number, description?: string, statusCode?: string) {

    let dataForSend: ErrorResponse = {
      error: {
        code,
        description,
        statusCode
      }
    }

    return dataForSend;
  }

  errorTypeToCode(type: ErrorsTypes) {
    let code = 500;
    switch (type) {
      case ErrorsTypes.REQUIRED:
      case ErrorsTypes.BAD_REQUEST:
        code = 400;
        break;
      case ErrorsTypes.NOT_FOUND:
        code = 404;
        break;
      case ErrorsTypes.INTERNAL_SERVER_ERROR:
        code = 500;
        break;
      default: 
        code = 500;
    }
    return code;
  }


  configuration(req: Request, res: Response, next: NextFunction): void {
    (req as MyRequest).timeInMilliseconds = Date.now();
    (res as MyResponse).customSend = (...props: any[]) => {
      let successResponse: SuccessResponse = {
        data: null
      };
      if (props.length >= 2) {
        successResponse.data = props[0];
        successResponse.description = props[1];
      } else {
        successResponse.data = props[0];
      }
      res.status(200).send(successResponse);
    }

    (res as MyResponse).handleError = (error: Error, native?: boolean) => {
      if (!(error instanceof CustomError)) {
        error = this._customErrors.generateError(this._customErrors.types.INTERNAL_SERVER_ERROR, error.message);
      }
      let code = this.errorTypeToCode((error as CustomError).type);

      let httpCode = (native) ? code : 200;
      let errorResponse = this.formatErrorResponseBy(code, error.message, this._customErrors.types[(error as CustomError).type]);
      res.status(httpCode).send(errorResponse);
    }
    next();
  }
}
