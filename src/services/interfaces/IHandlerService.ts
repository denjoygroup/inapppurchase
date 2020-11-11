import MyRequest from "../../constants/interfaces/MyRequest";
import { IncomingMessage } from "http";
import readline from 'readline';


export default interface IHandlerService {
    assign<B, E>(base: B, extension: E): B & E;
    sendHttp(option: any, body?: any, cookie?: any): Promise<any>;
    toArrayOfIds(array: any[]): number[];
    toId(item: any): number;
    prompt<T>(rl: readline.Interface, question: string, anwers?: {number: number, value: T}[]): Promise<T>;
    prompt(rl: readline.Interface, question: string): Promise<string>;
    [key: string]: any
}
