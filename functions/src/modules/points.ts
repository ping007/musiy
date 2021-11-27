import * as functions from "firebase-functions";
import { v4 as uuidv4 } from "uuid";
import { execSingleQueryWithParams, Postgres } from "./common/dao";

const sql_select_points_by_user_id = `
  SELECT
    points.point_id AS "pointId",
    points.user_id AS "userId",
    points.point AS "point",
    points.point_type AS "pointType",
    points.total_points AS "totalPoints",
    points.cr_user_id AS "crUserId",
    to_char(points.cr_datetime,'YYYY/MM/DD HH24:MI:SS') AS "crDatetime"
  FROM points
  WHERE points.user_id = $1
  ORDER BY points.cr_datetime DESC
`;

const selectPointsByUserId = function(userId: string) {
  const params = [userId];
  return execSingleQueryWithParams(sql_select_points_by_user_id, params);
};

export const select_points_by_user_id = functions
  .region("asia-northeast1")
  .https.onCall((data, context) => {
    return selectPointsByUserId(data.userId).then((result) => {
      return result;
    });
  });

const sql_insert_point = `
  INSERT INTO points ( point_id, user_id, point, point_type, total_points,
    cr_user_id, cr_datetime)
  VALUES ($1, $2, $3, $4, $3  +
  COALESCE((SELECT CASE points2.total_points WHEN NULL THEN 0
  ELSE points2.total_points END FROM points AS points2
  WHERE points2.user_id = $2
  ORDER BY points2.cr_datetime DESC
  LIMIT 1),0), $5, now())
`;

export const trnInsertPoint = async function(
  db: Postgres,
  userId: string,
  point: number,
  pointType: string,
  crUserId: string
) {
  const params = [uuidv4(), userId, String(point), pointType, crUserId];
  return await db.execute(sql_insert_point, params);
};

const sql_select_current_point = `
  SELECT CASE points.total_points WHEN NULL THEN 0 ELSE points.total_points END
  FROM points
  WHERE points.user_id = $1
  ORDER BY points.cr_datetime DESC
  LIMIT 1
`;
export const trnSelectCurrentPoint = async function(
  db: Postgres,
  userId: string
) {
  return await db.execute(sql_select_current_point, [userId]);
};
