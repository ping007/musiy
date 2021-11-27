import * as functions from "firebase-functions";
import * as Encoding from "encoding-japanese";
import { execSingleQueryWithParams } from "./common/dao";
import * as moment from "moment";
const { Result } = require("pg/lib/result");
const { Parser } = require("tsv");
const util = require("util");

const jasrac_music_permission_code = functions.config().copyright.jasrac
  .permission.music.code;
const jasrac_movie_permission_code = functions.config().copyright.jasrac
  .permission.movie.code;
const nextone_music_permission_code = functions.config().copyright.nextone
  .permission.music.code;
const nextone_movie_permission_code = functions.config().copyright.nextone
  .permission.movie.code;

const COPYRIGHT = {
  Nextone: "nextone",
  Jasrac: "jasrac",
} as const;

const MEDIA = {
  Music: "music",
  Movie: "movie",
} as const;

const sql_select = `
  SELECT m.interface_code,
         CASE
             WHEN m.media_type = 'movie' AND count(*) OVER (PARTITION BY m.parent_content_id) >= 2 THEN
                 'Q'
             ELSE ''
             END                               as content_division,
         CASE
             WHEN m.media_type = 'movie' AND count(*) OVER (PARTITION BY m.parent_content_id) >= 2 THEN
                 to_char(row_number() OVER (PARTITION BY m.parent_content_id ORDER BY m.detail_id), 'FM000')
             ELSE '000'
             END                               as content_branch,
         CASE
             WHEN m.media_type = 'music' AND count(*) OVER (PARTITION BY m.parent_content_id) >= 2 THEN
                 'M'
             ELSE ''
             END                               as medley_division,
         CASE
             WHEN m.media_type = 'music' AND count(*) OVER (PARTITION BY m.parent_content_id) >= 2 THEN
                 to_char(row_number() OVER (PARTITION BY m.parent_content_id ORDER BY m.detail_id), 'FM000')
             ELSE '000'
             END                               as medley_branch,
         m.correct_code,
         m.copyright_code,
         m.title,
         m.detail_title,
         ''                                    as japanese_title,
         ''                                    as lyricist,
         ''                                    as translator,
         m.composer,
         ''                                    as arranger,
         ''                                    as artist_name,
         trunc(m.price * m.output_play_counts) as information_fee,
         'V'                                   as ivt_division,
         3                                     as original_translation_division,
         ''                                    as il_division,
         m.output_play_counts                  as request_count
  from ( %s ) m
  ORDER BY interface_code, content_branch, medley_branch
`;

const movie_select_query = `
  SELECT 'movie'               as media_type,
        SPLIT_PART(m.movie_id, '/', 3)            as interface_code,
        md.music_detail_id    as detail_id,
        md.music_detail_title as detail_title,
        m.title,m.output_play_counts,m.price,md.parent_content_id,md.copyright_type,md.copyright_code,md.composer,md.arranger,md.lyricist,md.correct_code
  FROM music_details md INNER JOIN movies m ON md.parent_content_id = m.movie_id
  WHERE md.copyright_type = $1
`;

const music_select_query = `
  SELECT 'music'               as media_type,
        SPLIT_PART(m.music_id, '/', 3)            as interface_code,
        md.music_detail_id    as detail_id,
        md.music_detail_title as detail_title,
        m.title,m.output_play_counts,m.price,md.parent_content_id,md.copyright_type,md.copyright_code,md.composer,md.arranger,md.lyricist,md.correct_code
  FROM music_details md INNER JOIN musics m ON md.parent_content_id = m.music_id
  WHERE md.copyright_type = $1
`;

const update_musics_output_play_counts = `
  UPDATE musics
  SET output_play_counts=0
  WHERE music_id = ANY($1)
`;

const update_movies_output_play_counts = `
  UPDATE movies
  SET output_play_counts=0
  WHERE movie_id = ANY($1)
`;

const selectReport = function(
  mediaType: typeof MEDIA[keyof typeof MEDIA],
  copyrightType: typeof COPYRIGHT[keyof typeof COPYRIGHT]
) {
  let query = "";
  if (mediaType === MEDIA.Music) {
    query = util.format(sql_select, music_select_query);
  } else if (mediaType === MEDIA.Movie) {
    query = util.format(sql_select, movie_select_query);
  }

  return execSingleQueryWithParams(query, [copyrightType]);
};

const updateCounts = function(
  mediaType: typeof MEDIA[keyof typeof MEDIA],
  ids: string[]
) {
  let query = "";
  if (mediaType === MEDIA.Music) {
    query = update_musics_output_play_counts;
  } else if (mediaType === MEDIA.Movie) {
    query = update_movies_output_play_counts;
  }
  return execSingleQueryWithParams(query, [Array.from(new Set(ids))]);
};

export const usage_report = functions
  .region("asia-northeast1")
  .https.onRequest((request: any, response: any) => {
    if (
      request.query.copyright === undefined ||
      typeof request.query.copyright !== "string" ||
      !request.query.copyright.match("^(jasrac|nextone)$")
    ) {
      response.statusCode = 400;
      response.statusMessage = "parameter copyright has error";
      return response.send();
    }

    if (
      request.query.media === undefined ||
      typeof request.query.media !== "string" ||
      !request.query.media.match("^(music|movie)$")
    ) {
      response.statusCode = 400;
      response.statusMessage = "parameter media has error";
      return response.send();
    }

    const copyrightType = request.query
      .copyright as typeof COPYRIGHT[keyof typeof COPYRIGHT];
    const mediaType = request.query.media as typeof MEDIA[keyof typeof MEDIA];

    return selectReport(mediaType, copyrightType)
      .then((result: typeof Result) => {
        const completeRes: object[] = [];
        const ids: string[] = [];
        result.rows.forEach((row: any) => {
          ids.push(row.interface_code);
          // nextone用仕様
          if (copyrightType === COPYRIGHT.Nextone) {
            row.nextone_name = "NXT";
            row.nextone_code = "";
          }

          //複数のコンテンツの場合
          if (row.medley_division === "M" && row.medley_branch === "001") {
            const parent = JSON.parse(JSON.stringify(row));
            delete parent.detail_title;
            parent.medley_branch = "000";
            parent.copyright_code = "";
            parent.composer = "";
            parent.correct_code = "";
            completeRes.push(parent);
          } else if (row.content_division === "Q" && row.content_branch === "001") {
            const parent = JSON.parse(JSON.stringify(row));
            delete parent.detail_title;
            parent.content_branch = "000";
            parent.copyright_code = "";
            parent.composer = "";
            parent.correct_code = "";
            completeRes.push(parent);
          }
          row.title = row.detail_title;
          delete row.detail_title;
          completeRes.push(row);
        });

        //tsv化、文字コード変更
        const tsv = new Parser("\t", { header: false });
        const code = Encoding.stringToCode(tsv.stringify(completeRes));
        const codeCnv = Encoding.convert(code, "SJIS", "UNICODE");
        const tsvData = Encoding.codeToString(codeCnv);

        //出力ファイル名
        let filename = "unknown_filename.txt";
        if (copyrightType === COPYRIGHT.Jasrac && mediaType === MEDIA.Music) {
          filename =
            jasrac_music_permission_code +
            moment()
              .subtract(1, "M")
              .format("YYYYMM") +
            ".txt";
        } else if (
          copyrightType === COPYRIGHT.Jasrac &&
          mediaType === MEDIA.Movie
        ) {
          filename =
            jasrac_movie_permission_code +
            moment()
              .subtract(1, "M")
              .format("YYYYMM") +
            ".txt";
        } else if (
          copyrightType === COPYRIGHT.Nextone &&
          mediaType === MEDIA.Music
        ) {
          filename =
            nextone_music_permission_code +
            "-" +
            moment().subtract(1, "M").format("YYYYMM") + ".txt";
        } else if (
          copyrightType === COPYRIGHT.Nextone &&
          mediaType === MEDIA.Movie
        ) {
          filename =
            nextone_movie_permission_code +
            "-" +
            moment().subtract(1, "M").format("YYYYMM") + ".txt";
        }

        //カウント数リセット
        return updateCounts(mediaType, ids)
          .then((res) => {
            response.setHeader(
              "Content-disposition",
              `attachment; filename=${filename}`
            );
            response.contentType("text/tsv");
            response.charset = "Shift_JIS";
            response.statusCode = 200;
            response.end(tsvData, "binary");
          })
          .catch((err) => {
            response.statusCode = 500;
            response.send("エラー発生： " + err);
          });
      })
      .catch((err) => {
        response.statusCode = 500;
        response.send("エラー発生： " + err);
      });
  });
