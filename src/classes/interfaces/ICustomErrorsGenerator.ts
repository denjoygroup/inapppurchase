import { CustomError } from "../CustomErrorsGenerator";
import ErrorsTypes from "../../constants/enums/ErrorsTypes";

export default interface ICustomErrorsGenerator {
    types: typeof ErrorsTypes;
    generateError(type: ErrorsTypes, message?: string): CustomError;
    isCustomError(error: Error): error is CustomError;

}
