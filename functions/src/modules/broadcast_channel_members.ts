import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import cors from "./common/cors";

export const broadcast_channel_member_remove = functions
  .region("asia-northeast1")
  .https
  .onRequest(async (req, res) => {
    cors(req, res, async () => {
      const { channelId, userId } = JSON.parse(req.body);
      const query = admin
        .firestore()
        .collection("broadcast_channel_members")
        .doc(channelId)
        .collection("member")
        .doc(userId);
      try {
        await query.delete();
        res.status(200).send("OK");
      } catch (err) {
        res.status(500).send(err);
      }
    });
  });