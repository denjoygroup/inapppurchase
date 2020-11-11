import { injectable, inject } from "inversify";
import IHandlerService from "../../../services/interfaces/IHandlerService";
import IConstants from "../../../constants/interfaces/IConstants";
import Types from "../../../constants/Types";
import MyRequest from "../../../constants/interfaces/MyRequest";
import { NextFunction, Request, Response } from "express";


@injectable()
export class AllParams {
  constructor(
    @inject(Types.HandlerService) private _handlerService: IHandlerService,
    @inject(Types.Constants) private _constants: IConstants,
  ) {

  }
  configuration(req: Request, res: Response, next: NextFunction): void {
    (req as MyRequest).allParams = Object.assign({}, req.body, req.query);
    next();
  }
}

