import {Request} from 'express';

export default interface MyRequest extends Request {
  allParams: any
  timeInMilliseconds: number
}
