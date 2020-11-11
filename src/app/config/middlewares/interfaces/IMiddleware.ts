import { IncomingMessage, ServerResponse } from "http";
import { NextFunction } from "express";

export default interface IMiddleware {
  configuration(req: IncomingMessage, res: ServerResponse, next: NextFunction): void;
}