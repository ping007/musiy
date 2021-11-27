/// <reference types="express" />
import * as functions from "firebase-functions";
export declare const upsert_play_later: functions.TriggerAnnotated & ((req: functions.Request<import("express-serve-static-core").ParamsDictionary>, resp: functions.Response<any>) => void | Promise<void>) & functions.Runnable<any>;
