import * as functions from "firebase-functions";
import { execSingleQueryWithParams } from "./common/dao";
const columns = `    follows.follow_from_user_id AS "followFromUserId",
    follows.follow_to_user_id AS "followToUserId",
    follows.is_following AS "isFollowing",
    to_char(follows.cr_datetime,'YYYY/MM/DD HH24:MI:SS') AS "crDatetime",
    to_char(follows.up_datetime,'YYYY/MM/DD HH24:MI:SS') AS "upDatetime"`;

const sql_select_follows_by_follow_from_user_id =
  `
  SELECT
` +
  columns +
  `
  FROM follows
  WHERE follows.follow_from_user_id = $1
`;

const selectFollowsByFollowFromUserId = function(followFromUserId: string) {
  const params = [followFromUserId];
  return execSingleQueryWithParams(
    sql_select_follows_by_follow_from_user_id,
    params
  );
};

export const select_follows_by_follow_from_user_id = functions
  .region("asia-northeast1")
  .https.onCall((data, context) => {
    return selectFollowsByFollowFromUserId(data.followFromUserId).then(
      (result) => {
        return result;
      }
    );
  });

const sql_select_follows_by_follow_to_user_id =
  `
  SELECT
` +
  columns +
  `
  FROM follows
  WHERE follows.follow_to_user_id = $1
`;

const selectFollowsByFollowToUserId = function(followToUserId: string) {
  const params = [followToUserId];
  return execSingleQueryWithParams(
    sql_select_follows_by_follow_to_user_id,
    params
  );
};

export const select_follows_by_follow_to_user_id = functions
  .region("asia-northeast1")
  .https.onCall((data, context) => {
    return selectFollowsByFollowToUserId(data.followToUserId).then((result) => {
      return result;
    });
  });

const sql_select_follows_and_fans_by_follow_to_user_id =
  `
 SELECT DISTINCT *
 FROM (
  SELECT
    follows.follow_from_user_id as "followFromUserId"
  FROM follows
  WHERE follows.follow_to_user_id = $1 AND follows.is_following = TRUE
  UNION
  SELECT
    sp.user_id as "followFromUserId"
  FROM scheduled_payments sp
  INNER JOIN plans p ON p.plan_id = sp.content_id
  WHERE
    sp.is_canceled = FALSE
    AND p.user_id = $1
  ) t
  `;

const selectFollowsAndFansByFollowToUserId = function(followToUserId: string) {
  const params = [followToUserId];
  return execSingleQueryWithParams(
    sql_select_follows_and_fans_by_follow_to_user_id,
    params
  );
};

export const select_follows_and_fans_by_follow_to_user_id = functions
  .region("asia-northeast1")
  .https.onCall((data, context) => {
    return selectFollowsAndFansByFollowToUserId(data.followToUserId).then((result) => {
      return result;
    });
  });

const sql_upsert_follow = `
INSERT INTO follows (follow_from_user_id, follow_to_user_id, is_following, cr_datetime, up_datetime)
  VALUES ($1, $2, $3, now(), now())
  ON CONFLICT ON CONSTRAINT follows_pkey
  DO UPDATE SET follow_from_user_id=$1, follow_to_user_id=$2, is_following=$3, up_datetime=now()
`;

const upsertFollow = function(
  followFromUserId: string,
  followToUserId: string,
  isFollowing: boolean
) {
  const params = [followFromUserId, followToUserId, String(isFollowing)];
  return execSingleQueryWithParams(sql_upsert_follow, params);
};

export const upsert_follow = functions
  .region("asia-northeast1")
  .https.onCall((data, context) => {
    return upsertFollow(
      data.followFromUserId,
      data.followToUserId,
      data.isFollowing
    ).then((result) => {
      return result;
    });
  });
