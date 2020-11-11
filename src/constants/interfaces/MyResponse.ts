import {Response} from 'express';

export default interface MyResponse extends Response {
  customSend(data?: any, description?: any): any;
  handleError(error: Error, native?: boolean): any;
}
