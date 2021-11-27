import fs from "fs";
import https from "https";
import path from "path";
import axios from "axios";
import cors from "cors";
import express from "express";
import config from "./config.json";

const app = express();
app.use(express.json());
app.use(cors());

let server = app;
let port = 3080;
if (process.env.ssl) {
  server = https.createServer({
    key: fs.readFileSync(path.resolve(__dirname, "../../certificate/localhost+2-key.pem")),
    cert: fs.readFileSync(path.resolve(__dirname, "../../certificate/localhost+2.pem"))
  }, app);
  port = 3480;
}
server.listen(port, () => {
  console.log(`imageflux channel management listening on port ${port}!`);
  createChannel("no-login-streaming-test");
});

const channels = {};

process.on("SIGINT", async () => {
  await Promise.all(Object.keys(channels).map(async (name) => {
    await deleteChannel(name);
  }));
  process.exit();
});

const archiveStorageInformation = () => {
  return {
    bucket_uri: config.archive.gcs.bucketUri,
    gcp_credential_json: fs.readFileSync(path.resolve(__dirname, "../../gcs-service-account.json"), "utf-8")
  };
};

const hlsTranscodeSetting = (archiveDestinationId) => {
  return {
    hls: [{
      durationSeconds: 1,
      startTimeOffset: -2,
      audio: {
        bps: 192/* [kbps] */ * 1000// [bps]
      },
      video: {
        width: 640,
        height: 480,
        fps: 30,
        bps: 2/* [Mbps] */ * 1000 * 1000// [bps]
      },
      archive: {
        archive_destination_id: archiveDestinationId
      }
    }],
    encrypt_key_uri: "https://asia-northeast1-musiy-dev.cloudfunctions.net/imageflux_hls_member_authentication",
    event_webhook_url: "https://asia-northeast1-musiy-dev.cloudfunctions.net/imageflux_event_webhook"
  };
};

const request = (soraTarget, data) => {
  return axios.post("https://live-api.imageflux.jp/", data, {
    headers: {
      "Content-Type": "application/json",
      "X-Sora-Target": soraTarget,
      Authorization: `Bearer ${config.accessToken}`
    }
  });
};

const getChannel = (name) => {
  return channels[name];
};

const createChannel = async (name) => {
  const channel = getChannel(name);
  if (channel) {
    await deleteChannel(name);
  }
  try {
    let archiveDestinationId = "";
    if (config.archive.enable) {
      console.log("archive is enabled.");
      const res1 = await request("ImageFlux_20190205.CreateArchiveDestination", archiveStorageInformation());
      archiveDestinationId = res1.data.archive_destination_id;
    }
    const res2 = await request("ImageFlux_20180905.CreateChannel", hlsTranscodeSetting(archiveDestinationId));
    const channel = res2.data;
    channels[name] = channel;
    return channel;
  } catch (err) {
    const res = err.response;
    console.log(res);
    return res.data;
  }
};

const deleteChannel = async (name) => {
  const channel = getChannel(name);
  if (channel) {
    try {
      await request("ImageFlux_20180501.DeleteChannel", { channel_id: channel.channel_id });
      delete channels[name];
      return { message: "deleted.", name };
    } catch (err) {
      const res = err.response;
      console.log(res);
      return res.data;
    }
  } else {
    console.log(name + "'s channel is not exists.");
    return { message: "not exist.", name };
  }
};

app.get("/get-channel/:name", (req, res) => {
  res.json(getChannel(req.params.name) || {});
});

app.get("/create-channel/:name", async (req, res) => {
  res.json(await createChannel(req.params.name));
});

app.get("/delete-channel/:name", async (req, res) => {
  res.json(await deleteChannel(req.params.name));
});
