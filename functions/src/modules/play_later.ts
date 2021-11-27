import * as functions from "firebase-functions";
import { execSingleQueryWithParams } from "./common/dao";

const sql_exist_play_later = `
    SELECT EXISTS
		(SELECT * FROM play_later
      WHERE user_id = $1 AND content_id = $2)`;

/**
 * "あとで聴く"リストに存在するか判定する
 * @param userId
 * @param contentId
 */
const existPlayLater = function(userId: string, contentId: string) {
  const params = [userId, contentId];
  return execSingleQueryWithParams(sql_exist_play_later, params);
};

export const exist_play_later = functions
  .region("asia-northeast1")
  .https.onCall((data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "The function must be called " + "while authenticated."
      );
    }
    if (!data.contentId) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "data.contentId is undefined.",
        data
      );
    }
    return existPlayLater(context.auth.uid, data.contentId).then((result) => {
      return result;
    });
  });

const sql_upsert_play_later = `
INSERT INTO play_later (user_id, content_id, cr_datetime)
  VALUES ($1, $2, now())
  ON CONFLICT ON CONSTRAINT play_later_pkey
  DO UPDATE SET user_id=$1, content_id=$2, cr_datetime=now()
`;

const upsertPlayLater = function(userId: string, contentId: string) {
  const params = [userId, contentId];
  return execSingleQueryWithParams(sql_upsert_play_later, params);
};

export const upsert_play_later = functions
  .region("asia-northeast1")
  .https.onCall((data, context) => {
    return upsertPlayLater(data.userId, data.contentId).then((result) => {
      return result;
    });
  });

const sql_delete_play_later = `
    DELETE FROM play_later 
      WHERE user_id = $1 
      AND content_id = $2`;

/**
 * "あとで聴く"リストから削除する
 * @param userId
 * @param contentId
 */
const deletePlayLater = function(userId: string, contentId: string) {
  const params = [userId, contentId];
  return execSingleQueryWithParams(sql_delete_play_later, params);
};

export const delete_play_later = functions
  .region("asia-northeast1")
  .https.onCall((data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "The function must be called " + "while authenticated."
      );
    }
    if (!data.contentId) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "data.contentId is undefined.",
        data
      );
    }
    return deletePlayLater(context.auth.uid, data.contentId).then((result) => {
      return result;
    });
  });
