import { IncomingMessage } from "http";
import * as https from "https";
import { inject, injectable } from "inversify";
import url from "url";
import IConstants from '../constants/interfaces/IConstants';
import Types from "../constants/Types";
import IHandlerService from "./interfaces/IHandlerService";
import readline from 'readline';


@injectable()
export default class HandlerService implements IHandlerService {

  constructor(
    @inject(Types.Constants) private _constants: IConstants
  ) {

  }

  assign<B, E>(base: B, extension: E, ): B & E {
    return Object.assign(base, extension);
  }

  toArrayOfIds(array: any[]) {
    let arrayOfIds: number[] = [];
    array.forEach(item => {
      if (!item) return;
      if (typeof item === 'number') arrayOfIds.push(item);
      else if (item.id !== undefined) arrayOfIds.push(item.id);
    })
    return arrayOfIds;
  }

  toId(item: any): number {
    if (typeof item === 'number') return item;
    if (typeof item.id !== 'number') throw new Error(`Not found id in item ${JSON.stringify(item)}`);
    return item.id;
  }


  sendHttp(option: any, body: any = null, cookie: any = null) {
    return new Promise((resolve, reject) => {

      let defaultOptions: any = {
        method: 'GET',
        host: '127.0.0.1',
        port: 443
      }

      if (body && (!option.headers || !option.headers['Content-Type'])) {
        if (!defaultOptions.headers) defaultOptions.headers = {};
        defaultOptions.headers['Content-Type'] = 'application/json';
      }

      if (cookie) {
        if (!defaultOptions.headers) defaultOptions.headers = {};
        defaultOptions.headers['cookie'] = cookie;
      }

      Object.assign(defaultOptions, option);


      let request = https.request(defaultOptions, (response: IncomingMessage) => {
        response.setEncoding('utf8');
        let data = '';

        response.on('data', (chunk) => {
          data += chunk;
        })

        response.on('close', (endData: any) => {
          if (/^3[0-9]+/.test(response.statusCode!.toString())) {
            let parsedUrl = url.parse(response.headers.location!);
            option.host = parsedUrl.host;
            option.path = parsedUrl.path;
            let cookie = response.headers['set-cookie'];

            this.sendHttp(option, body, cookie)
                .then((data: any) => {
                  resolve(data);
                }, (err: any) => {
                  reject(err);
                })
            return
          }
          if (response.statusCode !== 200) return reject(data);
          resolve(data);
        })
      })

      request.on('error', (err) => {
        reject(err);
      })

      if (body && typeof body === 'object') request.write(JSON.stringify(body));
      request.end();
    })
  }

  prompt<T>(rl: readline.Interface, question: string, answers?: {number: number, value: T}[]): Promise<T | string> {
    return new Promise((resolve, reject) => {
      rl.question(question, function(usersAnswer) {
        if (answers) {
          let result = answers.find(answer => parseInt(usersAnswer) === answer.number);
          if (!result) throw new Error('Incorrect answer');
          return resolve(result.value);
        } else {
          return resolve(usersAnswer);
        }
      })
    })
  }

};
