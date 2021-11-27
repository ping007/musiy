import * as functions from "firebase-functions";

const target_index = "sakuhindb";
const { Client } = require("@elastic/elasticsearch");

const client = new Client({
  cloud: {
    id: functions.config().es.cloud.id,
  },
  auth: {
    username: functions.config().es.auth.username,
    password: functions.config().es.auth.password
  }
});

async function es_search_music (title:string, singer:string, size:number = 20,) {
  const match = [];
  if (title) {
    match.push({ match: { title } });
  }
  if (singer) {
    match.push({ match: { singer } });
  }
  const body_query = { query: { bool: { must: match } } };

  const { body } = await client.search({
    index: target_index,
    size,
    body: body_query,
    _source: [
      "sakuhin_id",
      "title",
      "singer"
    ]
  }, {
    ignore: [404],
    maxRetries: 3
  });
  return body;
}

const searchMusic = function(title:string, singer:string, size: number) {
  return new Promise(function(resolve, reject) {
    es_search_music(title, singer, size).then((body) => {
      if (body.hits.total.value <= 0) {
        resolve([]);
      }
      resolve(body.hits.hits);
    }).catch((e) => {
      console.error(e.stack);
      reject(e);
    });
  });
};

export const search_music = functions
  .region("asia-northeast1")
  .https.onCall((data, context) => {
    return searchMusic(data.title, data.singer, data.size).then((result: any) => {
      return result;
    });
  });
