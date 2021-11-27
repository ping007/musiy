import * as functions from "firebase-functions";
import { execSingleQueryWithParams, Postgres } from "./common/dao";
const runtimeOpts: any = {
  memory: "2GB",
};
const columns = `
    users.user_id AS "userId",
    users.username AS "username",
    users.email AS "email",
    users.image_id AS "imageId",
    users.cr_user_id AS "crUserId",
    to_char(users.cr_datetime,'YYYY/MM/DD HH24:MI:SS') AS "crDatetime",
    users.up_user_id AS "upUserId",
    to_char(users.up_datetime,'YYYY/MM/DD HH24:MI:SS') AS "upDatetime",
    to_char(users.latest_login_datetime,'YYYY/MM/DD HH24:MI:SS') AS "latestLoginDatetime",
    users.is_artist AS "isArtist",
    users.genres AS "genres",
    users.description AS "description",
    users.homepage_url AS "homepageUrl",
    users.blog_url AS "blogUrl",
    users.facebook_url AS "facebookUrl",
    users.twitter_url AS "twitterUrl",
    users.stripe_customer_id AS "stripeCustomerId",
    users.card_num_four_digits AS "cardNumFourDigits"
`;

const sql_select_user_by_user_id = `
  SELECT ${columns} FROM users
  WHERE users.user_id = $1
`;

export const selectUserByUserId = function(userId: string) {
  const params = [userId];
  return execSingleQueryWithParams(sql_select_user_by_user_id, params);
};

export const select_user_by_user_id = functions
  .region("asia-northeast1")
  .runWith(runtimeOpts)
  .https.onCall((data, context) => {
    return selectUserByUserId(data.userId).then((result) => {
      return result;
    });
  });

const sql_select_all_artists = `
  SELECT ${columns} FROM users
  WHERE users.is_artist = true
`;

export const selectAllArtists = function() {
  return execSingleQueryWithParams(sql_select_all_artists, []);
};

export const select_all_artists = functions
  .region("asia-northeast1")
  .runWith(runtimeOpts)
  .https.onCall((data, context) => {
    return selectAllArtists().then((result) => {
      return result;
    });
});

const sql_select_new_artist_users =
  `
  SELECT
` +
  columns +
  `
  FROM users
  WHERE users.is_artist = TRUE
  ORDER BY users.cr_datetime DESC
  LIMIT 100
`;

const selectNewArtistUsers = function() {
  const params: any[] = [];
  return execSingleQueryWithParams(sql_select_new_artist_users, params);
};

export const select_new_artist_users = functions
  .region("asia-northeast1")
  .runWith(runtimeOpts)
  .https.onCall((data, context) => {
    return selectNewArtistUsers().then((result) => {
      return result;
    });
  });

const sql_select_artist_users_by_genre =
  `
  SELECT
` +
  columns +
  `
FROM users
WHERE users.is_artist = TRUE
AND users.user_id in
(SELECT DISTINCT ON (musics.user_id) musics.user_id FROM musics WHERE musics.genre LIKE '%'||$1||'%')
LIMIT 100
`;

const selectArtistUsersByGenre = function(genre: string) {
  const params = [genre];
  return execSingleQueryWithParams(sql_select_artist_users_by_genre, params);
};

export const select_artist_users_by_genre = functions
  .region("asia-northeast1")
  .runWith(runtimeOpts)
  .https.onCall((data, context) => {
    return selectArtistUsersByGenre(data.genre).then((result) => {
      return result;
    });
  });

const sql_select_following_artist_users =
  `
  SELECT
` +
  columns +
  `
  ,
  to_char(follows.up_datetime,'YYYY/MM/DD HH24:MI:SS') AS "followsUpDatetime",
  follows.is_following AS "isFollowing"
  FROM users
  INNER JOIN follows
  ON follows.follow_to_user_id = users.user_id
  AND follows.follow_from_user_id = $1
  AND follows.is_following = TRUE
  WHERE users.is_artist = TRUE
  ORDER BY users.cr_datetime DESC
`;

const selectFollowingArtistUsers = function(userId: string) {
  const params = [userId];
  return execSingleQueryWithParams(sql_select_following_artist_users, params);
};

export const select_following_artist_users = functions
  .region("asia-northeast1")
  .runWith(runtimeOpts)
  .https.onCall((data, context) => {
    return selectFollowingArtistUsers(data.userId).then((result) => {
      return result;
    });
  });

const sql_select_supporting_artist_users =
  `
  SELECT
` +
  columns +
  `
  ,
  supporters.is_enable AS "isSupported",
  supporters.plan_id AS "planId",
  to_char(supporters.cr_datetime,'YYYY/MM/DD HH24:MI:SS') AS "supportCrDatetime",
  plans.plan_name AS "planName",
  plans.plan_description AS "planDescription",
  plans.plan_price AS "planPrice",
  plans.plan_image_id AS "planImageId"
  FROM users
  INNER JOIN supporters
  ON supporters.artist_user_id = users.user_id
  AND supporters.supporter_user_id = $1
  INNER JOIN plans
  ON plans.plan_id = supporters.plan_id
  WHERE users.is_artist = TRUE
  ORDER BY users.cr_datetime DESC
`;

const selectSupportingArtistUsers = function(userId: string) {
  const params = [userId];
  return execSingleQueryWithParams(sql_select_supporting_artist_users, params);
};

export const select_supporting_artist_users = functions
  .region("asia-northeast1")
  .runWith(runtimeOpts)
  .https.onCall((data, context) => {
    return selectSupportingArtistUsers(data.userId).then((result) => {
      return result;
    });
  });

const sql_upsert_user = `
INSERT INTO users (user_id, username, email, image_id, cr_user_id, cr_datetime, up_user_id, up_datetime, latest_login_datetime, is_artist, genres, description, homepage_url, blog_url, facebook_url, twitter_url)
  VALUES ($1, $2, $3, $4, $5, now(), $6, now(), now(), $7, $8, $9, $10, $11, $12, $13)
  ON CONFLICT ON CONSTRAINT users_pkey
  DO UPDATE SET user_id=$1, username=$2, image_id=$4, up_user_id=$6, up_datetime=now(),
  is_artist=$7, genres=$8, description=$9, homepage_url=$10, blog_url=$11, facebook_url=$12, twitter_url=$13
`;

const upsertUser = function(
  userId: string,
  username: string,
  email: string,
  imageId: string,
  crUserId: string,
  upUserId: string,
  isArtist: boolean,
  genres: string,
  description: string,
  homepageUrl: string,
  blogUrl: string,
  facebookUrl: string,
  twitterUrl: string
) {
  const params = [
    userId,
    username,
    email,
    imageId,
    crUserId,
    upUserId,
    String(isArtist),
    genres,
    description,
    homepageUrl,
    blogUrl,
    facebookUrl,
    twitterUrl,
  ];
  return execSingleQueryWithParams(sql_upsert_user, params);
};

export const upsert_user = functions
  .region("asia-northeast1")
  .https.onCall((data, context) => {
    return upsertUser(
      data.userId,
      data.username,
      data.email,
      data.imageId,
      data.crUserId,
      data.upUserId,
      data.isArtist,
      data.genres,
      data.description,
      data.homepageUrl,
      data.blogUrl,
      data.facebookUrl,
      data.twitterUrl
    ).then((result) => {
      return result;
    });
  });

const sql_update_user_latest_login_datetime = `
UPDATE users SET latest_login_datetime = now() WHERE user_id = $1
`;

const updateUserLatestLoginDatetime = function(userId: string) {
  const params = [userId];
  return execSingleQueryWithParams(
    sql_update_user_latest_login_datetime,
    params
  );
};

export const update_user_latest_login_datetime = functions
  .region("asia-northeast1")
  .https.onCall((data, context) => {
    return updateUserLatestLoginDatetime(data.userId).then((result) => {
      return result;
    });
  });

const sql_update_user_is_artist = `
UPDATE users SET is_artist = true WHERE user_id = $1
`;

const updateUserIsArtist = function(userId: string) {
  const params = [userId];
  return execSingleQueryWithParams(sql_update_user_is_artist, params);
};

export const update_user_is_artist = functions
  .region("asia-northeast1")
  .https.onCall((data, context) => {
    return updateUserIsArtist(data.userId).then((result) => {
      return result;
    });
  });

const sql_update_user_payment_info = `
UPDATE users SET stripe_customer_id = $2, card_num_four_digits = $3  WHERE user_id = $1
`;

export const updateUserPaymentInfo = (
  userId: string,
  stripeCustomerId: string,
  cardNumFourDigits: string
) => {
  const params = [userId, stripeCustomerId, cardNumFourDigits];
  return execSingleQueryWithParams(sql_update_user_payment_info, params);
};

const sql_select_valid_user_by_user_id =
  `
  SELECT
` +
  columns +
  `
  FROM users
  WHERE users.user_id = $1 AND users.deleted_datetime IS NULL
`;
export const trnSelectValidUserByUserId = async function(
  db: Postgres,
  userId: string
) {
  const params = [userId];
  return await db.execute(sql_select_valid_user_by_user_id, params);
};

const sql_select_artist_by_user_id =
  `
  SELECT
` +
  columns +
  `
  FROM users
  WHERE users.is_artist = TRUE
  AND users.deleted_datetime is null
  AND users.user_id = $1
`;

const selectArtistByUserId = function(userId: string) {
  const params = [userId];
  return execSingleQueryWithParams(sql_select_artist_by_user_id, params);
};

export const select_artist_by_user_id = functions
  .region("asia-northeast1")
  .https.onCall((data, context) => {
    return selectArtistByUserId(data.userId).then((result) => {
      return result;
    });
  });
