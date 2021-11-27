import * as functions from "firebase-functions";
import { v4 as uuidv4 } from "uuid";
import { execSingleQueryWithParams, Postgres } from "./common/dao";

const sql_select_notifications_by_user_id = `
  SELECT
    notifications.notification_id AS "notificationId",
    notifications.action_from_user_id AS "actionFromUserId",
    notifications.action_to_user_id AS "actionToUserId",
    notifications.notification_type AS "notificationType",
    notifications.is_confirmed AS "isConfirmed",
    notifications.message AS "message",
    notifications.content_uri AS "contentUri",
    to_char(notifications.cr_datetime,'YYYY/MM/DD HH24:MI:SS') AS "crDatetime",
    users.image_id AS "imageId"
  FROM notifications
  INNER JOIN users on users.user_id = notifications.action_from_user_id
  WHERE notifications.action_to_user_id = $1
  ORDER BY notifications.cr_datetime DESC
`;

const selectNotificationsByUserId = function(userId: string) {
  const params = [userId];
  return execSingleQueryWithParams(sql_select_notifications_by_user_id, params);
};

export const select_notifications_by_user_id = functions
  .region("asia-northeast1")
  .https.onCall((data, context) => {
    return selectNotificationsByUserId(data.userId).then((result) => {
      return result;
    });
  });

const sql_upsert_notification = `
INSERT INTO notifications ( notification_id, action_from_user_id, action_to_user_id,
    notification_type, is_confirmed, message, content_uri, cr_datetime)
  VALUES ($1, $2, $3, $4, $5, $6, $7, now())
  ON CONFLICT ON CONSTRAINT notifications_pkey
  DO UPDATE SET notification_id=$1, action_from_user_id=$2, action_to_user_id=$3,
    notification_type=$4, is_confirmed=$5, message=$6, content_uri=$7
`;

const upsertNotification = function(
  notificationId: string,
  actionFromUserId: string,
  actionToUserId: string,
  notificationType: number,
  isConfirmed: boolean,
  message: string,
  contentUri: string
) {
  const params = [
    notificationId,
    actionFromUserId,
    actionToUserId,
    String(notificationType),
    String(isConfirmed),
    message,
    contentUri,
  ];
  return execSingleQueryWithParams(sql_upsert_notification, params);
};

export const upsert_notification = functions
  .region("asia-northeast1")
  .https.onCall((data, context) => {
    return upsertNotification(
      data.notificationId,
      data.actionFromUserId,
      data.actionToUserId,
      data.notificationType,
      data.isConfirmed,
      data.message,
      data.contentUri
    ).then((result) => {
      return result;
    });
  });

const sql_insert_notification = `
INSERT INTO notifications ( notification_id, action_from_user_id, action_to_user_id,
    notification_type, is_confirmed, message, content_uri, cr_datetime)
  VALUES ($1, $2, $3, $4, $5, $6, $7, now())
`;
export const trnInsertNotification = async function(
  db: Postgres,
  actionFromUserId: string,
  actionToUserId: string,
  notificationType: number,
  isConfirmed: boolean,
  message: string,
  contentUri: string
) {
  const params = [
    uuidv4(),
    actionFromUserId,
    actionToUserId,
    String(notificationType),
    String(isConfirmed),
    message,
    contentUri,
  ];
  return await db.execute(sql_insert_notification, params);
};
