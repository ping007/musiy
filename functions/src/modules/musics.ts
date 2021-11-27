import * as functions from "firebase-functions";
import { execSingleQueryWithParams } from "./common/dao";
const runtimeOpts: any = {
  memory: "2GB",
};
const columns = `
    musics.music_id AS "musicId",
    musics.user_id AS "userId",
    musics.image_id AS "imageId",
    users.username AS "artistName",
    users.image_id AS "artistImageId",
    musics.title AS "title",
    musics.description AS "description",
    musics.genre AS "genre",
    musics.price AS "price",
    musics.copyright_type AS "copyrightType",
    musics.play_counts AS "playCounts",
    musics.start_seconds AS "startSeconds",
    musics.file_extension AS "fileExtension",
    musics.allow_type AS "allowType",
    musics.cr_user_id AS "crUserId",
    to_char(musics.cr_datetime,'YYYY/MM/DD HH24:MI:SS') AS "crDatetime",
    musics.up_user_id AS "upUserId",
    to_char(musics.up_datetime,'YYYY/MM/DD HH24:MI:SS') AS "upDatetime",
    musics.is_show AS "isShow"
`;
const sql_select_play_later_musics_by_user_id =
  `
  SELECT DISTINCT ON (music_id)
    ` +
  columns +
  `,
    purchased_contents.price AS "purchasedPrice",
    to_char(purchased_contents.cr_datetime,'YYYY/MM/DD HH24:MI:SS') AS "purchasedDatetime"
  FROM musics
  LEFT JOIN users
  ON musics.user_id = users.user_id
  INNER JOIN play_later
  ON musics.music_id = play_later.content_id
  LEFT JOIN purchased_contents
  ON musics.music_id = purchased_contents.content_id
  WHERE play_later.user_id = $1
  OR  purchased_contents.user_id = $1
`;

const selectPlayLaterMusicsByUserId = function(userId: string) {
  const params = [userId];
  return execSingleQueryWithParams(
    sql_select_play_later_musics_by_user_id,
    params
  );
};

export const select_play_later_musics_by_user_id = functions
  .region("asia-northeast1")
  .runWith(runtimeOpts)
  .https.onCall((data, context) => {
    return selectPlayLaterMusicsByUserId(data.userId).then((result) => {
      return result;
    });
  });

const sql_select_top_100_play_musics =
  `
  SELECT
    ` +
  columns +
  `,
  purchased_contents.price AS "purchasedPrice",
  to_char(purchased_contents.cr_datetime,'YYYY/MM/DD HH24:MI:SS') AS "purchasedDatetime",
  allowed_contents.plan_id AS "planId",
  allowed_contents.plan_name AS "planName",
  allowed_contents.plan_price AS "planPrice"
  FROM musics
  LEFT JOIN users
  ON musics.user_id = users.user_id
  LEFT JOIN allowed_contents
  ON musics.music_id = allowed_contents.content_id
  LEFT JOIN purchased_contents
  ON musics.music_id = purchased_contents.content_id
  AND
  purchased_contents.user_id = $1
  WHERE musics.allow_type = 1
  ORDER BY musics.play_counts DESC
  LIMIT 100
`;

const selectTop100PlayMusics = function(userId: string) {
  const params = [userId];
  return execSingleQueryWithParams(sql_select_top_100_play_musics, params);
};

export const select_top_100_play_musics = functions
  .region("asia-northeast1")
  .runWith(runtimeOpts)
  .https.onCall((data, context) => {
    return selectTop100PlayMusics(data.userId).then((result) => {
      return result;
    });
  });

const sql_select_top_100_new_musics =
  `
  SELECT
    ` +
  columns +
  `,
  purchased_contents.price AS "purchasedPrice",
  to_char(purchased_contents.cr_datetime,'YYYY/MM/DD HH24:MI:SS') AS "purchasedDatetime",
  allowed_contents.plan_id AS "planId",
  allowed_contents.plan_name AS "planName",
  allowed_contents.plan_price AS "planPrice"
  FROM musics
  LEFT JOIN users
  ON musics.user_id = users.user_id
  LEFT JOIN allowed_contents
  ON musics.music_id = allowed_contents.content_id
  LEFT JOIN purchased_contents
  ON musics.music_id = purchased_contents.content_id
  AND
  purchased_contents.user_id = $1
  WHERE musics.allow_type = 1
  ORDER BY musics.cr_datetime DESC
  LIMIT 100
`;

const selectTop100NewMusics = function(userId: string) {
  const params = [userId];
  return execSingleQueryWithParams(sql_select_top_100_new_musics, params);
};

export const select_top_100_new_musics = functions
  .region("asia-northeast1")
  .runWith(runtimeOpts)
  .https.onCall((data, context) => {
    return selectTop100NewMusics(data.userId).then((result) => {
      return result;
    });
  });

const sql_select_music_by_music_id = `
  SELECT
  ${columns}
  FROM musics
  LEFT JOIN users
  ON musics.user_id = users.user_id
  WHERE musics.music_id = $1
`;

export const selectMusicByMusicId = function(musicId: string) {
  const params = [musicId];
  return execSingleQueryWithParams(sql_select_music_by_music_id, params);
};

export const select_music_by_music_id = functions
  .region("asia-northeast1")
  .runWith(runtimeOpts)
  .https.onCall((data, context) => {
    return selectMusicByMusicId(data.musicId).then((result) => {
      return result;
    });
  });

const sql_select_music_by_music_ids = `
  SELECT
  ${columns}
  FROM musics
  LEFT JOIN users
  ON musics.user_id = users.user_id
  WHERE musics.music_id = any($1)
`;

export const selectMusicByMusicIds = function(musicIds: Array<string>) {
  const params = [musicIds];
  return execSingleQueryWithParams(sql_select_music_by_music_ids, params);
};

export const select_music_by_music_ids = functions
  .region("asia-northeast1")
  .runWith(runtimeOpts)
  .https.onCall((data, context) => {
    return selectMusicByMusicIds(data.musicIds).then((result) => {
      return result;
    });
});

const sql_select_musics_by_user_id =
  `
  SELECT
     ` +
  columns +
  `,
  allowed_contents.plan_id AS "planId",
  allowed_contents.plan_name AS "planName",
  allowed_contents.plan_price AS "planPrice",
  to_char(purchased_contents.cr_datetime,'YYYY/MM/DD HH24:MI:SS') AS "purchasedDatetime"
  FROM musics
  INNER JOIN users
  ON musics.user_id = users.user_id
  LEFT JOIN allowed_contents
  ON musics.music_id = allowed_contents.content_id
  LEFT JOIN purchased_contents
  ON musics.music_id = purchased_contents.content_id
  AND
  purchased_contents.user_id = $2
  WHERE musics.user_id = $1
`;

const selectMusicsByUserId = function(artist_userId: string, login_userId: string) {
  const params = [artist_userId, login_userId];
  return execSingleQueryWithParams(sql_select_musics_by_user_id, params);
};

export const select_musics_by_user_id = functions
  .region("asia-northeast1")
  .runWith(runtimeOpts)
  .https.onCall((data, context) => {
    return selectMusicsByUserId(data.userId, context.auth?.uid).then((result) => {
      return result;
    });
  });

const sql_select_purchased_musics_by_user_id =
  `
  SELECT
     ` +
  columns +
  `,
  allowed_contents.plan_id AS "planId",
  allowed_contents.plan_name AS "planName",
  allowed_contents.plan_price AS "planPrice"
  FROM musics
  INNER JOIN users
  ON musics.user_id = users.user_id
  LEFT JOIN allowed_contents
  ON musics.music_id = allowed_contents.content_id
  INNER JOIN purchased_contents
  ON musics.music_id = purchased_contents.content_id
  AND
  purchased_contents.user_id = $1
  WHERE purchased_contents.user_id =  $1
`;

const selectPurchasedMusicsByUserId = function(userId: string) {
  const params = [userId];
  return execSingleQueryWithParams(
    sql_select_purchased_musics_by_user_id,
    params
  );
};

export const select_purchased_musics_by_user_id = functions
  .region("asia-northeast1")
  .runWith(runtimeOpts)
  .https.onCall((data, context) => {
    return selectPurchasedMusicsByUserId(data.userId).then((result) => {
      return result;
    });
  });

const sql_upsert_music = `
INSERT INTO musics (music_id, user_id, image_id, title, description, genre,
      price, copyright_type, start_seconds, file_extension, allow_type, is_show, cr_user_id, cr_datetime, up_user_id, up_datetime)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, now(), $14, now())
  ON CONFLICT ON CONSTRAINT musics_pkey
  DO UPDATE SET music_id=$1, user_id=$2, image_id=$3, title=$4, description=$5, genre=$6, price=$7, copyright_type=$8, start_seconds=$9, file_extension=$10, allow_type=$11, is_show=$12, up_user_id=$14, up_datetime=now()
`;

const upsertMusic = function(
  musicId: string,
  userId: string,
  imageId: string,
  title: string,
  description: string,
  genre: string,
  price: number,
  copyrightType: string,
  startSeconds: number,
  fileExtension: string,
  allowType: number,
  isShow: Boolean,
  crUserId: string,
  upUserId: string
) {
  const params = [
    musicId,
    userId,
    imageId,
    title,
    description,
    genre,
    String(price),
    copyrightType,
    String(startSeconds),
    fileExtension,
    String(allowType),
    String(isShow),
    crUserId,
    upUserId,
  ];
  return execSingleQueryWithParams(sql_upsert_music, params);
};

export const upsert_music = functions
  .region("asia-northeast1")
  .https.onCall((data, context) => {
    return upsertMusic(
      data.musicId,
      data.userId,
      data.imageId,
      data.title,
      data.description,
      data.genre,
      data.price,
      data.copyrightType,
      data.startSeconds,
      data.fileExtension,
      data.allowType,
      data.isShow,
      data.crUserId,
      data.upUserId
    ).then((result) => {
      return result;
    });
  });

const sql_update_music_play_counts = `
  UPDATE musics SET play_counts = musics2.play_counts + 1, output_play_counts = musics2.output_play_counts + 1
  FROM musics AS musics2
  WHERE musics.music_id = musics2.music_id
  AND musics.music_id = $1
`;

const updateMusicPlayCounts = function(musicId: string) {
  const params = [musicId];
  return execSingleQueryWithParams(sql_update_music_play_counts, params);
};

export const update_music_play_counts = functions
  .region("asia-northeast1")
  .https.onCall((data, context) => {
    return updateMusicPlayCounts(data.musicId).then((result) => {
      return result;
    });
  });

const sql_select_musics_by_artist_user_id =
  `
  SELECT
     ` +
  columns +
  `,
  allowed_contents.plan_id AS "planId",
  allowed_contents.plan_name AS "planName",
  allowed_contents.plan_price AS "planPrice",
  now() AS "purchasedDatetime" --購入していると判断してもらうためにnow()を入れる
  FROM musics
  INNER JOIN users
  ON musics.user_id = users.user_id
  LEFT JOIN allowed_contents
  ON musics.music_id = allowed_contents.content_id
  WHERE musics.user_id = $1
`;

const selectMusicsByArtistUserId = function(artist_userId: string) {
  const params = [artist_userId];
  return execSingleQueryWithParams(sql_select_musics_by_artist_user_id, params);
};

export const select_musics_by_artist_user_id = functions
  .region("asia-northeast1")
  .runWith(runtimeOpts)
  .https.onCall((data, context) => {
    return selectMusicsByArtistUserId(data.userId).then((result) => {
      return result;
    });
  });
