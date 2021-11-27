import * as functions from "firebase-functions";
import { execSingleQueryWithParams } from "./common/dao";
const runtimeOpts: any = {
  memory: "2GB",
};
const columns = `    feeds.feed_id AS "feedId",
    feeds.user_id AS "userId",
    feeds.movie_id AS "movieId",
    feeds.music_id AS "musicId",
    feeds.image_id AS "imageId",
    feeds.title AS "title",
    feeds.feed_content AS "feedContent",
    feeds.feed_allow_type AS "allowType",
    users.username AS "username",
    users.image_id AS "userImageId",
    feeds.cr_user_id AS "crUserId",
    to_char(feeds.cr_datetime,'YYYY/MM/DD HH24:MI:SS') AS "crDatetime",
    feeds.up_user_id AS "upUserId",
    to_char(feeds.up_datetime,'YYYY/MM/DD HH24:MI:SS') AS "upDatetime",
    feeds.is_show AS "isShow"`;

const sql_select_feed_by_feed_id =
  `
  SELECT 
` +
  columns +
  `,
  allowed_contents.plan_id AS "planId",
  allowed_contents.plan_name AS "planName",
  allowed_contents.plan_price AS "planPrice"
  FROM feeds 
  LEFT JOIN users
  ON feeds.user_id = users.user_id
  LEFT JOIN allowed_contents
  ON feeds.feed_id = allowed_contents.content_id
  WHERE feeds.feed_id = $1
  AND feeds.is_show = TRUE
  ORDER BY feeds.cr_datetime DESC
`;

const selectFeedByFeedId = function(feedId: string) {
  const params = [feedId];
  return execSingleQueryWithParams(sql_select_feed_by_feed_id, params);
};

export const select_feed_by_feed_id = functions
  .region("asia-northeast1")
  .runWith(runtimeOpts)
  .https.onCall((data, context) => {
    return selectFeedByFeedId(data.feedId).then((result) => {
      return result;
    });
  });

const sql_select_feeds_by_user_id =
  `
  SELECT 
` +
  columns +
  `,
  allowed_contents.plan_id AS "planId",
  allowed_contents.plan_name AS "planName",
  allowed_contents.plan_price AS "planPrice"
  FROM feeds 
  LEFT JOIN users
  ON feeds.user_id = users.user_id
  LEFT JOIN allowed_contents
  ON feeds.feed_id = allowed_contents.content_id
  WHERE feeds.user_id = $1
  AND feeds.is_show = TRUE
  ORDER BY feeds.cr_datetime DESC
`;

const selectFeedsByUserId = function(userId: string) {
  const params = [userId];
  return execSingleQueryWithParams(sql_select_feeds_by_user_id, params);
};

export const select_feeds_by_user_id = functions
  .region("asia-northeast1")
  .runWith(runtimeOpts)
  .https.onCall((data, context) => {
    return selectFeedsByUserId(data.userId).then((result) => {
      return result;
    });
  });

const sql_upsert_feed = `
INSERT INTO feeds (feed_id, user_id, movie_id,
    music_id, image_id, title, feed_content, feed_allow_type, cr_user_id, cr_datetime, up_user_id, up_datetime, is_show)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, now(), $10, now(), $11)
  ON CONFLICT ON CONSTRAINT feeds_pkey
  DO UPDATE SET feed_id=$1, user_id=$2, movie_id=$3,
    music_id=$4, image_id=$5, title=$6, feed_content=$7, feed_allow_type=$8, up_user_id=$10, up_datetime=now(), is_show=$11
`;

const upsertFeed = function(
  feedId: string,
  userId: string,
  movieId: string,
  musicId: string,
  imageId: string,
  title: string,
  feedContent: string,
  allowType: number,
  crUserId: string,
  upUserId: string,
  isShow: boolean
) {
  const params = [
    feedId,
    userId,
    movieId,
    musicId,
    imageId,
    title,
    feedContent,
    String(allowType),
    crUserId,
    upUserId,
    String(isShow),
  ];
  return execSingleQueryWithParams(sql_upsert_feed, params);
};

export const upsert_feed = functions
  .region("asia-northeast1")
  .https.onCall((data, context) => {
    return upsertFeed(
      data.feedId,
      data.userId,
      data.movieId,
      data.musicId,
      data.imageId,
      data.title,
      data.feedContent,
      data.allowType,
      data.crUserId,
      data.upUserId,
      data.isShow
    ).then((result) => {
      return result;
    });
  });

const sql_move_to_feeds_hist = `
INSERT INTO feeds_hist (feed_hist_id, feed_id, user_id, movie_id,
    music_id, image_id, title, feed_content, feed_allow_type, cr_user_id, cr_datetime, up_user_id, up_datetime, is_show)
SELECT $1, feed_id, user_id, movie_id,
    music_id, image_id, title, feed_content, feed_allow_type, cr_user_id, now(), up_user_id, now(), is_show FROM feeds
WHERE feed_id = $2
`;

const moveToFeedsHist = function(feedHistId: string, feedId: string) {
  const params = [feedHistId, feedId];
  return execSingleQueryWithParams(sql_move_to_feeds_hist, params);
};

export const move_to_feeds_hist = functions
  .region("asia-northeast1")
  .https.onCall((data, context) => {
    return moveToFeedsHist(data.feedHistId, data.feedId).then((result) => {
      return result;
    });
  });
