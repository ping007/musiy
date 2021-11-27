import * as functions from "firebase-functions";
import { execSingleQueryWithParams } from "./common/dao";

const sql_select_music_details_by_parent_content_id = `
  SELECT 
    music_detail_id AS "musicDetailId",
    parent_content_id AS "parentContentId",
    music_detail_title AS "musicDetailTitle",
    music_detail_description AS "musicDetailDescription",
    copyright_type AS "copyrightType",
    copyright_code AS "copyrightCode",
    composer AS "composer",
    arranger AS "arranger",
    lyricist AS "lyricist"
  FROM music_details
  WHERE music_details.parent_content_id = $1
`;

const selectMusicDetailsByParentContentId = function(parentContentId: string) {
  const params = [parentContentId];
  return execSingleQueryWithParams(
    sql_select_music_details_by_parent_content_id,
    params
  );
};

export const select_music_details_by_parent_content_id = functions
  .region("asia-northeast1")
  .https.onCall((data, context) => {
    return selectMusicDetailsByParentContentId(data.parentContentId).then(
      (result) => {
        return result;
      }
    );
  });

const sql_upsert_music_detail = `
INSERT INTO music_details (music_detail_id, parent_content_id, music_detail_title, music_detail_description, copyright_type, copyright_code, composer,
      arranger, lyricist)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
  ON CONFLICT ON CONSTRAINT music_details_pkey
  DO UPDATE SET music_detail_id=$1, parent_content_id=$2, music_detail_title=$3, music_detail_description=$4, copyright_type=$5, copyright_code=$6, composer=$7,
      arranger=$8, lyricist=$9
`;

const upsertMusicDetail = function(
  musicDetailId: string,
  parentContentId: string,
  musicDetailTitle: string,
  musicDetailDescription: string,
  copyrightType: string,
  copyrightCode: string,
  composer: string,
  arranger: string,
  lyricist: string
) {
  const params = [
    musicDetailId,
    parentContentId,
    musicDetailTitle,
    musicDetailDescription,
    copyrightType,
    copyrightCode,
    composer,
    arranger,
    lyricist,
  ];
  return execSingleQueryWithParams(sql_upsert_music_detail, params);
};

export const upsert_music_detail = functions
  .region("asia-northeast1")
  .https.onCall((data, context) => {
    return upsertMusicDetail(
      data.musicDetailId,
      data.parentContentId,
      data.musicDetailTitle,
      data.musicDetailDescription,
      data.copyrightType,
      data.copyrightCode,
      data.composer,
      data.arranger,
      data.lyricist
    ).then((result) => {
      return result;
    });
  });

  const sql_delete_music_detail = `
  DELETE FROM
    music_details
  WHERE
    music_detail_id = $1
`;

const deleteMusicDetail = function(
  musicDetailId: string,
) {
  const params = [musicDetailId];
  return execSingleQueryWithParams(sql_delete_music_detail, params);
};

export const delete_music_detail = functions
  .region("asia-northeast1")
  .https.onCall((data, context) => {
    return deleteMusicDetail(
      data.musicDetailId,
    ).then((result) => {
      return result;
    });
  });
