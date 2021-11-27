/* eslint-disable semi */
import AgoraRTC /*, { RemoteStreamFallbackType } */ from "agora-rtc-sdk-ng";
import { RtcRole } from "agora-access-token";
import getUserAgent from "ua-parser-js";
import { Agora } from "~/constant.js";

const userAgent = getUserAgent();
console.log(userAgent);

// @see https://agoraio-community.github.io/AgoraWebSDK-NG/docs/en/basic_call#1create-a-local-client
const clientOpts = {
  mode: "live",
  codec: "vp8",
};

// @see https://agoraio-community.github.io/AgoraWebSDK-NG/api/en/globals.html#audioencoderconfigurationpreset
const AUDIO_QUALITY = "high_quality_stereo";

// @see https://agoraio-community.github.io/AgoraWebSDK-NG/docs/en/video_profile
const VIDEO_QUARITIES = [
  "120p_1",
  "180p_1",
  "240p_4",
  "360p_4",
  "480p_2",
  "720p_2",
  "1080p_2",
  "1440p_1",
  "1440p_2",
  "4K_1",
  "4K_3",
];

// @see https://agoraio-community.github.io/AgoraWebSDK-NG/api/en/enums/remotestreamfallbacktype.html
const RemoteStreamFallbackType = {
  DISABLE: 0,
  LOW_STREAM: 1,
  AUDIO_ONLY: 2,
};

const canSetDualStream = userAgent.browser.name.includes("Safari");

const getToken = async ($functions, channelName, userName, role) => {
  const response = await $functions.httpsCallable("get_agora_token")({
    appId: Agora.appId,
    channelName,
    userName,
    role,
  });
  return response.data;
};

export class AgoraConnection {
  constructor($functions, videoElementId) {
    this.$functions = $functions;
    this.client = AgoraRTC.createClient(clientOpts);
    this.videoElementId = videoElementId;
  }

  async disconnect() {
    await this.client.leave();
  }
}

export class AgoraPublisherConnection extends AgoraConnection {
  constructor($functions, videoElementId) {
    if (userAgent.os.name === "iOS" && userAgent.browser.name === "Chrome") {
      throw new Error("This browser is not support streaming.");
    }
    super($functions, videoElementId);
    this.client.setClientRole("host");
    this.audioInputDevices = null;
    this.videoInputDevices = null;
    this.audioInputDeviceId = null;
    this.videoInputDeviceId = null;
    this.videoQuality = "360p_4"
    this.localAudioTrack = null;
    this.localVideoTrack = null;
  }

  async loadInputDevices() {
    const devices = await AgoraRTC.getDevices();
    this.audioInputDevices = devices.filter((device) => {
      return device.kind === "audioinput";
    });
    this.videoInputDevices = devices.filter((device) => {
      return device.kind === "videoinput";
    });
    this.audioInputDeviceId = this.audioInputDevices[0].deviceId;
    this.videoInputDeviceId = this.videoInputDevices[0].deviceId;
  }

  toggleAudioMonitor() {
    if (this.localAudioTrack) {
      if (!this.localAudioTrack.isPlaying) {
        this.localAudioTrack.play();
        return true;
      } else {
        this.localAudioTrack.stop();
        return false;
      }
    }
    return false;
  }

  setAudioInputVolume(audioInputVolume) {
    if (this.localAudioTrack) {
      this.localAudioTrack.setVolume(audioInputVolume);
    }
  }

  onAudioInputLevelChanged(callback) {
    if (!this.audioInputLevelChangedTimerId) {
      const getLevel = () => {
        if (this.localAudioTrack) {
          const audioInputLevel = this.localAudioTrack.getVolumeLevel() * 100;
          callback(audioInputLevel);
        } else {
          const audioInputLevel = 0;
          callback(audioInputLevel);
        }
        this.audioInputLevelChangedTimerId = setTimeout(getLevel, 10);
      };
      getLevel();
    }
  }

  getAudioInputDeviceLabels() {
    return this.audioInputDevices.map((device) => {
      return device.label;
    });
  }

  getVideoInputDeviceLabels() {
    return this.videoInputDevices.map((device) => {
      return device.label;
    });
  }

  getAudioInputDeviceLabel() {
    return this.audioInputDevices.find(device => device.deviceId === this.audioInputDeviceId).label;
  }

  setAudioInputDevice(deviceLabel) {
    this.audioInputDeviceId = this.audioInputDevices.find((device) => {
      return device.label === deviceLabel;
    }).deviceId;
    if (this.audioInputDeviceId && this.localAudioTrack && this.audioStream) {
      this.localAudioTrack.setDevice(this.audioInputDeviceId);
    }
  }

  getVideoInputDeviceLabel() {
    return this.videoInputDevices.find(device => device.deviceId === this.videoInputDeviceId).label;
  }

  setVideoInputDevice(deviceLabel) {
    this.videoInputDeviceId = this.videoInputDevices.find((device) => {
      return device.label === deviceLabel;
    }).deviceId;
    if (this.videoInputDeviceId && this.localVideoTrack) {
      this.localVideoTrack.setDevice(this.videoInputDeviceId);
    }
  }

  getVideoQualities() {
    return VIDEO_QUARITIES;
  }

  getVideoQuality() {
    return this.videoQuality;
  }

  setVideoQuality(videoQuality) {
    this.videoQuality = videoQuality;
    if (this.localVideoTrack) {
      this.localVideoTrack.setEncoderConfiguration(this.videoQuality);
    }
  }

  async publish(channelName, userName, videoQuality, agc, aec, ans) {
    const token = await getToken(this.$functions, channelName, userName, RtcRole.PUBLISHER);
    const uid = await this.client.join(Agora.appId, channelName, token, userName);
    if (!canSetDualStream) {
      await this.client.enableDualStream();
    }

    // audio
    // const ctx = new AudioContext();
    // const source = ctx.createMediaStreamSource(await navigator.mediaDevices.getUserMedia({
    //   video: false,
    //   audio: {
    //     deviceId: this.audioInputDeviceId,
    //     autoGainControl: agc,
    //     echoCancellation: aec,
    //     noiseSuppression: ans,
    //   },
    // }));
    // const destination = ctx.createMediaStreamDestination();
    // const limitter = ctx.createDynamicsCompressor();
    // limitter.ratio.setValueAtTime(20, ctx.currentTime);
    // source.connect(limitter).connect(destination);
    // this.localAudioTrack = AgoraRTC.createCustomAudioTrack({
    //   mediaStreamTrack: this.audioStream.getAudioTracks()[0],
    //   encoderConfig: AUDIO_QUALITY,
    //   AGC: agc, // do not work?
    //   AEC: aec, // do not work?
    //   ANS: ans, // do not work?
    // });
    this.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack({
      microphoneId: this.audioInputDeviceId,
      encoderConfig: AUDIO_QUALITY,
      AGC: agc,
      AEC: aec,
      ANS: ans,
    });

    // video
    this.localVideoTrack = await AgoraRTC.createCameraVideoTrack({
      cameraId: this.videoInputDeviceId,
      encoderConfig: this.videoQuality,
    });
    this.localVideoTrack.play(this.videoElementId);

    await this.client.publish([this.localAudioTrack, this.localVideoTrack]);
    return uid;
  }

  async disconnect() {
    if (this.localAudioTrack) {
      this.localAudioTrack.close();
      this.localAudioTrack = null;
    }
    if (this.localVideoTrack) {
      this.localVideoTrack.close();
      this.localVideoTrack = null;
    }
    if (!canSetDualStream) {
      await this.client.disableDualStream();
    }
    await super.disconnect();
  }
}

export class AgoraSubscriberConnection extends AgoraConnection {
  constructor($functions, videoElementId) {
    super($functions, videoElementId);
    try {
      this.client.on("user-joined", (publisher) => {
        this.client.setStreamFallbackOption(publisher.uid, RemoteStreamFallbackType.AUDIO_ONLY);
      });
      this.client.on("user-published", async (publisher, mediaType) => {
        await this.client.subscribe(publisher, mediaType);
        if (mediaType === "audio") {
          publisher.audioTrack.play();
        } else {
          publisher.videoTrack.play(videoElementId);
        }
      });
      this.client.on("stream-type-changed", (publisherUid, streamType) => {
        this.client.setRemoteVideoStreamType(publisherUid, streamType);
      });
    } catch (err) {
      console.error(err);
    }
  }

  async subscribe(channelName, userName) {
    const token = await getToken(
      this.$functions,
      channelName,
      userName,
      RtcRole.SUBSCRIBER
    );
    return await this.client.join(Agora.appId, channelName, token, userName);
  }
}

export default {
  methods: {
    async AgoraConnectionService_getPublisherConnection(videoElementId) {
      const conn = new AgoraPublisherConnection(
        this.$functions,
        videoElementId
      );
      await conn.loadInputDevices();
      return conn;
    },
    AgoraConnectionService_getSubscriberClient(videoElementId) {
      return new AgoraSubscriberConnection(this.$functions, videoElementId);
    },
  },
};
