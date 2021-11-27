import * as functions from "firebase-functions";
import { execSingleQueryWithParams } from "./common/dao";

const sql_select_allowed_content_by_content_id = `
SELECT
  content_id AS "contentId",
  plan_id AS "planId",
  plan_name AS "planName",
  plan_price AS "planPrice",
  to_char(cr_datetime,'YYYY/MM/DD HH24:MI:SS') AS "crDatetime"
FROM
  allowed_contents
WHERE
  content_id = $1
`;

const selectAllowedContentByContentId = function(
  contentId: string
) {
  const params = [contentId];
  return execSingleQueryWithParams(sql_select_allowed_content_by_content_id, params);
};

export const select_allowed_content_by_content_id = functions
  .region("asia-northeast1")
  .https.onCall((data, context) => {
    return selectAllowedContentByContentId(
      data.contentId
    ).then((result) => {
      return result;
    });
  });

const sql_upsert_allowed_content = `
INSERT INTO allowed_contents (content_id, plan_id, plan_name, plan_price, cr_datetime)
  VALUES ($1, $2, $3, $4, now())
  ON CONFLICT ON CONSTRAINT allowed_contents_pkey
  DO UPDATE SET content_id=$1, plan_id=$2, plan_name=$3, plan_price=$4
`;

const upsertAllowedContent = function(
  contentId: string,
  planId: string,
  planName: string,
  planPrice: number
) {
  const params = [contentId, planId, planName, String(planPrice)];
  return execSingleQueryWithParams(sql_upsert_allowed_content, params);
};

export const upsert_allowed_content = functions
  .region("asia-northeast1")
  .https.onCall((data, context) => {
    return upsertAllowedContent(
      data.contentId,
      data.planId,
      data.planName,
      data.planPrice
    ).then((result) => {
      return result;
    });
  });

const sql_delete_allowed_content = `
  DELETE FROM
    allowed_contents
  WHERE
    content_id = $1
    AND plan_id = $2;
`;

const deleteAllowedContent = function(
  contentId: string,
  planId: string,
) {
  const params = [contentId, planId];
  return execSingleQueryWithParams(sql_delete_allowed_content, params);
};

export const delete_allowed_content = functions
  .region("asia-northeast1")
  .https.onCall((data, context) => {
    return deleteAllowedContent(
      data.contentId,
      data.planId
    ).then((result) => {
      return result;
    });
  });