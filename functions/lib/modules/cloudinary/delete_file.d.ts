/// <reference types="express" />
import * as functions from "firebase-functions";
export declare const delete_file_by_public_id: functions.TriggerAnnotated & ((req: functions.Request<import("express-serve-static-core").ParamsDictionary>, resp: functions.Response<any>) => void | Promise<void>) & functions.Runnable<any>;
