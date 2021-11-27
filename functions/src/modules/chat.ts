import * as functions from "firebase-functions";
import { chat_ng_word } from "./chat_ng_word";
const regex_str = chat_ng_word.split("\n").join("|");
const regex = new RegExp(`(${regex_str})`);

export const is_valid_message = functions
  .region("asia-northeast1")
  .https.onCall((data, context) => {
    if (!data.message) {
      console.log("data.message is not found");
      throw new functions.https.HttpsError(
        "invalid-argument",
        "data.message is undefined.",
        data
      );
    }
    return !regex.test(data.message);
  });
