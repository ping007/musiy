import * as functions from "firebase-functions";
import axios, { AxiosResponse } from "axios";
import cors from "../common/cors";
​
// const archiveStorageInformation = () => {
//   return functions.config().imageflux.archive.gcs;
// };
​
const hlsTranscodeSetting = (archiveDestinationId) => {
  const projectId = functions.config().musiy.project_id;
  return {
    hls: [{
      durationSeconds: 1,
      startTimeOffset: -2,
      audio: {
        bps: 192/* [kbps] */ * 1000
      },
      video: {
        width: 640,
        height: 480,
        fps: 30,
        bps: 2/* [Mbps] */ * 1000 * 1000
      },
      archive: {
        archive_destination_id: archiveDestinationId
      }
    }],
    encrypt_key_uri: `https://asia-northeast1-${projectId}.cloudfunctions.net/imageflux_hls_member_authentication`,
    // event_webhook_url: `https://asia-northeast1-${projectId}.cloudfunctions.net/imageflux_event_webhook`
  };
};
​
const request = (soraTarget: string, data: any): Promise<AxiosResponse<any>> => {
  const accessToken = functions.config().imageflux.access_token;
​
  return axios.post("https://live-api.imageflux.jp/", data, {
    headers: {
      "Content-Type": "application/json",
      "X-Sora-Target": soraTarget,
      Authorization: `Bearer ${accessToken}`
    }
  });
};
​
export const imageflux_create_channel = functions
  .region("asia-northeast1")
  .https
  .onCall(async (data, context) => {
    const archiveDestinationId: string = "";
    // let archiveDestinationId: string = "";
    // try {
    //   const res1: AxiosResponse<any> = await request("ImageFlux_20190205.CreateArchiveDestination", archiveStorageInformation());
    //   archiveDestinationId = res1.data.archive_destination_id;
    // } catch(err: any) {
    //   return err.response;
    // }
    try {
      const res2: AxiosResponse<any> = await request("ImageFlux_20180905.CreateChannel", hlsTranscodeSetting(archiveDestinationId));
      return res2.data;
    } catch(err) {
      return err.response;
    }
  });
​
export const imageflux_delete_channel = functions
  .region("asia-northeast1")
  .https
  .onCall(async (data, context) => {
    try {
      const res: AxiosResponse<any> = await request("ImageFlux_20180501.DeleteChannel", data);
      return res.data;
    } catch(err) {
      return err.response;
    }
  });
​
export const imageflux_hls_member_authentication = functions
  .region("asia-northeast1")
  .https
  .onRequest(async (req, res) => {
    cors(req, res, async () => {
      const kid: string = String(req.query.kid);
      if (!kid) {
        res.status(400).send("kid is required");
      }
      try {
        const getEncryptKeyRes: AxiosResponse<any> = await request("ImageFlux_20200707.GetEncryptKey", { kid }); 
        res.status(200).send(new Buffer(getEncryptKeyRes.data.encrypt_key, "hex"));
      } catch(err) {
        functions.logger.log('imageflux_hls_member_authentication error: ', err);
        res.status(500).send(err.response);
      }
    });
  });
​
const webhookActions: {[ key: string ]: (body?: any) => string } = {
  "imageflux.archive_created": (body: any) => {
    console.log("== imageflux.archive_created ==");
    console.log("channel_id", body.channel_id);
    console.log("dest_uri", body.data.dest_uri);
    console.log("file_path", body.data.file_path);
    console.log("size", body.data.size);
    console.log("file_type", body.data.file_type);
    if (body.data.file_type === "m3u8") {
      // TODO 録画データのDB登録をここに実装する
    }
    return "succeed";
  },
  "imageflux.archive_failed": (body: any) => {
    console.log("== imageflux.archive_failed ==");
    return "failed";
  },
};
​
export const imageflux_event_webhook = functions
  .region("asia-northeast1")
  .https
  .onRequest((req, res) => {
    const body: any = req.body;
    const action: (body?: any) => string = webhookActions[body.type] || (() => "do nothing");
    try {
      const actionResult: string = action(body);
      res.status(200).send(actionResult);
    } catch(err) {
      res.status(500).send("an error has occurred");
    }
  });