import * as functions from "firebase-functions";
import { trnSelectValidUserByUserId } from "../users";
import { execMultiQueryWithTransaction, Postgres } from "../common/dao";
import { htmlEscape } from "./htmlEscape";

type DocumentData = { [field: string]: any };

function buildOgpTag (Ogp: DocumentData) : string {
  return `<!DOCTYPE html><head>
  <meta charset="UTF-8">
  <title>${htmlEscape(Ogp.title)}</title>
  <meta name="description" content="${htmlEscape(Ogp.description)}">
  <meta property="og:description" content="${htmlEscape(Ogp.description)}" />
  <meta property="og:title" content="${htmlEscape(Ogp.title)}">
  <meta property="og:image" content="${htmlEscape(Ogp.image)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${htmlEscape(Ogp.url)}">
  </head><body></body></html>`;
}

const sql_select_music_by_music_id = `
  SELECT
    musics.image_id AS "imageId",
    musics.title AS "title",
    musics.description AS "description"
  FROM musics
  WHERE musics.music_id = $1
`;
const trnSelectMusic = async function(db: Postgres, musicId: string) {
  const params = [musicId];
  return await db.execute(sql_select_music_by_music_id, params);
};
const sql_select_movie_by_movie_id = `
  SELECT
    movie_id AS "movieId",
    title AS "title",
    description AS "description"
  FROM movies
  WHERE movie_id = $1
  AND is_show = TRUE
`;
const trnSelectMovie = async function(db: Postgres, movieId: string) {
  const params = [movieId];
  return await db.execute(sql_select_movie_by_movie_id, params);
};

const sql_select_broadcast_by_broadcast_id = `
  SELECT
  title AS "title",
  image_id AS "imageId"
  FROM broadcasts
  WHERE broadcast_id = $1 AND deleted_datetime is null
`;
const trnSelectBroadcast = async function(db: Postgres, broadcastId: string) {
  const params = [broadcastId];
  return await db.execute(sql_select_broadcast_by_broadcast_id, params);
};

const sql_select_feed_by_feed_id = `
  SELECT
    image_id AS "imageId",
    title AS "title"
  FROM feeds
  WHERE feed_id = $1
  AND is_show = TRUE
`;
const trnSelectFeed = async function(db: Postgres, feedId: string) {
  const params = [feedId];
  return await db.execute(sql_select_feed_by_feed_id, params);
};

const trnGetOgpTagInfo = async function(
  db: Postgres,
  artistId: string,
  musicId: string,
  movieId: string,
  feedId: string,
  broadcastId: string,
) {
  const ogpObj = {
    title: "",
    description: "",
    image: "",
    url: "",
  };
  const user = (await trnSelectValidUserByUserId(db, artistId)).rows[0];
  if (user === null || user === undefined) {
    console.error("Not Found User");
    return ogpObj;
  }
  const cloudName = functions.config().cloudinary.cloudname;
  if (musicId) {
    const res = (await trnSelectMusic(db, musicId)).rows[0];
    if (res === null || res === undefined) {
      console.error("Not found music");
      return ogpObj;
    }
    ogpObj.title = res.title;
    ogpObj.description = res.description;
    if (res.imageId) {
      ogpObj.image = `https://res.cloudinary.com/${cloudName}/image/upload/${res.imageId}`;
    }
  } else if (movieId) {
    const res = (await trnSelectMovie(db, movieId)).rows[0];
    if (res === null || res === undefined) {
      console.error("Not found movie");
      return ogpObj;
    }
    ogpObj.title = res.title;
    ogpObj.description = res.description;
    if (res.movieId) {
      ogpObj.image = `https://res.cloudinary.com/${cloudName}/video/upload/${res.movieId}.jpg`;
    }
  } else if (broadcastId) {
    const res = (await trnSelectBroadcast(db, broadcastId)).rows[0];
    if (res === null || res === undefined) {
      console.error("Not found broadcast");
      return ogpObj;
    }
    ogpObj.title = res.title;
    ogpObj.description = res.title;
    if (res.imageId) {
      ogpObj.image = `https://res.cloudinary.com/${cloudName}/image/upload/${res.imageId}`;
    }
  } else if (feedId) {
    const res = (await trnSelectFeed(db, feedId)).rows[0];
    if (res === null || res === undefined) {
      console.error("Not found feed");
      return ogpObj;
    }
    ogpObj.title = res.title;
    ogpObj.description = res.title;
    if (res.imageId) {
      ogpObj.image = `https://res.cloudinary.com/${cloudName}/image/upload/${res.imageId}`;
    }
  }

  return ogpObj;
};

export const ogptag = functions.region("us-central1").https.onRequest(function(req, res) {
  const userAgent = req.headers["user-agent"].toLowerCase();
  const isBot = !!(userAgent.includes("facebookexternalhit") ||
                userAgent.includes("twitterbot") ||
                userAgent.includes("pinterest"));
  const host = req.hostname;
  const param = req.url;
  const url = "https://" + host + "/fans/detail" + param.replace(/\/ogp/gi, "").replace(/\/ogptag/gi, "");
  if (isBot) {
    execMultiQueryWithTransaction(
      trnGetOgpTagInfo,
      req.query.artist_id,
      req.query.music_id,
      req.query.movie_id,
      req.query.feed_id,
      req.query.broadcast_id,
    ).catch(function(error) {
      console.error(error);
      res.redirect(301, url);
    }).then(function(ogpObj: DocumentData) {
      ogpObj.url = "https://" + host + "/ogp" + param.replace(/\/ogp/gi, "").replace(/\/ogptag/gi, "");
      res.status(200).end(buildOgpTag(ogpObj));
    }).catch(function(error) {
      console.error(error);
      res.redirect(301, url);
    });
  } else {
    res.redirect(301, url);
  }
});
