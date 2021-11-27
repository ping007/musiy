/// <reference types="express" />
import * as functions from "firebase-functions";
export declare const select_user_by_user_id: functions.TriggerAnnotated & ((req: functions.Request<import("express-serve-static-core").ParamsDictionary>, resp: functions.Response<any>) => void | Promise<void>) & functions.Runnable<any>;
export declare const select_new_artist_users: functions.TriggerAnnotated & ((req: functions.Request<import("express-serve-static-core").ParamsDictionary>, resp: functions.Response<any>) => void | Promise<void>) & functions.Runnable<any>;
export declare const select_artist_users_by_genre: functions.TriggerAnnotated & ((req: functions.Request<import("express-serve-static-core").ParamsDictionary>, resp: functions.Response<any>) => void | Promise<void>) & functions.Runnable<any>;
export declare const select_following_artist_users: functions.TriggerAnnotated & ((req: functions.Request<import("express-serve-static-core").ParamsDictionary>, resp: functions.Response<any>) => void | Promise<void>) & functions.Runnable<any>;
export declare const upsert_user: functions.TriggerAnnotated & ((req: functions.Request<import("express-serve-static-core").ParamsDictionary>, resp: functions.Response<any>) => void | Promise<void>) & functions.Runnable<any>;
export declare const update_user_latest_login_datetime: functions.TriggerAnnotated & ((req: functions.Request<import("express-serve-static-core").ParamsDictionary>, resp: functions.Response<any>) => void | Promise<void>) & functions.Runnable<any>;
export declare const update_user_is_artist: functions.TriggerAnnotated & ((req: functions.Request<import("express-serve-static-core").ParamsDictionary>, resp: functions.Response<any>) => void | Promise<void>) & functions.Runnable<any>;
