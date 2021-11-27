import * as functions from "firebase-functions";
import { v4 as uuidv4 } from "uuid";
import {
  execMultiQueryWithTransaction,
  execSingleQueryWithParams,
  Postgres,
} from "./common/dao";
import { selectMovieByMovieId } from "./movies";
import { selectMusicByMusicId } from "./musics";
import { selectPlanByPlanId } from "./plans";
import { selectBroadCastByBroadcastId } from "./broadcasts";
import { trnInsertPoint, trnSelectCurrentPoint } from "./points";
import {
  trn_set_scheduled_payment,
  trnSelectScheduledPaymentsByUserId,
} from "./scheduled_payments";

const sql_select_purchased_contents_by_user_id = `
  SELECT
    purchased_contents.purchase_id AS "purchaseId",
    purchased_contents.content_id AS "contentId",
    purchased_contents.content_type AS "contentType",
    purchased_contents.user_id AS "userId",
    purchased_contents.price AS "price",
    purchased_contents.cr_user_id AS "crUserId",
    to_char(purchased_contents.cr_datetime,'YYYY/MM/DD HH24:MI:SS') AS "crDatetime"
  FROM purchased_contents
  WHERE purchased_contents.user_id = $1
  ORDER BY purchased_contents.cr_datetime DESC
`;

const selectPurchasedContentsByUserId = function(userId: string) {
  const params = [userId];
  return execSingleQueryWithParams(
    sql_select_purchased_contents_by_user_id,
    params
  );
};

export const select_purchased_contents_by_user_id = functions
  .region("asia-northeast1")
  .https.onCall((data, context) => {
    return selectPurchasedContentsByUserId(data.userId).then((result) => {
      return result;
    });
  });

const sql_select_purchased_contents_amount_by_artist_user_id = `
  Select SUM(purchased_contents.price) From purchased_contents 
  WHERE purchased_contents.content_id IN 
  (SELECT musics.music_id FROM musics 
  WHERE musics.user_id = $1)
  OR purchased_contents.content_id IN 
  (SELECT movies.movie_id FROM movies 
  WHERE movies.user_id = $1)
  OR purchased_contents.content_id IN 
  (SELECT broadcasts.broadcast_id FROM broadcasts 
  WHERE broadcasts.user_id = $1)
  OR purchased_contents.content_id IN 
  (SELECT plans.plan_id FROM plans 
  WHERE plans.user_id = $1)
`;

const selectPurchasedContentsAmountByArtistUserId = function(
  artistUserId: string
) {
  const params = [artistUserId];
  return execSingleQueryWithParams(
    sql_select_purchased_contents_amount_by_artist_user_id,
    params
  );
};

export const select_purchased_contents_amount_by_artist_user_id = functions
  .region("asia-northeast1")
  .https.onCall((data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "The function must be called " + "while authenticated."
      );
    }
    return selectPurchasedContentsAmountByArtistUserId(context.auth?.uid).then(
      (result) => {
        return result;
      }
    );
  });

const sql_select_purchased_media_by_specified_year = `
  SELECT
  purchased_contents.purchase_id AS "purchaseId",
  purchased_contents.content_id AS "contentId",
  purchased_contents.content_type AS "contentType",
  purchased_contents.user_id AS "userId",
  purchased_contents.price AS "price",
  purchased_contents.cr_user_id AS "crUserId",
  to_char(purchased_contents.cr_datetime,'YYYY/MM/DD HH24:MI:SS') AS "crDatetime"
  FROM purchased_contents
  WHERE (purchased_contents.content_type <> 'point')
  ORDER BY purchased_contents.cr_datetime DESC
`;

const selectPurchasedMediaBySpecifiedYear = function() {
  return execSingleQueryWithParams(
    sql_select_purchased_media_by_specified_year,
    []
  );
};

export const select_purchased_media_by_specified_year = functions
  .region("asia-northeast1")
  .https.onCall((data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "The function must be called " + "while authenticated."
      );
    }
    return selectPurchasedMediaBySpecifiedYear().then(
      (result) => {
        return result;
      }
    );
  });

/**
 * コンテンツの価格を取得
 * @param contentId
 */
const loadContentPrice = async (
  contentId: string,
  contentType: string,
  price: number
) => {
  let amount: number = -1;
  if (contentType === "point") {
    amount = price;
    // ポイント購入の場合はFront側から来た値をそのまま代入
    // なぜなら、値を改竄されたとしてもその値のぶんだけ
    // ポイントを買うだけの話のため
  } else if (contentType === "plan") {
    const result: any = await selectPlanByPlanId(contentId);
    if (result && result.rows && result.rows.length > 0) {
      const plan = result.rows[0];
      amount = plan.planPrice;
    }
  } else if (contentType === "music") {
    const result: any = await selectMusicByMusicId(contentId);
    if (result && result.rows && result.rows.length > 0) {
      const music = result.rows[0];
      amount = music.price;
    }
  } else if (contentType === "movie") {
    const result: any = await selectMovieByMovieId(contentId);
    if (result && result.rows && result.rows.length > 0) {
      const movie = result.rows[0];
      amount = movie.price;
    }
  } else if (contentType === "ticket") {
    const result: any = await selectBroadCastByBroadcastId(contentId);
    if (result && result.rows && result.rows.length > 0) {
      const broadcast = result.rows[0];
      amount = broadcast.fee;
    }
  }
  return amount;
};

/**
 * コンテンツ購入
 * @param db
 * @param userId
 * @param contentId
 * @param contentType
 * @param price
 */
export const trnPurchaseContent = async function(
  db: Postgres,
  userId: string,
  contentId: string,
  contentType: string,
  price: number
) {
  // 購入対象の価格を取得
  let amount: number = await loadContentPrice(contentId, contentType, price);

  // 応援プランの場合は価格調整が必要な場合がある
  if (contentType === "plan") {
    let payment = undefined;
    const resPayment = await trnSelectScheduledPaymentsByUserId(db, userId);
    if (resPayment && resPayment.rows && resPayment.rows.length > 0) {
      payment = resPayment.rows[0];
    }
    if (payment) {
      // 既に他のプランで支払いを行っている場合で高いプランにアップグレードした場合、
      // 例)100円のプランから300円のプランにアップグレードした場合
      // 支払額は差額の200円とする
      const planId = payment.contentId;
      const resultPlan: any = await selectPlanByPlanId(planId);
      if (resultPlan && resultPlan.rows && resultPlan.rows.length > 0) {
        const plan = resultPlan.rows[0];
        if (amount > plan.planPrice) {
          amount = amount - plan.planPrice;
        }
      }
    }
  }

  // ポイントが足りているかチェック
  const result = await trnSelectCurrentPoint(db, userId);
  let currentPoint: number = 0;
  if (result && result.rows[0] && result.rows[0].total_points) {
    currentPoint = result.rows[0].total_points;
  }
  currentPoint = Number(currentPoint);
  amount = Number(amount);
  if (contentType !== "point" && currentPoint < amount) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "Not enough points"
    );
  }
  if (amount < 0) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "Invalid price contents"
    );
  }
  // ポイント消費
  if (contentType === "point") {
    // ポイント購入の場合はポイントを追加
    await trnInsertPoint(db, userId, amount, "add", userId);
  } else {
    // ポイント購入以外の場合はポイントを消費
    await trnInsertPoint(db, userId, -1 * amount, "subtract", userId);
  }

  // 購入テーブルへの登録
  const purchasedRes = await trnInsertPurchasedContent(
    db,
    contentId,
    contentType,
    userId,
    amount,
    userId
  );
  if (contentType === "plan") {
    // 応援プランの場合は翌月以降分を定期支払いのテーブルに登録し、月初に自動でポイント消費
    await trn_set_scheduled_payment(db, contentId, contentType, userId, price);
  }
  return purchasedRes.db_res;
};

export const upsert_purchased_content = functions
  .region("asia-northeast1")
  .https.onCall((data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "The function must be called " + "while authenticated."
      );
    }
    if (!data.contentId) {
      console.log("data.broadcastId is not found");
      throw new functions.https.HttpsError(
        "invalid-argument",
        "data.contentId is undefined.",
        data
      );
    }
    return execMultiQueryWithTransaction(
      trnPurchaseContent,
      context.auth?.uid,
      data.contentId,
      data.contentType,
      data.price
    ).then((result) => {
      return result;
    });
  });

const sql_upsert_purchased_content = `
INSERT INTO purchased_contents ( purchase_id, content_id, content_type, user_id, price,
    cr_user_id, cr_datetime)
  VALUES ($1, $2, $3, $4, $5, $6, now())
  ON CONFLICT ON CONSTRAINT purchased_contents_pkey
  DO UPDATE SET purchase_id=$1, content_id=$2, content_type=$3,
    user_id=$4, price=$5
`;

const sql_cancel_purchase_by_purchase_id = `
UPDATE purchased_contents SET cancelled_datetime=now(), up_user_id=$3, up_datetime=now()
WHERE purchase_id=$1 AND user_id=$2 AND cancelled_datetime IS NULL
`;
export const trnCancelPurchaseByPurchaseId = async function(
  db: Postgres,
  purchaseId: string,
  userId: string,
  upUserId: string
) {
  // 購入していたユーザのコンテンツをキャンセルにする
  return await db.execute(sql_cancel_purchase_by_purchase_id, [
    purchaseId,
    userId,
    upUserId,
  ]);
};

export const trnInsertPurchasedContent = async function(
  db: Postgres,
  contentId: string,
  contentType: string,
  userId: string,
  price: number,
  crUserId: string
) {
  const purchaseId = uuidv4();
  const params = [
    purchaseId,
    contentId,
    contentType,
    userId,
    String(price),
    crUserId,
  ];
  return {
    id: purchaseId,
    db_res: await db.execute(sql_upsert_purchased_content, params),
  };
};

const sql_select_valid_purchased_content = `
  SELECT
    pc.purchase_id AS "purchaseId",
    pc.content_id AS "contentId",
    pc.content_type AS "contentType",
    pc.user_id AS "userId",
    pc.price AS "price",
    pc.cr_user_id AS "crUserId",
    to_char(pc.cr_datetime,'YYYY/MM/DD HH24:MI:SS') AS "crDatetime"
  FROM purchased_contents AS pc
  WHERE pc.purchase_id = $1 AND pc.user_id = $2 AND pc.cancelled_datetime IS NULL
`;
export const trnSelectValidPurchasedContent = async function(
  db: Postgres,
  purchaseId: string,
  UserId: string
) {
  return await db.execute(sql_select_valid_purchased_content, [
    purchaseId,
    UserId,
  ]);
};

const sql_is_purchased_content = `
  SELECT EXISTS
    (SELECT
      *
      FROM
        purchased_contents
      WHERE
        user_id = $1
        AND content_id = $2
        AND cancelled_datetime IS NULL
        LIMIT 1 OFFSET 0);`;

/**
 * ログインユーザーが対象のコンテンツを購入済みか判定する
 * @param db
 * @param userId
 * @param contentId
 */
const trnIsPurchaseContent = async function(
  db: Postgres,
  userId: string,
  contentId: string
) {
  const params = [userId, contentId];
  return await db.execute(sql_is_purchased_content, params);
};

export const is_purchased_content = functions
  .region("asia-northeast1")
  .https.onCall((data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "The function must be called " + "while authenticated."
      );
    }
    if (!data.userId) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "data.userId is undefined.",
        data
      );
    }
    if (!data.contentId) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "data.contentId is undefined.",
        data
      );
    }
    return execMultiQueryWithTransaction(
      trnIsPurchaseContent,
      data.userId,
      data.contentId
    ).then((result) => {
      return result;
    });
  });
