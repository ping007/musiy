/// <reference types="express" />
import * as functions from "firebase-functions";
import { Postgres } from "./common/dao";
export declare const select_purchased_contents_by_user_id: functions.TriggerAnnotated & ((req: functions.Request<import("express-serve-static-core").ParamsDictionary>, resp: functions.Response<any>) => void | Promise<void>) & functions.Runnable<any>;
export declare const upsert_purchased_content: functions.TriggerAnnotated & ((req: functions.Request<import("express-serve-static-core").ParamsDictionary>, resp: functions.Response<any>) => void | Promise<void>) & functions.Runnable<any>;
export declare const trnCancelPurchaseByPurchaseId: (db: Postgres, purchaseId: string, userId: string, upUserId: string) => Promise<any>;
export declare const trnInsertPurchasedContent: (db: Postgres, contentId: string, contentType: string, userId: string, price: number, crUserId: string) => Promise<any>;
export declare const trnSelectValidPurchasedContent: (db: Postgres, purchaseId: string, UserId: string) => Promise<any>;
