import * as functions from "firebase-functions";
import { execSingleQueryWithParams } from "./common/dao";
const runtimeOpts: any = {
  memory: "256MB",
};

const sql_select_views_by_content_id =
  `
  SELECT 
    views
  FROM
    content_views
  WHERE
    content_id = $1
`;

const selectViewsByContentId = function(contentId: string) {
  const params = [contentId];
  return execSingleQueryWithParams(sql_select_views_by_content_id, params);
};

export const select_views_by_content_id = functions
  .region("asia-northeast1")
  .runWith(runtimeOpts)
  .https.onCall((data, context) => {
    return selectViewsByContentId(data.contentId).then((result) => {
      return result;
    });
  });

const sql_upsert_views = `
INSERT INTO content_views (content_id, views)
  VALUES ($1, $2)
  ON CONFLICT ON CONSTRAINT content_views_pkey
  DO UPDATE SET content_id=$1, views=$2
`;

const upsertViews = function(
  contentId: string,
  views: number,
) {
  const params = [
    contentId,
    String(views),
  ];
  return execSingleQueryWithParams(sql_upsert_views, params);
};

export const upsert_views = functions
  .region("asia-northeast1")
  .https.onCall((data, context) => {
    return upsertViews(
      data.contentId,
      data.views,
    ).then((result) => {
      return result;
    });
  });

