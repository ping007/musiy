import * as functions from "firebase-functions";
import * as Handlebars from "handlebars";
import {
  execMultiQueryWithTransaction,
  execSingleQueryWithParams,
  Postgres,
} from "./common/dao";
import { trnInsertPoint, trnSelectCurrentPoint } from "./points";
import {
  trnCancelPurchaseByPurchaseId,
  trnSelectValidPurchasedContent,
  trnInsertPurchasedContent,
} from "./purchased_contents";
import { trnInsertNotification } from "./notifications";
import { sendMail } from "./mail/mailer";
import { trnSelectValidUserByUserId } from "./users";
import {
  cancelOneBroadcastMailContext,
  cancelOneBroadcastMailTitle,
} from "./mail/template/cancel_one_broadcast";
import {
  purchasedBroadcastMailContext,
  purchasedBroadcastMailTitle,
} from "./mail/template/purchased_broadcast";
import {
  cancelBroadcastTicketMailContext,
  cancelBroadcastTicketMailTitle,
} from "./mail/template/cancel_broadcast_ticket";
import { trnInsertTickets } from "./tickets";
import { imageflux_delete_channel } from "../modules/imageflux/api";
const runtimeOpts: any = {
  memory: "2GB",
};

const broadcast_columns_name = `
  table_name.broadcast_id AS "broadcastId",
  table_name.user_id AS "userId",
  table_name.fee AS "fee",
  table_name.title AS "title",
  to_char(table_name.broadcast_datetime,'YYYY/MM/DD HH24:MI:SS') AS "broadcastDatetime",
  table_name.explanation AS "explanation",
  table_name.image_id AS "imageId",
  to_char(table_name.deleted_datetime,'YYYY/MM/DD HH24:MI:SS') AS "deletedDatetime",
  table_name.artists AS "artists",
  table_name.is_finished AS "isFinished",
  table_name.allow_type AS "allowType",
  table_name.imageflux_channel_info AS "imagefluxChannelInfoStr"
`;
const table_name_regex = /table_name/g;

const sql_insert_broadcast = `
INSERT INTO broadcasts (
  broadcast_id, user_id, fee, title, broadcast_datetime, explanation, image_id, artists, allow_type, imageflux_channel_info,
  cr_user_id, cr_datetime, up_user_id, up_datetime
)
VALUES ( $1, $2, $3, $4, TO_TIMESTAMP($5,'YYYY-MM-DD HH24:MI:SS'), $6, $7, $8, $9, $10, $2, now(), $2, now())
`;

const trnInsertBroadcast = async function(
  db: Postgres,
  broadcastId: string,
  userId: string,
  fee: number,
  title: string,
  broadcastDatetime: any,
  explanation: string,
  imageId: string,
  artists: string,
  allowType: number,
  imagefluxChannelInfoStr: string
) {
  const params = [
    broadcastId,
    userId,
    String(fee),
    title,
    broadcastDatetime,
    explanation,
    imageId,
    artists,
    String(allowType),
    imagefluxChannelInfoStr,
  ];
  return await db.execute(sql_insert_broadcast, params);
};

export const insert_broadcast = functions
  .region("asia-northeast1")
  .https.onCall((data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "The function must be called " + "while authenticated."
      );
    }

    return execMultiQueryWithTransaction(
      trnInsertBroadcast,
      data.broadcastId,
      context.auth?.uid,
      data.fee,
      data.title,
      data.broadcastDatetime,
      data.explanation,
      data.imageId,
      data.artists,
      data.allowType,
      data.imagefluxChannelInfoStr
    ).then((result) => {
      return result;
    });
  });

const sql_select_broadcasts = `
SELECT
  ${broadcast_columns_name.replace(table_name_regex, "s")},
  u.username AS "username",
  u.image_id AS "userImageId",
  allowed_contents.plan_id AS "planId",
  allowed_contents.plan_name AS "planName",
  allowed_contents.plan_price AS "planPrice"
FROM broadcasts AS s
INNER JOIN users as u ON u.user_id = s.user_id
LEFT JOIN allowed_contents
  ON s.broadcast_id = allowed_contents.content_id
WHERE s.user_id = $1 AND u.deleted_datetime is null
ORDER BY s.broadcast_datetime DESC
`;

/**
 * 通常会員用画面でアーティストごとの配信一覧をアーティストのUserIdを指定して取得
 * @param db
 * @param userId
 */
const trnSelectBroadcast = async function(db: Postgres, userId: string) {
  const params = [userId];
  return await db.execute(sql_select_broadcasts, params);
};

export const select_broadcasts_by_user_id = functions
  .region("asia-northeast1")
  .https.onCall((data, _) => {
    if (!data.userId) {
      console.log("data.userId is not found");
      throw new functions.https.HttpsError(
        "invalid-argument",
        "data.userId is undefined.",
        data
      );
    }
    return execMultiQueryWithTransaction(trnSelectBroadcast, data.userId).then(
      (result) => {
        return result;
      }
    );
  });

const sql_select_top100_new_broadcasts = `
SELECT
  ${broadcast_columns_name.replace(table_name_regex, "s")},
  u.username AS "username",
  u.image_id AS "userImageId",
  purchased_contents.price AS "purchasedPrice",
  to_char(purchased_contents.cr_datetime,'YYYY/MM/DD HH24:MI:SS') AS "purchasedDatetime"
FROM broadcasts AS s
LEFT JOIN users as u ON u.user_id = s.user_id
LEFT JOIN purchased_contents
  ON s.broadcast_id = purchased_contents.content_id
  AND
  purchased_contents.user_id = $1
WHERE s.allow_type = 1
AND s.broadcast_datetime >= now() - INTERVAL '3 HOURS'
ORDER BY s.broadcast_datetime DESC
LIMIT 100
`;

/**
 * 通常会員用画面で新着100件の配信一覧を取得
 * @param db
 * @param userId
 */
const trnSelectTop100NewBroadcast = async function(
  db: Postgres,
  userId: string
) {
  const params = [userId];
  return await db.execute(sql_select_top100_new_broadcasts, params);
};

export const select_top_100_new_broadcasts = functions
  .region("asia-northeast1")
  .https.onCall((data, _) => {
    if (!data.userId) {
      console.log("data.userId is not found");
      throw new functions.https.HttpsError(
        "invalid-argument",
        "data.userId is undefined.",
        data
      );
    }
    return execMultiQueryWithTransaction(
      trnSelectTop100NewBroadcast,
      data.userId
    ).then((result) => {
      return result;
    });
  });

const sql_select_one_broadcast = `
SELECT ${broadcast_columns_name.replace(table_name_regex, "s")}
FROM broadcasts AS s INNER JOIN users as u ON u.user_id = s.user_id
WHERE s.broadcast_id = $1 AND u.deleted_datetime is null
`;

/**
 * 通常会員用画面で配信IDを用いての配信取得
 */
const trnSelectOneBroadcast = async function(
  db: Postgres,
  broadcastId: string
) {
  const params = [broadcastId];
  return await db.execute(sql_select_one_broadcast, params);
};

export const selectBroadCastByBroadcastId = (broadcastId: string) => {
  return execMultiQueryWithTransaction(trnSelectOneBroadcast, broadcastId).then(
    (result) => {
      return result;
    }
  );
};

export const select_one_broadcast = functions
  .region("asia-northeast1")
  .https.onCall((data, _) => {
    if (!data.broadcastId) {
      console.log("data.broadcastId is not found");
      throw new functions.https.HttpsError(
        "invalid-argument",
        "data.broadcastId is undefined.",
        data
      );
    }
    return selectBroadCastByBroadcastId(data.broadcastId);
  });

const sql_select_broadcast_purchased = `
  SELECT pc.purchase_id AS "purchaseId", pc.user_id AS "userId", pc.price, s.title, u.email, u.username
  FROM broadcasts AS s
  INNER JOIN purchased_contents AS pc ON pc.content_id = s.broadcast_id
  INNER JOIN users AS u ON pc.user_id = u.user_id
  WHERE s.user_id = $1
    AND s.broadcast_datetime > now()
    AND s.deleted_datetime IS NULL
    AND pc.content_id=$2
    AND pc.cancelled_datetime IS NULL
`;
export const trnSelectBroadcastPurchased = async function(
  db: Postgres,
  userId: string,
  contentId: string
) {
  return await db.execute(sql_select_broadcast_purchased, [userId, contentId]);
};

const sql_cancel_one_broadcast = `
  UPDATE  broadcasts
  SET  deleted_datetime = now(), up_user_id = $1, up_datetime = now()
  WHERE user_id = $1 AND broadcast_id = $2
`;
/**
 * アーティスト用配信キャンセル
 * @param db
 * @param userId
 * @param broadcastId
 */
const trnCancelOneBroadcast = async function(
  db: Postgres,
  userId: string,
  broadcastId: string
) {
  const users = (await trnSelectBroadcastPurchased(db, userId, broadcastId))
    .rows;
  const userProcess = [];
  for (const user of users) {
    // 購入していたユーザにポイントを戻す
    userProcess.push(
      trnInsertPoint(db, user.userId, user.price, "add", userId)
    );
    // 購入していたユーザのチケットをキャンセルにする
    userProcess.push(
      trnCancelPurchaseByPurchaseId(db, user.purchaseId, user.userId, userId)
    );
  }
  await Promise.all(userProcess);
  // 配信をキャンセルする
  const res = await db.execute(sql_cancel_one_broadcast, [userId, broadcastId]);
  // キャンセルした人にメールを送信する
  const sentMail = [];
  const template = Handlebars.compile(cancelOneBroadcastMailContext);
  for (const user of users) {
    const content = template({
      user: { name: user.username },
      broadcast: { title: user.title },
    });
    sentMail.push(sendMail(user.email, cancelOneBroadcastMailTitle, content));
  }
  await Promise.all(sentMail);
  return res;
};

export const cancel_one_broadcast = functions
  .region("asia-northeast1")
  .https.onCall((data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "The function must be called " + "while authenticated."
      );
    }
    if (!data.broadcastId) {
      console.log("data.broadcastId is not found");
      throw new functions.https.HttpsError(
        "invalid-argument",
        "data.broadcastId is undefined.",
        data
      );
    }
    return execMultiQueryWithTransaction(
      trnCancelOneBroadcast,
      context.auth?.uid,
      data.broadcastId
    ).then((result) => {
      return result;
    });
  });

const sql_select_one_full_statement_of_broadcast = `
SELECT DISTINCT
  ${broadcast_columns_name.replace(table_name_regex, "s")},
  s.cr_user_id AS "crUserId",
  to_char(s.cr_datetime,'YYYY/MM/DD HH24:MI:SS') AS "crDatetime",
  s.up_user_id AS "upUserId",
  to_char(s.up_datetime,'YYYY/MM/DD HH24:MI:SS') AS "upDatetime",
  SUM(CASE WHEN s.cancelled_datetime IS NULL THEN s.price ELSE 0 END) OVER(PARTITION BY s.broadcast_id ORDER BY s.broadcast_id) AS "totalSalesAmount",
  SUM(s.total_user) OVER(PARTITION BY s.broadcast_id ORDER BY s.broadcast_id) AS "totalUserCount",
  SUM(s.join_user) OVER(PARTITION BY s.broadcast_id ORDER BY s.broadcast_id) AS "joinUserCount",
  SUM(s.cancelled_user) OVER(PARTITION BY s.broadcast_id ORDER BY s.broadcast_id) AS "cancelledUserCount"
FROM (SELECT
        s.*,
        p.price,
        CASE WHEN p.cr_datetime IS NOT NULL THEN 1 ELSE 0 END AS total_user,
        CASE WHEN p.cr_datetime IS NOT NULL AND p.cancelled_datetime IS NULL THEN 1 ELSE 0 END AS join_user,
        CASE WHEN p.cr_datetime IS NOT NULL AND  p.cancelled_datetime IS NOT NULL THEN 1 ELSE 0 END AS cancelled_user,
        p.cancelled_datetime
      FROM broadcasts AS s LEFT OUTER JOIN purchased_contents AS p on s.broadcast_id = p.content_id AND p.content_type='ticket'
      WHERE s.user_id = $1 AND s.broadcast_id = $2
     ) AS s;
`;

/**
 * アーティストの管理画面用の配信取得
 *   購入者数やキャンセル数、売上を取得しています。
 * @param db
 * @param userId
 * @param broadcastId
 */
const trnSelectOneFullStatementOfBroadcast = async function(
  db: Postgres,
  userId: string,
  broadcastId: string
) {
  const params = [userId, broadcastId];
  return await db.execute(sql_select_one_full_statement_of_broadcast, params);
};

export const select_one_full_statement_of_broadcast = functions
  .region("asia-northeast1")
  .https.onCall((data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "The function must be called " + "while authenticated."
      );
    }
    if (!data.broadcastId) {
      console.log("data.broadcastId is not found");
      throw new functions.https.HttpsError(
        "invalid-argument",
        "data.broadcastId is undefined.",
        data
      );
    }
    return execMultiQueryWithTransaction(
      trnSelectOneFullStatementOfBroadcast,
      context.auth?.uid,
      data.broadcastId
    ).then((result) => {
      return result;
    });
  });

const sql_update_broadcast = `
UPDATE  broadcasts
SET title = $3, explanation = $4, image_id = $5, artists = $6, up_user_id = $1, up_datetime = now()
WHERE user_id = $1 AND broadcast_id = $2 AND deleted_datetime is null
`;

const trnUpdateBroadcast = async function(
  db: Postgres,
  userId: string,
  broadcastId: string,
  title: string,
  explanation: string,
  imageId: string,
  artists: string
) {
  const users = (await trnSelectBroadcastPurchased(db, userId, broadcastId))
    .rows;
  // 購入していたユーザに通知を送る
  const NotificationType = 5; // 配信更新（constant.jsで定義）
  for (const user of users) {
    const message = `「${title}」の配信情報が更新されました。`;
    await trnInsertNotification(
      db,
      userId,
      user.userId,
      NotificationType,
      false,
      message,
      ""
    );
  }
  // 配信を更新
  const params = [userId, broadcastId, title, explanation, imageId, artists];
  return await db.execute(sql_update_broadcast, params);
};

export const update_broadcast = functions
  .region("asia-northeast1")
  .https.onCall((data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "The function must be called " + "while authenticated."
      );
    }
    if (!data.broadcastId) {
      console.log("data.broadcastId is not found");
      throw new functions.https.HttpsError(
        "invalid-argument",
        "data.broadcastId is undefined.",
        data
      );
    }
    return execMultiQueryWithTransaction(
      trnUpdateBroadcast,
      context.auth?.uid,
      data.broadcastId,
      data.title,
      data.explanation,
      data.imageId,
      data.artists
    ).then((result) => {
      return result;
    });
  });

const sql_select_full_statement_of_broadcasts = `
SELECT DISTINCT
  ${broadcast_columns_name.replace(table_name_regex, "s2")},
  s2.cr_user_id AS "crUserId",
  to_char(s2.cr_datetime,'YYYY/MM/DD HH24:MI:SS') AS "crDatetime",
  s2.up_user_id AS "upUserId",
  to_char(s2.up_datetime,'YYYY/MM/DD HH24:MI:SS') AS "upDatetime",
  SUM(CASE WHEN s2.cancelled_datetime IS NULL THEN s2.price ELSE 0 END) OVER(PARTITION BY s2.broadcast_id ORDER BY s2.broadcast_id) AS "totalSalesAmount",
  SUM(s2.total_user) OVER(PARTITION BY s2.broadcast_id ORDER BY s2.broadcast_id) AS "totalUserCount",
  SUM(s2.join_user) OVER(PARTITION BY s2.broadcast_id ORDER BY s2.broadcast_id) AS "joinUserCount",
  SUM(s2.cancelled_user) OVER(PARTITION BY s2.broadcast_id ORDER BY s2.broadcast_id) AS "cancelledUserCount"
FROM (SELECT
        s.*,
        p.price,
        CASE WHEN p.cr_datetime IS NOT NULL THEN 1 ELSE 0 END AS total_user,
        CASE WHEN p.cr_datetime IS NOT NULL AND p.cancelled_datetime IS NULL THEN 1 ELSE 0 END AS join_user,
        CASE WHEN p.cr_datetime IS NOT NULL AND  p.cancelled_datetime IS NOT NULL THEN 1 ELSE 0 END AS cancelled_user,
        p.cancelled_datetime
      FROM broadcasts AS s LEFT OUTER JOIN purchased_contents AS p on s.broadcast_id = p.content_id AND p.content_type='ticket'
      WHERE s.user_id = $1
     ) AS s2
ORDER BY "crDatetime" DESC
`;

/**
 * アーティストの管理画面用の配信一覧取得
 *   購入者数やキャンセル数、売上を取得しています。
 * @param db
 * @param userId
 */
const trnSelectFullStatementOfBroadcasts = async function(
  db: Postgres,
  userId: string
) {
  const params = [userId];
  return await db.execute(sql_select_full_statement_of_broadcasts, params);
};

export const select_full_statement_of_broadcasts = functions
  .region("asia-northeast1")
  .https.onCall((data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "The function must be called " + "while authenticated."
      );
    }
    return execMultiQueryWithTransaction(
      trnSelectFullStatementOfBroadcasts,
      context.auth?.uid
    ).then((result) => {
      return result;
    });
  });

const query_select_one_valid_ticket_by_content_id = `
  SELECT
    ${broadcast_columns_name.replace(table_name_regex, "s")},
    pc.purchase_id AS "purchaseId",
    pc.content_id AS "contentId",
    pc.content_type AS "contentType",
    pc.user_id AS "purchasedUserId",
    pc.price AS "price",
    pc.cr_datetime  AS "crDatetime"
  FROM purchased_contents AS pc INNER JOIN broadcasts AS s ON s.broadcast_id = pc.content_id
  WHERE pc.user_id=$1 AND pc.content_id=$2 AND pc.content_type='ticket' AND pc.cancelled_datetime IS NULL
`;
const trnSelectOneValidTicketByContentId = async function(
  db: Postgres,
  userId: string,
  broadcastId: string
) {
  return await db.execute(query_select_one_valid_ticket_by_content_id, [
    userId,
    broadcastId,
  ]);
};

const query_select_tickets_by_user_id = `
  SELECT ${broadcast_columns_name.replace(
    table_name_regex,
    "s"
  )}, pc.purchase_id AS "purchaseId",
    pc.content_id AS "contentId",
    pc.content_type AS "contentType",
    pc.user_id AS "purchasedUserId",
    pc.price AS "price",
    pc.cr_datetime  AS "crDatetime",
    pc.cancelled_datetime AS "cancelledDatetime",
    u.username AS "username",
    u.image_id AS "userImageId"
  FROM purchased_contents AS pc
  INNER JOIN broadcasts AS s ON s.broadcast_id = pc.content_id
  INNER JOIN tickets AS t ON pc.purchase_id = t.purchase_id
  INNER JOIN users as u ON u.user_id = s.user_id
  WHERE pc.user_id=$1 AND pc.content_type='ticket' AND t.is_watched = $2
  ORDER BY s.broadcast_datetime DESC
`;
/**
 * 購入したチケットの一覧
 * @param db
 * @param userId
 * @param isWatched
 */
const trnSelectTicketsByUserId = async function(
  db: Postgres,
  userId: string,
  isWatched: boolean
) {
  return await db.execute(query_select_tickets_by_user_id, [userId, isWatched]);
};
export const select_tickets_by_user_id = functions
  .region("asia-northeast1")
  .https.onCall((data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "The function must be called " + "while authenticated."
      );
    }
    return execMultiQueryWithTransaction(
      trnSelectTicketsByUserId,
      context.auth?.uid,
      !!data.isWatched
    ).then((result) => {
      return result;
    });
  });
/**
 * チケット購入
 * @param db
 * @param userId
 * @param broadcastId
 */
const trnPurchaseBroadcastTicket = async function(
  db: Postgres,
  userId: string,
  broadcastId: string
) {
  // 購入対象の配信情報を取得
  const broadcast = (await trnSelectOneBroadcast(db, broadcastId)).rows[0];
  // ポイントが足りているかチェック
  const currentPoint = (await trnSelectCurrentPoint(db, userId)).rows[0]
    .total_points;
  if (parseInt(currentPoint) < parseInt(broadcast.fee)) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "Not enough points"
    );
  }
  // 既に買っているか確認
  if (
    (await trnSelectOneValidTicketByContentId(db, userId, broadcastId)).rows
      .length >= 1
  ) {
    throw new functions.https.HttpsError(
      "already-exists",
      "You have already purchased the ticket"
    );
  }
  // ポイント消費
  await trnInsertPoint(db, userId, -broadcast.fee, "subtract", userId);
  // 購入テーブルへの登録
  const purchasedRes = await trnInsertPurchasedContent(
    db,
    broadcastId,
    "ticket",
    userId,
    broadcast.fee,
    userId
  );
  // チケットテーブルへの登録
  await trnInsertTickets(db, purchasedRes.id, userId);
  // 購入メールの送信
  const user = (await trnSelectValidUserByUserId(db, userId)).rows[0];
  const template = Handlebars.compile(purchasedBroadcastMailContext);
  const content = template({
    user: { name: user.username },
    broadcast: { title: broadcast.title },
  });
  await sendMail(user.email, purchasedBroadcastMailTitle, content);
  return purchasedRes.db_res;
};

export const purchase_broadcast_ticket = functions
  .region("asia-northeast1")
  .https.onCall((data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "The function must be called " + "while authenticated."
      );
    }
    if (!data.broadcastId) {
      console.log("data.broadcastId is not found");
      throw new functions.https.HttpsError(
        "invalid-argument",
        "data.broadcastId is undefined.",
        data
      );
    }
    return execMultiQueryWithTransaction(
      trnPurchaseBroadcastTicket,
      context.auth?.uid,
      data.broadcastId
    ).then((result) => {
      return result;
    });
  });
/**
 * 一般ユーザ用購入済チケットキャンセル
 * @param db
 * @param userId
 * @param purchaseId
 */
const trnCancelBroadcastTicket = async function(
  db: Postgres,
  userId: string,
  purchaseId: string
) {
  // キャンセル対象の購入情報を取得する
  const purchased = (
    await trnSelectValidPurchasedContent(db, purchaseId, userId)
  ).rows;
  if (purchased.length === 0) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "Purchased information not found"
    );
  }
  // ポイント回復
  await trnInsertPoint(db, userId, purchased[0].price, "add", userId);
  // 購入していたユーザのチケットをキャンセルにする
  const res = await trnCancelPurchaseByPurchaseId(
    db,
    purchaseId,
    userId,
    userId
  );
  // チケットキャンセルメールの送信
  const user = (await trnSelectValidUserByUserId(db, userId)).rows[0];
  const template = Handlebars.compile(cancelBroadcastTicketMailContext);
  const content = template({
    user: { name: user.username },
    purchase_id: purchaseId,
  });
  await sendMail(user.email, cancelBroadcastTicketMailTitle, content);
  return res;
};
export const cancel_broadcast_ticket = functions
  .region("asia-northeast1")
  .https.onCall((data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "The function must be called " + "while authenticated."
      );
    }
    if (!data.purchaseId) {
      console.log("data.purchaseId is not found");
      throw new functions.https.HttpsError(
        "invalid-argument",
        "data.purchaseId is undefined.",
        data
      );
    }
    return execMultiQueryWithTransaction(
      trnCancelBroadcastTicket,
      context.auth?.uid,
      data.purchaseId
    ).then((result) => {
      return result;
    });
  });

const sql_select_broadcast_by_broadcasts_ids = `
  SELECT ${broadcast_columns_name.replace(table_name_regex, "broadcasts")} 
  FROM broadcasts 
  WHERE broadcasts.broadcast_id = ANY($1)
`;

export const selectBroadCastByBroadCastIds = function(broadcastIds: Array<string>) {
  const params = [broadcastIds];
  return execSingleQueryWithParams(sql_select_broadcast_by_broadcasts_ids, params);
};

export const select_broadcast_by_broadcasts_ids = functions
  .region("asia-northeast1")
  .runWith(runtimeOpts)
  .https.onCall((data, context) => {
    return selectBroadCastByBroadCastIds(data.broadcastIds).then((result) => {
      return result;
    });
  });

const query_finish_broadcast = `
  UPDATE  broadcasts
  SET  is_finished = true, up_user_id = $1, up_datetime = now()
  WHERE user_id = $1 AND broadcast_id = $2
`;

const trnFinishBroadcast = async function(
  db: Postgres,
  userId: string,
  broadcastId: string
) {
  return await db.execute(query_finish_broadcast, [userId, broadcastId]);
};

export const finish_broadcast = functions
  .region("asia-northeast1")
  .https.onCall((data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "The function must be called " + "while authenticated."
      );
    }
    if (!data.broadcastId) {
      console.log("data.broadcastId is not found");
      throw new functions.https.HttpsError(
        "invalid-argument",
        "data.broadcastId is undefined.",
        data
      );
    }
    return execMultiQueryWithTransaction(
      trnFinishBroadcast,
      context.auth?.uid,
      data.broadcastId
    ).then((result) => {
      return result;
    });
  });

const sql_select_finished_broadcast_targets = `
  SELECT
    broadcasts.broadcast_id AS "broadcastId",
    broadcasts.imageflux_channel_info AS "imagefluxChannelInfo"
  FROM broadcasts
  WHERE
  broadcasts.is_finished = FALSE 
  AND broadcasts.deleted_datetime IS NULL
  AND broadcasts.imageflux_channel_info IS NOT NULL
  AND broadcasts.broadcast_datetime < now() + INTERVAL '6 HOURS'
`;

const selectFinishedBroadcastTargets = function() {
  const params = [];
  return execSingleQueryWithParams(
    sql_select_finished_broadcast_targets,
    params
  );
};

const sql_update_finished_broadcast_with_batch = `
  UPDATE broadcasts
  SET is_finished = true, up_user_id = 'system_auto_batch', up_datetime = now()
  WHERE
  broadcasts.is_finished = FALSE 
  AND broadcasts.deleted_datetime IS NULL
  AND broadcasts.broadcast_datetime < now() + INTERVAL '6 HOURS'  
`;
// INTERVAL : UTC + 9 Hours(JST) - 3Hours(broadcasst limit time) = 6Hours

const updateFinishedBroadcastsWithBatch = function() {
  const params = [];
  return execSingleQueryWithParams(
    sql_update_finished_broadcast_with_batch,
    params
  );
};

const exec_update_finished_broadcast_with_batch = async function() {
  const results: any = await selectFinishedBroadcastTargets();
  if (results && results.rows && results.rows.length > 0) {
    results.rows.forEach(async (row) => {
      const info = JSON.parse(row.imagefluxChannelInfo);
      const data: any = {
        channel_id: info.data.channel_id,
      };
      await imageflux_delete_channel(data, null);
    });
    await updateFinishedBroadcastsWithBatch();
  }
};

export const scheduled_1_hour_update_is_finish_broadcast = functions
  .region("asia-northeast1")
  .pubsub.schedule("every 1 hours")
  .timeZone("Asia/Tokyo")
  .onRun(async (context) => {
    await exec_update_finished_broadcast_with_batch();
    console.log("配信完了バッチ処理完了");
    return null;
  });
