/// <reference types="express" />
import * as functions from "firebase-functions";
import { Postgres } from "./common/dao";
export declare const select_points_by_user_id: functions.TriggerAnnotated & ((req: functions.Request<import("express-serve-static-core").ParamsDictionary>, resp: functions.Response<any>) => void | Promise<void>) & functions.Runnable<any>;
export declare const trnInsertPoint: (db: Postgres, userId: string, point: number, pointType: string, crUserId: string) => Promise<any>;
export declare const insert_point: functions.TriggerAnnotated & ((req: functions.Request<import("express-serve-static-core").ParamsDictionary>, resp: functions.Response<any>) => void | Promise<void>) & functions.Runnable<any>;
export declare const trnSelectCurrentPoint: (db: Postgres, userId: string) => Promise<any>;
