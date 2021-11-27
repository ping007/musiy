import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import cors from "./common/cors";

export const broadcast_signal_pause = functions
  .region("asia-northeast1")
  .https
  .onRequest(async (req, res) => {
    cors(req, res, async () => {
      const channelId = req.body;
      const query = admin
        .firestore()
        .collection("broadcast_signals")
        .doc(channelId)
        .collection("signal");
      try {
        await query.add({
          type: "pause",
          createdAt: new Date(),
        });
        res.status(200).send("OK");
      } catch (err) {
        res.status(500).send(err);
      }
    });
  });