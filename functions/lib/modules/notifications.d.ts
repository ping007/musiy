/// <reference types="express" />
import * as functions from "firebase-functions";
import { Postgres } from "./common/dao";
export declare const select_notifications_by_user_id: functions.TriggerAnnotated & ((req: functions.Request<import("express-serve-static-core").ParamsDictionary>, resp: functions.Response<any>) => void | Promise<void>) & functions.Runnable<any>;
export declare const upsert_notification: functions.TriggerAnnotated & ((req: functions.Request<import("express-serve-static-core").ParamsDictionary>, resp: functions.Response<any>) => void | Promise<void>) & functions.Runnable<any>;
export declare const trnInsertNotification: (db: Postgres, actionFromUserId: string, actionToUserId: string, notificationType: number, isConfirmed: boolean, message: string, contentUri: string) => Promise<any>;
