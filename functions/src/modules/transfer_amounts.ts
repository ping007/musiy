import * as functions from "firebase-functions";
import { v4 as uuidv4 } from "uuid";
import * as Handlebars from "handlebars";
import {
  execSingleQueryWithParams,
  execMultiQueryWithTransaction,
  Postgres,
} from "./common/dao";
import {
  newTransferAmountMailTitle,
  newTransferAmountMailContext,
} from "./mail/template/new_transfer_amount";
import { sendMail } from "./mail/mailer";

const columns = `
    transfer_amounts.transfer_amount_id AS "transferAmountId",
    transfer_amounts.amount AS "amount",
    transfer_amounts.transfer_user_id AS "transferUserId",
    transfer_amounts.is_transferred AS "isTransferred",
    transfer_amounts.cr_user_id AS "crUserId",
    to_char(transfer_amounts.cr_datetime,'YYYY/MM/DD HH24:MI:SS') AS "crDatetime"`;

const sql_select_transfer_amounts =
  `
  SELECT
  ` +
  columns +
  ` ,
  users.username AS "userName",
  users.image_id AS "userImageId"
  FROM transfer_amounts
  LEFT JOIN users
  ON transfer_amounts.transfer_user_id = users.user_id

`;

const selectTransferAmounts = function() {
  const params = [];
  return execSingleQueryWithParams(sql_select_transfer_amounts, params);
};

export const select_transfer_amounts = functions
  .region("asia-northeast1")
  .https.onCall((data, context) => {
    return selectTransferAmounts().then((result) => {
      return result;
    });
  });

const sql_select_transfer_amount_by_user_id =
  `
  SELECT
   ` +
  columns +
  ` 
  FROM transfer_amounts 
  WHERE transfer_amounts.transfer_user_id = $1
`;

const selectTransferAmountByUserId = function(userId: string) {
  const params = [userId];
  return execSingleQueryWithParams(
    sql_select_transfer_amount_by_user_id,
    params
  );
};

export const select_transfer_amount_by_user_id = functions
  .region("asia-northeast1")
  .https.onCall((data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "The function must be called " + "while authenticated."
      );
    }
    return selectTransferAmountByUserId(context.auth?.uid).then((result) => {
      return result;
    });
  });

const sql_select_total_amount_pendding_withdrawal_by_user_id = `
  SELECT
    SUM(transfer_amounts.amount) AS "amountPenddingWirhdrawal"
  FROM transfer_amounts 
  WHERE transfer_amounts.transfer_user_id = $1 AND transfer_amounts.is_transferred = false
`;

const selectTotalAmountPenddingWithdrawalByUserId = function(userId: string) {
  const params = [userId];
  return execSingleQueryWithParams(
    sql_select_total_amount_pendding_withdrawal_by_user_id,
    params
  );
};

export const select_total_amount_pendding_withdrawal_by_user_id = functions
  .region("asia-northeast1")
  .https.onCall((data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "The function must be called " + "while authenticated."
      );
    }
    return selectTotalAmountPenddingWithdrawalByUserId(context.auth?.uid).then(
      (result) => {
        return result;
      }
    );
  });

const sql_insert_transfer_amount = `
INSERT INTO transfer_amounts (
  transfer_amount_id, amount, transfer_user_id, is_transferred, cr_user_id, cr_datetime
)
VALUES ( $1, $2, $3, false, $3, now())
`;

export const trnInsertTransferAmount = async function(
  db: Postgres,
  amount: number,
  transferUserId: string
) {
  const transferAmountId = uuidv4();
  return await db.execute(sql_insert_transfer_amount, [
    transferAmountId,
    String(amount),
    transferUserId,
  ]);
};

export const sendNewTransferAmountMail = async function() {
  const mailTitle = newTransferAmountMailTitle;
  const mailContext = newTransferAmountMailContext;
  const template = Handlebars.compile(mailContext);
  const content = template({});
  const gmailEmail = functions.config().gmail.email;
  await sendMail(gmailEmail, mailTitle, content);
};

export const insert_transfer_amount = functions
  .region("asia-northeast1")
  .https.onCall((data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "The function must be called " + "while authenticated."
      );
    }
    return execMultiQueryWithTransaction(
      trnInsertTransferAmount,
      data.amount,
      context.auth?.uid
    ).then(async (result) => {
      await sendNewTransferAmountMail();
      return result;
    });
  });

const sql_update_transfer_is_transferred = `
UPDATE transfer_amounts SET is_transferred = true WHERE transfer_amount_id = $1
`;

const updateTransferIsTransferred = function(transferAmountId: string) {
  const params = [transferAmountId];
  return execSingleQueryWithParams(sql_update_transfer_is_transferred, params);
};

export const update_transfer_is_transferred = functions
  .region("asia-northeast1")
  .https.onCall((data, context) => {
    return updateTransferIsTransferred(data.transferAmountId).then((result) => {
      return result;
    });
  });

export const is_master_account = functions
  .region("asia-northeast1")
  .https.onCall((data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "The function must be called " + "while authenticated."
      );
    }
    return functions.config().management.master_user_id
      ? context.auth?.uid === functions.config().management.master_user_id
      : false;
  });
