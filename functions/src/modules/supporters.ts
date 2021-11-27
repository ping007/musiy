import * as functions from "firebase-functions";
import * as Handlebars from "handlebars";
import {
  execMultiQueryWithTransaction,
  execSingleQueryWithParams,
  Postgres,
} from "./common/dao";
import { sendMail } from "./mail/mailer";
import {
  uploadBroadcastWithPlanMailTitle,
  uploadBroadcastWithPlanMailContext,
} from "./mail/template/upload_broadcast_with_plan";
import {
  uploadMovieWithPlanMailTitle,
  uploadMovieWithPlanMailContext,
} from "./mail/template/upload_movie_with_plan";
import {
  uploadMusicWithPlanMailTitle,
  uploadMusicWithPlanMailContext,
} from "./mail/template/upload_music_with_plan";

const columns = `supporters.artist_user_id AS "artistUserId",
    supporters.supporter_user_id AS "supporterUserId",
    supporters.plan_id AS "planId",
    supporters.is_enable AS "isEnable",
    to_char(supporters.cr_datetime,'YYYY/MM/DD HH24:MI:SS') AS "crDatetime"`;

const sql_select_supporters_by_artist_user_id =
  `
  SELECT
  ` +
  columns +
  `
    ,
    users.username AS "supporterName",
    users.image_id AS "supporterImageId",
    plans.plan_name AS "planName",
    plans.plan_description AS "planDescription",
    plans.plan_price AS "planPrice",
    plans.plan_image_id AS "planImageId"
  FROM supporters
  LEFT JOIN users
  ON supporters.supporter_user_id = users.user_id
  LEFT JOIN plans
  ON supporters.plan_id = plans.plan_id
  WHERE supporters.artist_user_id = $1
  AND supporters.is_enable = TRUE
  ORDER BY supporters.cr_datetime DESC
`;

const selectSupportersByArtistUserId = function(artistUserId: string) {
  const params = [artistUserId];
  return execSingleQueryWithParams(
    sql_select_supporters_by_artist_user_id,
    params
  );
};

export const select_supporters_by_artist_user_id = functions
  .region("asia-northeast1")
  .https.onCall((data, context) => {
    return selectSupportersByArtistUserId(data.artistUserId).then((result) => {
      return result;
    });
  });

const sql_select_supporters_by_supporter_user_id =
  `
  SELECT
  ` +
  columns +
  `
    ,
    users.username AS "artistName",
    users.image_id AS "artistImageId"
  FROM supporters
  LEFT JOIN users
  ON supporters.artist_user_id = users.user_id
  WHERE supporters.supporter_user_id = $1
  AND supporters.is_enable = TRUE
  ORDER BY supporters.cr_datetime DESC
`;

const selectSupportersBySupporterUserId = function(supporterUserId: string) {
  const params = [supporterUserId];
  return execSingleQueryWithParams(
    sql_select_supporters_by_supporter_user_id,
    params
  );
};

export const select_supporters_by_supporter_user_id = functions
  .region("asia-northeast1")
  .https.onCall((data, context) => {
    return selectSupportersBySupporterUserId(data.supporterUserId).then(
      (result) => {
        return result;
      }
    );
  });

const sql_upsert_supporter = `
INSERT INTO supporters (artist_user_id, supporter_user_id, plan_id, is_enable, cr_datetime)
  VALUES ($1, $2, $3, $4, now())
  ON CONFLICT ON CONSTRAINT supporters_pkey
  DO UPDATE SET artist_user_id=$1, supporter_user_id=$2, plan_id=$3, is_enable=$4
`;

const upsertSupporter = function(
  artistUserId: string,
  supporterUserId: string,
  planId: string,
  isEnable: boolean
) {
  const params = [artistUserId, supporterUserId, planId, String(isEnable)];
  return execSingleQueryWithParams(sql_upsert_supporter, params);
};

export const upsert_supporter = functions
  .region("asia-northeast1")
  .https.onCall((data, context) => {
    return upsertSupporter(
      data.artistUserId,
      data.supporterUserId,
      data.planId,
      data.isEnable
    ).then((result) => {
      return result;
    });
  });

const sql_update_supporter_is_enable = `
  UPDATE supporters SET supporter_user_id=$1, plan_id=$2, is_enable=$3
`;

export const updateSupporterIsEnable = async function(
  supporterUserId: string,
  planId: string,
  isEnable: boolean
) {
  const params = [supporterUserId, planId, String(isEnable)];
  return await execSingleQueryWithParams(
    sql_update_supporter_is_enable,
    params
  );
};

const select_send_mail_when_content_upload = `
  SELECT
    u.email as email
    ,u.username as user_name
    ,art.username as artist_name
    ,ac.plan_name as plan_name
    ,p.plan_description as plan_description
    ,content.title as title
`;
const from_send_mail_when_content_upload = `
  FROM supporters s
  INNER JOIN users u on s.supporter_user_id = u.user_id
  INNER JOIN users art on s.artist_user_id = art.user_id
  INNER JOIN allowed_contents ac on s.plan_id = ac.plan_id AND ac.content_id=$1
  INNER JOIN plans p ON s.plan_id = p.plan_id
`;
const where_send_mail_when_content_upload = `
  WHERE s.artist_user_id=$2
    AND s.plan_id=$3
    AND s.is_enable=true
    AND u.deleted_datetime is null
    AND u.email is not null
`;
const query_send_mail_when_music_upload_by_plan_id = `
  ${select_send_mail_when_content_upload}
  ,content.description
  ${from_send_mail_when_content_upload}
  INNER JOIN musics content on content.music_id=ac.content_id
  ${where_send_mail_when_content_upload}
`;
const query_send_mail_when_movie_upload_by_plan_id = `
  ${select_send_mail_when_content_upload}
  ,content.description
  ${from_send_mail_when_content_upload}
  INNER JOIN movies content on content.movie_id=ac.content_id
  ${where_send_mail_when_content_upload}
`;
const query_send_mail_when_broadcast_upload_by_plan_id = `
  ${select_send_mail_when_content_upload}
  ,content.explanation as description
  ${from_send_mail_when_content_upload}
  INNER JOIN broadcasts content on content.broadcast_id=ac.content_id
  ${where_send_mail_when_content_upload}
`;

const sendMailWhenContentUploadByPlanId = async function(
  db: Postgres,
  userId: string,
  planId: string,
  contentId: string,
  contentType: string
) {
  let users;
  let titleTmp;
  let contentTmp;
  let url;
  // プランが有効になっているユーザを取得
  const host = functions.config().musiy.host;
  if (contentType === "music") {
    titleTmp = Handlebars.compile(uploadMusicWithPlanMailTitle);
    contentTmp = Handlebars.compile(uploadMusicWithPlanMailContext);
    url = `https://${host}/fans/detail?artist_id=${userId}&music_id=${contentId}`;
    users = (
      await db.execute(query_send_mail_when_music_upload_by_plan_id, [
        contentId,
        userId,
        planId,
      ])
    ).rows;
  } else if (contentType === "movie") {
    titleTmp = Handlebars.compile(uploadMovieWithPlanMailTitle);
    contentTmp = Handlebars.compile(uploadMovieWithPlanMailContext);
    url = `https://${host}/fans/detail?artist_id=${userId}&movie_id=${contentId}`;
    users = (
      await db.execute(query_send_mail_when_movie_upload_by_plan_id, [
        contentId,
        userId,
        planId,
      ])
    ).rows;
  } else if (contentType === "broadcast") {
    titleTmp = Handlebars.compile(uploadBroadcastWithPlanMailTitle);
    contentTmp = Handlebars.compile(uploadBroadcastWithPlanMailContext);
    url = `https://${host}/fans/detail?artist_id=${userId}&broadcast_id=${contentId}`;
    users = (
      await db.execute(query_send_mail_when_broadcast_upload_by_plan_id, [
        contentId,
        userId,
        planId,
      ])
    ).rows;
  } else {
    console.error("contentType was" + contentType);
    return;
  }

  const sentMail = [];
  for (const user of users) {
    const title = titleTmp({
      content: { title: user.title },
      artist: { name: user.artist_name },
    });
    const content = contentTmp({
      user: { name: user.user_name },
      artist: { name: user.artist_name },
      plan: {
        name: user.plan_name,
        description: user.plan_description,
      },
      content: {
        title: user.title,
        description: user.description,
        url,
      },
    });
    sentMail.push(sendMail(user.email, title, "", content));
  }
  await Promise.all(sentMail);
};

export const send_mail_when_content_upload_by_plan_id = functions
  .region("asia-northeast1")
  .https.onCall((data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "The function must be called " + "while authenticated."
      );
    }
    if (!data.contentId) {
      console.log("data.contentId is not found");
      throw new functions.https.HttpsError(
        "invalid-argument",
        "data.contentId is undefined.",
        data
      );
    }
    if (!data.contentType) {
      console.log("data.contentType is not found");
      throw new functions.https.HttpsError(
        "invalid-argument",
        "data.contentType is undefined.",
        data
      );
    }
    if (!data.planId) {
      console.log("data.planId is not found");
      throw new functions.https.HttpsError(
        "invalid-argument",
        "data.planId is undefined.",
        data
      );
    }
    return execMultiQueryWithTransaction(
      sendMailWhenContentUploadByPlanId,
      context.auth?.uid,
      data.planId,
      data.contentId,
      data.contentType
    ).then((result) => {
      return result;
    });
  });
