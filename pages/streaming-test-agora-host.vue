<template>
  <div>
    <div class="content">
      <h3>Agora Streaming Host</h3>
      <v-container>
        <v-row no-gutters>
          <v-col class="col" cols="12" sm="2">
            <v-text-field v-model="userName" label="UserName" />
          </v-col>
          <v-col class="col" cols="12" sm="2">
            <v-text-field v-model="channelName" label="ChannelName" />
          </v-col>
          <v-col class="col" cols="12" sm="2">
            <v-switch
              v-model="isAudioMonitoring"
              :disabled="!isStreaming"
              label="audio monitor"
              @change="toggleAudioMonitor"
            />
          </v-col>
          <v-col class="col" cols="12" sm="3">
            <v-slider
              v-model.number="micVolume"
              label="MicVolume"
              min="0"
              max="200"
              @change="onChangeMicVolume"
            />
          </v-col>
          <v-col class="col" cols="12" sm="1">
            <v-progress-circular
              :value="micInputLevel"
              :color="micInputLevel < 80 ? 'black' : 'red'"
            >
              {{ micInputLevel }}
            </v-progress-circular>
          </v-col>
          <v-col class="col" cols="12" sm="2">
            <v-btn style="font-size: 8px" @click="toggleCameraReverseMode">
              camera reverse
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
      <div id="publishing-video" class="video camera-reverse" autoplay></div>
      <v-container>
        <v-row no-gutters align="center">
          <v-col class="col" cols="12" sm="3">
            <v-select
              v-model="micDevice"
              :items="micDevices"
              label="Mic Device"
              @change="onChangeMicDevice"
            />
          </v-col>
          <v-col class="col" cols="12" sm="3">
            <v-select
              v-model="cameraDevice"
              :items="cameraDevices"
              label="Camera Device"
              @change="onChangeCameraDevice"
            />
          </v-col>
          <v-col class="col" cols="12" sm="3">
            <v-select
              v-model="videoQuality"
              :items="videoQualities"
              label="Video Quality"
              @change="onChangeVideoQuality"
            />
          </v-col>
          <v-col class="col" cols="12" sm="1">
            <v-switch v-model="agc" :disabled="isStreaming" label="AGC" />
          </v-col>
          <v-col class="col" cols="12" sm="1">
            <v-switch v-model="aec" :disabled="isStreaming" label="AEC" />
          </v-col>
          <v-col class="col" cols="12" sm="1">
            <v-switch v-model="ans" :disabled="isStreaming" label="ANS" />
          </v-col>
        </v-row>
        <v-row>
          <v-col class="col" cols="12" sm="12">
            <v-btn :disabled="isStreaming" @click="startStreaming">
              Start
            </v-btn>
            <v-btn :disabled="!isStreaming" @click="stopStreaming">
              Stop
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </div>
  </div>
</template>

<script>
import AgoraConnectionService from "~/mixins/service/AgoraConnectionService";
export default {
  layout: "noHeader",
  mixins: [AgoraConnectionService],
  data() {
    return {
      agoraConnection: null,
      userName: "artist",
      channelName: "live-01",
      isAudioMonitoring: false,
      micVolume: 100,
      micInputLevel: 0,
      micDevices: [],
      micDevice: null,
      cameraDevices: [],
      cameraDevice: null,
      videoQualities: [],
      videoQuality: null,
      agc: false,
      aec: false,
      ans: false,
      isStreaming: false,
    };
  },
  mounted() {
    this.initConnection();
  },
  methods: {
    async initConnection() {
      try {
        this.agoraConnection = await this.AgoraConnectionService_getPublisherConnection("publishing-video");
        this.micDevices = this.agoraConnection.getAudioInputDeviceLabels();
        this.micDevice = this.agoraConnection.getAudioInputDeviceLabel();
        this.cameraDevices = this.agoraConnection.getVideoInputDeviceLabels();
        this.cameraDevice = this.agoraConnection.getVideoInputDeviceLabel();
        this.videoQualities = this.agoraConnection.getVideoQualities();
        this.videoQuality = this.agoraConnection.getVideoQuality();
      } catch (e) {
        alert(e);
      }
    },
    toggleAudioMonitor() {
      if (this.agoraConnection) {
        this.isAudioMonitoring = this.agoraConnection.toggleAudioMonitor();
      }
    },
    onChangeMicVolume() {
      if (this.agoraConnection) {
        this.agoraConnection.setAudioInputVolume(this.micVolume);
      }
    },
    toggleCameraReverseMode() {
      const element = document.querySelector("#publishing-video");
      if (element.classList.contains("camera-reverse")) {
        element.classList.remove("camera-reverse");
      } else {
        element.classList.add("camera-reverse");
      }
    },
    onChangeMicDevice(deviceLabel) {
      if (this.agoraConnection) {
        this.agoraConnection.setAudioInputDevice(deviceLabel);
      }
    },
    onChangeCameraDevice(deviceLabel) {
      if (this.agoraConnection) {
        this.agoraConnection.setVideoInputDevice(deviceLabel);
      }
    },
    onChangeVideoQuality(videoQuality) {
      if (this.agoraConnection) {
        this.agoraConnection.setVideoQuality(videoQuality);
      }
    },
    async startStreaming() {
      if (this.agoraConnection) {
        const uid = await this.agoraConnection.publish(
          this.channelName,
          this.userName,
          this.videoQuality,
          this.agc,
          this.aec,
          this.ans,
        );
        console.log("connect uid = ", uid);
        this.agoraConnection.setAudioInputVolume(this.micVolume);
        this.agoraConnection.onAudioInputLevelChanged((audioInputLevel) => {
          this.micInputLevel = Math.round(audioInputLevel);
        });
        this.isStreaming = true;
      }
    },
    async stopStreaming() {
      if (this.agoraConnection) {
        await this.agoraConnection.disconnect();
        this.isAudioMonitoring = false;
        this.isStreaming = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.content {
  text-align: center;
}
.col {
  padding: 5px;
}
.video {
  margin: 10px auto;
  width: 100vw;
  max-width: 560px;
  height: 75vw;
  max-height: 420px;
}
.camera-reverse {
  transform: scaleX(-1);
}
</style>
