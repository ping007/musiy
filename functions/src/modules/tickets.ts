import { v4 as uuidv4 } from "uuid";
import { Postgres } from "./common/dao";

const sql_insert_tickets = `
INSERT INTO tickets (
  ticket_id, purchase_id, is_watched, cr_user_id, cr_datetime, up_user_id, up_datetime
)
VALUES ( $1, $2, false, $3, now(), $3, now())
`;

export const trnInsertTickets = async function(
  db: Postgres,
  purchaseId: string,
  crUserId: string
) {
  const ticketId = uuidv4();
  return await db.execute(sql_insert_tickets, [ticketId, purchaseId, crUserId]);
};
