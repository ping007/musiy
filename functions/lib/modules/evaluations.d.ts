/// <reference types="express" />
import * as functions from "firebase-functions";
export declare const select_evaluations_by_content_id: functions.TriggerAnnotated & ((req: functions.Request<import("express-serve-static-core").ParamsDictionary>, resp: functions.Response<any>) => void | Promise<void>) & functions.Runnable<any>;
export declare const select_evaluations_comments_by_content_id: functions.TriggerAnnotated & ((req: functions.Request<import("express-serve-static-core").ParamsDictionary>, resp: functions.Response<any>) => void | Promise<void>) & functions.Runnable<any>;
export declare const select_evaluations_is_liked_by_content_id: functions.TriggerAnnotated & ((req: functions.Request<import("express-serve-static-core").ParamsDictionary>, resp: functions.Response<any>) => void | Promise<void>) & functions.Runnable<any>;
export declare const select_evaluations_is_liked_by_content_id_and_user_id: functions.TriggerAnnotated & ((req: functions.Request<import("express-serve-static-core").ParamsDictionary>, resp: functions.Response<any>) => void | Promise<void>) & functions.Runnable<any>;
export declare const select_evaluations_by_user_id: functions.TriggerAnnotated & ((req: functions.Request<import("express-serve-static-core").ParamsDictionary>, resp: functions.Response<any>) => void | Promise<void>) & functions.Runnable<any>;
export declare const upsert_evaluation: functions.TriggerAnnotated & ((req: functions.Request<import("express-serve-static-core").ParamsDictionary>, resp: functions.Response<any>) => void | Promise<void>) & functions.Runnable<any>;
export declare const update_evaluations_is_show_comment_false: functions.TriggerAnnotated & ((req: functions.Request<import("express-serve-static-core").ParamsDictionary>, resp: functions.Response<any>) => void | Promise<void>) & functions.Runnable<any>;
