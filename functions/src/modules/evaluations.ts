import * as functions from "firebase-functions";
import { execSingleQueryWithParams } from "./common/dao";
const runtimeOpts: any = {
  memory: "2GB",
};
const sql_select_evaluations = `
  SELECT
    evaluations.evaluation_id AS "evaluationId",
    evaluations.content_id AS "contentId",
    evaluations.user_id AS "userId",
    users.username AS "username",
    users.image_id AS "userImageId",
    evaluations.is_liked AS "isLiked",
    evaluations.evaluation_comment AS "evaluationComment",
    evaluations.rating AS "rating",
    evaluations.is_show_comment AS "isShowComment",
    evaluations.cr_user_id AS "crUserId",
    to_char(evaluations.cr_datetime,'YYYY/MM/DD HH24:MI:SS') AS "crDatetime"
  FROM evaluations
  LEFT JOIN users
  ON evaluations.user_id = users.user_id
`;

const sql_select_evaluations_by_content_id = `
  ${sql_select_evaluations}
  WHERE evaluations.content_id = $1
`;

const selectEvaluationsByContentId = function(contentId: string) {
  const params = [contentId];
  return execSingleQueryWithParams(
    sql_select_evaluations_by_content_id,
    params
  );
};

export const select_evaluations_by_content_id = functions
  .region("asia-northeast1")
  .runWith(runtimeOpts)
  .https.onCall((data, context) => {
    return selectEvaluationsByContentId(data.contentId).then((result) => {
      return result;
    });
  });

const sql_select_evaluations_comments_by_content_id =
  sql_select_evaluations_by_content_id +
  `AND evaluations.evaluation_comment IS NOT NULL
  AND evaluations.evaluation_comment <> ''
  ORDER BY evaluations.cr_datetime DESC`;
const selectEvaluationsCommentsByContentId = function(contentId: string) {
  const params = [contentId];
  return execSingleQueryWithParams(
    sql_select_evaluations_comments_by_content_id,
    params
  );
};

export const select_evaluations_comments_by_content_id = functions
  .region("asia-northeast1")
  .runWith(runtimeOpts)
  .https.onCall((data, context) => {
    return selectEvaluationsCommentsByContentId(data.contentId).then(
      (result) => {
        return result;
      }
    );
  });

const sql_select_evaluations_is_liked_by_content_id =
  sql_select_evaluations_by_content_id + `AND evaluations.is_liked = TRUE`;

const selectEvaluationsIsLikedByContentId = function(contentId: string) {
  const params = [contentId];
  return execSingleQueryWithParams(
    sql_select_evaluations_is_liked_by_content_id,
    params
  );
};

export const select_evaluations_is_liked_by_content_id = functions
  .region("asia-northeast1")
  .runWith(runtimeOpts)
  .https.onCall((data, context) => {
    return selectEvaluationsIsLikedByContentId(data.contentId).then(
      (result) => {
        return result;
      }
    );
  });

const sql_select_evaluations_is_liked_by_content_id_and_user_id =
  sql_select_evaluations_by_content_id +
  `AND evaluations.is_liked=TRUE AND evaluations.user_id=$2`;

const selectEvaluationsIsLikedByContentIdAndUserId = function(
  contentId: string,
  userId: string
) {
  const params = [contentId, userId];
  return execSingleQueryWithParams(
    sql_select_evaluations_is_liked_by_content_id_and_user_id,
    params
  );
};

export const select_evaluations_is_liked_by_content_id_and_user_id = functions
  .region("asia-northeast1")
  .runWith(runtimeOpts)
  .https.onCall((data, context) => {
    return selectEvaluationsIsLikedByContentIdAndUserId(
      data.contentId,
      data.userId
    ).then((result) => {
      return result;
    });
  });

const sql_select_evaluations_by_user_id = `
  SELECT
    evaluations.evaluation_id AS "evaluationId",
    evaluations.content_id AS "contentId",
    evaluations.user_id AS "userId",
    users.username AS "username",
    users.image_id AS "userImageId",
    evaluations.is_liked AS "isLiked",
    evaluations.evaluation_comment AS "evaluationComment",
    evaluations.rating AS "rating",
    evaluations.cr_user_id AS "crUserId",
    to_char(evaluations.cr_datetime,'YYYY/MM/DD HH24:MI:SS') AS "crDatetime"
  FROM evaluations
  LEFT JOIN users
  ON evaluations.user_id = users.user_id
  WHERE evaluations.user_id = $1
`;

const selectEvaluationsByUserId = function(userId: string) {
  const params = [userId];
  return execSingleQueryWithParams(sql_select_evaluations_by_user_id, params);
};

export const select_evaluations_by_user_id = functions
  .region("asia-northeast1")
  .runWith(runtimeOpts)
  .https.onCall((data, context) => {
    return selectEvaluationsByUserId(data.userId).then((result) => {
      return result;
    });
  });

const sql_upsert_evaluation = `
INSERT INTO evaluations (
  evaluation_id, content_id, user_id, is_liked, evaluation_comment, rating, cr_user_id, cr_datetime)
  VALUES ($1, $2, $3, $4, $5, $6, $7, now())
  ON CONFLICT ON CONSTRAINT evaluations_pkey
  DO UPDATE SET evaluation_id=$1, content_id=$2, user_id=$3, is_liked=$4, evaluation_comment=$5, rating=$6, cr_user_id=$7,
  cr_datetime=now()
`;

const upsertEvaluation = function(
  evaluationId: string,
  contentId: string,
  userId: string,
  isLiked: boolean,
  evaluationComment: string,
  rating: number,
  crUserId: string
) {
  const params = [
    evaluationId,
    contentId,
    userId,
    String(isLiked),
    evaluationComment,
    String(rating),
    crUserId,
  ];
  return execSingleQueryWithParams(sql_upsert_evaluation, params);
};

export const upsert_evaluation = functions
  .region("asia-northeast1")
  .runWith(runtimeOpts)
  .https.onCall((data, context) => {
    return upsertEvaluation(
      data.evaluationId,
      data.contentId,
      data.userId,
      data.isLiked,
      data.evaluationComment,
      data.rating,
      data.crUserId
    ).then((result) => {
      return result;
    });
  });

const sql_update_evaluations_is_show_comment_false = `
UPDATE evaluations SET is_show_comment = false WHERE evaluation_id = $1
`;

const updateEvaluationsIsShowCommentFalse = function(evaluationId: string) {
  const params = [evaluationId];
  return execSingleQueryWithParams(
    sql_update_evaluations_is_show_comment_false,
    params
  );
};

export const update_evaluations_is_show_comment_false = functions
  .region("asia-northeast1")
  .https.onCall((data, context) => {
    return updateEvaluationsIsShowCommentFalse(data.evaluationId).then(
      (result) => {
        return result;
      }
    );
  });

const sql_select_evaluations_is_liked_by_user_id = `
  ${sql_select_evaluations}
  WHERE evaluations.is_liked=TRUE AND evaluations.user_id=$1
`;

const selectEvaluationsIsLikedByUserId = function(userId: string) {
  const params = [userId];
  return execSingleQueryWithParams(
    sql_select_evaluations_is_liked_by_user_id,
    params
  );
};

export const select_evaluations_is_liked_by_user_id = functions
  .region("asia-northeast1")
  .runWith(runtimeOpts)
  .https.onCall((data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "The function must be called " + "while authenticated."
      );
    }
    return selectEvaluationsIsLikedByUserId(
      context.auth?.uid
    ).then((result) => {
      return result;
    });
  });

const sql_select_evaluations_is_liked_by_like_content_id = `
  ${sql_select_evaluations}
  WHERE evaluations.content_id LIKE ''||$1||'%'
`;
const selectEvaluationsIsLikedByLikeContentId = function(contentId: string) {
  const params = [contentId];
  return execSingleQueryWithParams(
    sql_select_evaluations_is_liked_by_like_content_id,
    params
  );
};
export const select_evaluations_is_liked_by_like_content_id = functions
  .region("asia-northeast1")
  .runWith(runtimeOpts)
  .https.onCall((data, context) => {
    return selectEvaluationsIsLikedByLikeContentId(
      data.contentId,
    ).then((result) => {
      return result;
    });
  });
