import * as functions from "firebase-functions";
const { Pool } = require("pg");

const connectionName = functions.config().cloudsql.connectionname; // musiy-dev:asia-northeast1:musiy-dev-db
const dbUser = functions.config().cloudsql.dbuser; // postgres
const dbPass = functions.config().cloudsql.dbpass; // musiy-dev
const dbName = functions.config().cloudsql.dbname; // musiy_dev

const pgPool = new Pool({
  max: 10,
  host: "/cloudsql/" + connectionName,
  user: dbUser,
  password: dbPass,
  database: dbName,
  port: 5432,
});

export const execSingleQueryWithParams = function(
  sql: string,
  params: Array<string|Array<string>>
) {
  return new Promise(function(resolve, reject) {
    pgPool.connect().then((client: any) => {
      return client
        .query(sql, params)
        .then((res: any) => {
          client.release();
          resolve(res);
        })
        .catch((e: any) => {
          client.release();
          console.error(e.stack);
          reject(e);
        });
    });
  });
};

export class Postgres {
  private client: any;
  async init() {
    this.client = await pgPool.connect();
  }
  async execute(query: string, params: any[] = []) {
    return await this.client.query(query, params);
  }
  async release() {
    await this.client.release(true);
  }
  async begin() {
    await this.client.query("BEGIN");
  }
  async commit() {
    await this.client.query("COMMIT");
  }
  async rollback() {
    await this.client.query("ROLLBACK");
  }
}
const getClient = async () => {
  const postgres = new Postgres();
  await postgres.init();
  return postgres;
};

export const execMultiQueryWithTransaction = function(
  func: (db: Postgres, ...param: any) => any,
  ...param: any
) {
  return new Promise(async function(resolve, reject) {
    const db = await getClient();
    try {
      await db.begin();
      const res = await func(db, ...param);
      await db.commit();
      resolve(res);
    } catch (e) {
      console.error(e.stack);
      await db.rollback();
      reject(e);
    } finally {
      await db.release();
    }
  });
};
