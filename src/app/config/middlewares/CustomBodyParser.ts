import { NextFunction } from "express";
import bodyParser from "body-parser";
import { IncomingMessage, ServerResponse } from "http";
import { inject } from "inversify";
import Types from "../../../constants/Types";
import IHandlerService from "../../../services/interfaces/IHandlerService";

export default class CustomBodyParser {
  constructor(
    @inject(Types.HandlerService) private _handlerService: IHandlerService
  ) {

  }
  configuration(req: IncomingMessage, res: ServerResponse, next: NextFunction) {
    return bodyParser.json({limit: '2mb'})(req, res, next);
  }
}
