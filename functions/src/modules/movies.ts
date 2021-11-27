import * as functions from "firebase-functions";
import { execSingleQueryWithParams } from "./common/dao";
const runtimeOpts: any = {
  memory: "2GB",
};
const columns = `
    movies.movie_id AS "movieId",
    movies.user_id AS "userId",
    users.username AS "artistName",
    users.image_id AS "artistImageId",
    movies.title AS "title",
    movies.description AS "description",
    movies.genre AS "genre",
    movies.price AS "price",
    movies.copyright_type AS "copyrightType",
    movies.play_counts AS "playCounts",
    movies.start_seconds AS "startSeconds",
    movies.allow_type AS "allowType",
    movies.cr_user_id AS "crUserId",       
    to_char(movies.cr_datetime,'YYYY/MM/DD HH24:MI:SS') AS "crDatetime",
    movies.up_user_id AS "upUserId",
    to_char(movies.up_datetime,'YYYY/MM/DD HH24:MI:SS') AS "upDatetime",
    movies.is_show AS "isShow"`;

const sql_select_play_later_movies_by_user_id =
  `
  SELECT 
    ` +
  columns +
  `,
  allowed_contents.plan_id AS "planId",
  allowed_contents.plan_name AS "planName",
  allowed_contents.plan_price AS "planPrice"
  FROM movies 
  LEFT JOIN users
  ON movies.user_id = users.user_id
  LEFT JOIN allowed_contents
  ON movies.movie_id = allowed_contents.content_id
  INNER JOIN play_later
  ON movies.movie_id = play_later.content_id
  WHERE movies.user_id = $1
  ORDER BY play_later.cr_datetime DESC
`;

const selectPlayLaterMoviessByUserId = function(userId: string) {
  const params = [userId];
  return execSingleQueryWithParams(
    sql_select_play_later_movies_by_user_id,
    params
  );
};

export const select_play_later_movies_by_user_id = functions
  .region("asia-northeast1")
  .runWith(runtimeOpts)
  .https.onCall((data, context) => {
    return selectPlayLaterMoviessByUserId(data.userId).then((result) => {
      return result;
    });
  });

const sql_select_top_100_play_movies =
  `
  SELECT
    ` +
  columns +
  `,
  purchased_contents.price AS "purchasedPrice",
  to_char(purchased_contents.cr_datetime,'YYYY/MM/DD HH24:MI:SS') AS "purchasedDatetime"
  FROM movies
  LEFT JOIN users
  ON movies.user_id = users.user_id
  LEFT JOIN purchased_contents
  ON movies.movie_id = purchased_contents.content_id
  AND
  purchased_contents.user_id = $1
  WHERE movies.allow_type = 1
  ORDER BY movies.play_counts DESC
  LIMIT 100
`;

const selectTop100PlayMovies = function(userId: string) {
  const params = [userId];
  return execSingleQueryWithParams(sql_select_top_100_play_movies, params);
};

export const select_top_100_play_movies = functions
  .region("asia-northeast1")
  .runWith(runtimeOpts)
  .https.onCall((data, context) => {
    return selectTop100PlayMovies(data.userId).then((result) => {
      return result;
    });
  });

const sql_select_top_100_new_movies =
  `
  SELECT
    ` +
  columns +
  `,
  purchased_contents.price AS "purchasedPrice",
  to_char(purchased_contents.cr_datetime,'YYYY/MM/DD HH24:MI:SS') AS "purchasedDatetime"
  FROM movies
  LEFT JOIN users
  ON movies.user_id = users.user_id
  LEFT JOIN purchased_contents
  ON movies.movie_id = purchased_contents.content_id
  AND
  purchased_contents.user_id = $1
  WHERE movies.allow_type = 1
  ORDER BY movies.cr_datetime DESC
  LIMIT 100
`;

const selectTop100NewMovies = function(userId: string) {
  const params = [userId];
  return execSingleQueryWithParams(sql_select_top_100_new_movies, params);
};

export const select_top_100_new_movies = functions
  .region("asia-northeast1")
  .runWith(runtimeOpts)
  .https.onCall((data, context) => {
    return selectTop100NewMovies(data.userId).then((result) => {
      return result;
    });
  });

const sql_select_movie_by_movie_id =
  `
  SELECT 
    ` +
  columns +
  `,
  allowed_contents.plan_id AS "planId",
  allowed_contents.plan_name AS "planName",
  allowed_contents.plan_price AS "planPrice"
  FROM movies 
  LEFT JOIN users
  ON movies.user_id = users.user_id
  LEFT JOIN allowed_contents
  ON movies.movie_id = allowed_contents.content_id
  WHERE movies.movie_id = $1
`;

export const selectMovieByMovieId = function(movieId: string) {
  const params = [movieId];
  return execSingleQueryWithParams(sql_select_movie_by_movie_id, params);
};

export const select_movie_by_movie_id = functions
  .region("asia-northeast1")
  .runWith(runtimeOpts)
  .https.onCall((data, context) => {
    return selectMovieByMovieId(data.movieId).then((result) => {
      return result;
    });
  });

const sql_select_movie_by_movie_ids =
  `
  SELECT
    ` +
  columns +
  `,
  allowed_contents.plan_id AS "planId",
  allowed_contents.plan_name AS "planName",
  allowed_contents.plan_price AS "planPrice"
  FROM movies
  LEFT JOIN users
  ON movies.user_id = users.user_id
  LEFT JOIN allowed_contents
  ON movies.movie_id = allowed_contents.content_id
  WHERE movies.movie_id = any($1)
`;
export const selectMovieByMovieIds = function(movieIds: Array<string>) {
  const params = [movieIds];
  return execSingleQueryWithParams(sql_select_movie_by_movie_ids, params);
};
export const select_movie_by_movie_ids = functions
  .region("asia-northeast1")
  .runWith(runtimeOpts)
  .https.onCall((data, context) => {
    return selectMovieByMovieIds(data.movieIds).then((result) => {
      return result;
    });
  });



const sql_select_movies_by_user_id =
  `
  SELECT 
    ` +
  columns +
  `,
  allowed_contents.plan_id AS "planId",
  allowed_contents.plan_name AS "planName",
  allowed_contents.plan_price AS "planPrice"
  FROM movies 
  LEFT JOIN users
  ON movies.user_id = users.user_id
  LEFT JOIN allowed_contents
  ON movies.movie_id = allowed_contents.content_id
  WHERE movies.user_id = $1
  ORDER BY movies.cr_datetime DESC
`;

const selectMoviesByUserId = function(userId: string) {
  const params = [userId];
  return execSingleQueryWithParams(sql_select_movies_by_user_id, params);
};

export const select_movies_by_user_id = functions
  .region("asia-northeast1")
  .runWith(runtimeOpts)
  .https.onCall((data, context) => {
    return selectMoviesByUserId(data.userId).then((result) => {
      return result;
    });
  });

const sql_select_purchased_movies_by_user_id =
  `
  SELECT 
     ` +
  columns +
  `,
  allowed_contents.plan_id AS "planId",
  allowed_contents.plan_name AS "planName",
  allowed_contents.plan_price AS "planPrice"
  FROM movies
  INNER JOIN users
  ON movies.user_id = users.user_id
  LEFT JOIN allowed_contents
  ON movies.movie_id = allowed_contents.content_id
  INNER JOIN purchased_contents
  ON movies.movie_id = purchased_contents.content_id
  WHERE purchased_contents.user_id =  $1
  ORDER BY purchased_contents.cr_datetime DESC
`;

const selectPurchasedMoviesByUserId = function(userId: string) {
  const params = [userId];
  return execSingleQueryWithParams(
    sql_select_purchased_movies_by_user_id,
    params
  );
};

export const select_purchased_movies_by_user_id = functions
  .region("asia-northeast1")
  .runWith(runtimeOpts)
  .https.onCall((data, context) => {
    return selectPurchasedMoviesByUserId(data.userId).then((result) => {
      return result;
    });
  });

const sql_upsert_movie = `
INSERT INTO movies (movie_id, user_id, title, description, genre, price, copyright_type, start_seconds, allow_type, is_show, cr_user_id, cr_datetime, up_user_id, up_datetime)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, now(), $12, now())
  ON CONFLICT ON CONSTRAINT movies_pkey
  DO UPDATE SET movie_id=$1, user_id=$2, title=$3, description=$4, genre=$5, price=$6, copyright_type=$7, start_seconds=$8, allow_type=$9, is_show=$10, up_user_id=$12, up_datetime=now()
`;

const upsertMovie = function(
  movieId: string,
  userId: string,
  title: string,
  description: string,
  genre: string,
  price: number,
  copyrightType: string,
  startSeconds: number,
  allowType: number,
  isShow: Boolean,
  crUserId: string,
  upUserId: string
) {
  const params = [
    movieId,
    userId,
    title,
    description,
    genre,
    String(price),
    copyrightType,
    String(startSeconds),
    String(allowType),
    String(isShow),
    crUserId,
    upUserId,
  ];
  return execSingleQueryWithParams(sql_upsert_movie, params);
};

export const upsert_movie = functions
  .region("asia-northeast1")
  .https.onCall((data, context) => {
    return upsertMovie(
      data.movieId,
      data.userId,
      data.title,
      data.description,
      data.genre,
      data.price,
      data.copyrightType,
      data.startSeconds,
      data.allowType,
      data.isShow,
      data.crUserId,
      data.upUserId
    ).then((result) => {
      return result;
    });
  });

const sql_update_movie_play_counts = `
  UPDATE movies SET play_counts = movies2.play_counts + 1, output_play_counts = movies2.output_play_counts + 1
  FROM movies AS movies2
  WHERE movies.movie_id = movies2.movie_id
  AND movies.movie_id = $1
`;

const updateMoviePlayCounts = function(movieId: string) {
  const params = [movieId];
  return execSingleQueryWithParams(sql_update_movie_play_counts, params);
};

export const update_movie_play_counts = functions
  .region("asia-northeast1")
  .https.onCall((data, context) => {
    return updateMoviePlayCounts(data.movieId).then((result) => {
      return result;
    });
  });
