import * as functions from "firebase-functions";
import { execSingleQueryWithParams } from "./common/dao";
const runtimeOpts: any = {
  memory: "2GB",
};
const columns = `
    plans.plan_id AS "planId",
    plans.user_id AS "userId",
    plans.plan_name AS "planName",
    plans.plan_description AS "planDescription",
    plans.plan_price AS "planPrice",
    plans.plan_image_id AS "planImageId",
    plans.cr_user_id AS "crUserId",
    to_char(plans.cr_datetime,'YYYY/MM/DD HH24:MI:SS') AS "crDatetime",
    plans.up_user_id AS "upUserId",
    to_char(plans.up_datetime,'YYYY/MM/DD HH24:MI:SS') AS "upDatetime"
`;

const sql_select_plans_by_user_id = `
  SELECT 
  ${columns} 
  FROM plans 
  WHERE plans.user_id = $1
  ORDER BY plans.plan_price ASC
`;

const selectPlansByUserId = function(userId: string) {
  const params = [userId];
  return execSingleQueryWithParams(sql_select_plans_by_user_id, params);
};

export const select_plans_by_user_id = functions
  .region("asia-northeast1")
  .runWith(runtimeOpts)
  .https.onCall((data, context) => {
    return selectPlansByUserId(data.userId).then((result) => {
      return result;
    });
  });

const sql_select_plan_by_supporter_user_id = `
  SELECT 
  ${columns} 
  ,
  supporters.is_enable AS "isEnable"
  FROM plans 
  INNER JOIN supporters
  ON supporters.artist_user_id = plans.user_id
  WHERE plans.plan_id = supporters.plan_id
  AND plans.user_id = $1
  AND supporters.supporter_user_id = $2
  AND supporters.is_enable = TRUE
`;

const selectPlanBySupporterUserId = function(
  artistUserId: string,
  supporterUserId: string
) {
  const params = [artistUserId, supporterUserId];
  return execSingleQueryWithParams(
    sql_select_plan_by_supporter_user_id,
    params
  );
};

export const select_plan_by_supporter_user_id = functions
  .region("asia-northeast1")
  .runWith(runtimeOpts)
  .https.onCall((data, context) => {
    return selectPlanBySupporterUserId(
      data.artistUserId,
      data.supporterUserId
    ).then((result) => {
      return result;
    });
  });

const sql_select_plan_by_plan_id = `
  SELECT 
  ${columns} 
  FROM plans 
  WHERE plans.plan_id = $1
`;

export const selectPlanByPlanId = function(planId: string) {
  const params = [planId];
  return execSingleQueryWithParams(sql_select_plan_by_plan_id, params);
};

export const select_plan_by_plan_id = functions
  .region("asia-northeast1")
  .runWith(runtimeOpts)
  .https.onCall((data, context) => {
    return selectPlanByPlanId(data.planId).then((result) => {
      return result;
    });
  });

const sql_select_plan_by_plan_ids = `
  SELECT 
  ${columns} 
  FROM plans 
  WHERE plans.plan_id = any($1)
`;

export const selectPlanByPlanIds = function(planIds: Array<string>) {
  const params = [planIds];
  return execSingleQueryWithParams(sql_select_plan_by_plan_ids, params);
};

export const select_plan_by_plan_ids = functions
  .region("asia-northeast1")
  .runWith(runtimeOpts)
  .https.onCall((data, context) => {
    return selectPlanByPlanIds(data.planIds).then((result) => {
      return result;
    });
  });

const sql_upsert_plan = `
INSERT INTO plans ( plan_id, user_id, plan_name, plan_description, plan_price, plan_image_id,
    cr_user_id, cr_datetime, up_user_id, up_datetime)
  VALUES ($1, $2, $3, $4, $5, $6, $7, now(), $8, now())
  ON CONFLICT ON CONSTRAINT plans_pkey
  DO UPDATE SET plan_id=$1, user_id=$2, plan_name=$3,
    plan_description=$4, plan_price=$5, plan_image_id=$6, up_user_id=$8, up_datetime=now()
`;

const upsertPlan = function(
  planId: string,
  userId: string,
  planName: string,
  planDescription: string,
  planPrice: number,
  planImageId: string,
  crUserId: string,
  upUserId: string
) {
  const params = [
    planId,
    userId,
    planName,
    planDescription,
    String(planPrice),
    planImageId,
    crUserId,
    upUserId,
  ];
  return execSingleQueryWithParams(sql_upsert_plan, params);
};

export const upsert_plan = functions
  .region("asia-northeast1")
  .runWith(runtimeOpts)
  .https.onCall((data, context) => {
    return upsertPlan(
      data.planId,
      data.userId,
      data.planName,
      data.planDescription,
      data.planPrice,
      data.planImageId,
      data.crUserId,
      data.upUserId
    ).then((result) => {
      return result;
    });
  });
