<template>
  <div>
    <div class="content">
      <v-img
        v-show="!isStreamingPrepared"
        class="no-video"
        src="/images/no_image.png"
      />
      <div v-show="isStreamingPrepared" class="video-wrap">
        <video
          id="publishing-video"
          class="video video-reverse"
          autoplay
          muted
          playsinline
        ></video>
      </div>
      <div class="controls">
        <v-row justify="center" align="center" no-gutters>
          <v-col v-show="!isStreaming" class="col" cols="12">
            <v-icon class="my-4" color="#FFF" size="24px">mdi-video-off</v-icon>
            <span class="msy-color-text-white">配信停止中</span>
          </v-col>
          <v-col v-show="isStreaming" class="col text-blink" cols="12">
            <v-icon class="my-4" color="red" size="24px">mdi-video</v-icon>
            <span class="red--text">配信放送中</span>
            <span class="red--text">閲覧数:</span>
            <span class="red--text" v-text="audienceCount"></span>
            <span class="red--text">人</span>
          </v-col>
        </v-row>
        <v-row justify="center" align="center" no-gutters>
          <v-col class="col" cols="6">
            <v-switch
              v-model="isAudioMonitoring"
              :color="CONTROL_COLOR"
              dark
              label="音声モニタ"
              @change="toggleAudioMonitoring"
            />
          </v-col>
          <v-col class="col" cols="6">
            <v-btn class="msy-color-red" dark @click="toggleCameraReverseMode">
              左右反転モード切替
            </v-btn>
          </v-col>
        </v-row>
        <v-row justify="center" align="center" no-gutters>
          <v-col class="mic-vol col" cols="7">
            <v-slider
              v-model.number="micVolume"
              :color="CONTROL_COLOR"
              dark
              label="マイク音量"
              min="0"
              max="100"
              thumb-label
              @change="LocalStreamManagementService_changeMicVolume"
            />
          </v-col>
          <v-col class="col" cols="5">
            <span>入力レベル</span>
            <v-progress-circular
              :color="micInputLevel < 80 ? 'green' : 'red'"
              :value="micInputLevel"
              class="mic-input-level"
              size="48"
            >
              {{ micInputLevel }}
            </v-progress-circular>
          </v-col>
        </v-row>
        <v-row
          v-show="!isShowSettings"
          class="mx-4"
          align="center"
          justify="center"
        >
          <div class="my-4 pointer" @click="isShowSettings = true">
            <v-icon color="#FFF" size="24px">mdi-cog</v-icon>
            <span class="msy-color-text-white">詳細設定を開く</span>
          </div>
        </v-row>
      </div>
      <div class="start-stop-buttons">
        <v-row>
          <v-col class="col" cols="12" sm="12">
            <v-btn
              :disabled="!isStreamingPrepared || isStreaming"
              class="mx-2 msy-color-red"
              dark
              @click="startStreaming"
            >
              配信開始
            </v-btn>
            <v-btn
              :disabled="!isStreaming"
              class="mx-2 msy-color-red"
              dark
              @click="pauseStreaming"
            >
              配信停止
            </v-btn>
            <v-btn
              :disabled="!isStreaming"
              class="mx-2 msy-color-red"
              dark
              @click="openEndStreamingConfirm"
            >
              配信終了
            </v-btn>
          </v-col>
        </v-row>
      </div>
      <div class="bottom-area msy-color-black">
        <CommentList :room-id="broadcast_.broadcastId" :is-show-only="false" />
      </div>
      <div v-show="isShowSettings" class="video-settings">
        <v-row class="mx-4 pointer" align="center" justify="end">
          <div class="my-2" @click="isShowSettings = false">
            <v-icon color="#FFF" size="24px">mdi-close</v-icon>
            <span class="msy-color-text-white">閉じる</span>
          </div>
        </v-row>
        <v-row justify="center" align="center" no-gutters>
          <v-col class="col" cols="12">
            <v-slider
              v-model.number="reverbDepth"
              :color="CONTROL_COLOR"
              dark
              label="リバーブ音量"
              min="0"
              max="100"
              thumb-label
              @change="LocalStreamManagementService_changeReverbDepth"
            />
          </v-col>
          <v-col class="col" cols="12">
            <v-select
              :items="micDevices"
              :value="micDevice.deviceId"
              dark
              label="マイクデバイス選択"
              item-text="label"
              item-value="deviceId"
              @change="LocalStreamManagementService_changeMicDevice"
            />
          </v-col>
          <v-col class="col" cols="12">
            <v-select
              :items="cameraDevices"
              :value="cameraDevice.deviceId"
              dark
              label="カメラデバイス選択"
              item-text="label"
              item-value="deviceId"
              @change="LocalStreamManagementService_changeCameraDevice"
            />
          </v-col>
          <v-col class="col" cols="12">
            <v-text-field
              v-model.number="frameRate"
              dark
              label="フレームレート"
              min="1"
              max="30"
              type="number"
              @input="LocalStreamManagementService_changeFrameRate"
            />
          </v-col>
          <v-col class="col" cols="12">
            <v-switch
              v-model="agc"
              :color="CONTROL_COLOR"
              :disabled="!agcSupported"
              :label="
                '自動ゲイン制御' + (!agcSupported ? ' ※未対応ブラウザです' : '')
              "
              dark
              @change="LocalStreamManagementService_createLocalStream"
            />
          </v-col>
          <v-col class="col" cols="12">
            <v-switch
              v-model="aec"
              :color="CONTROL_COLOR"
              :disabled="!aecSupported"
              :label="
                '自動エコー制御' + (!aecSupported ? ' ※未対応ブラウザです' : '')
              "
              dark
              @change="LocalStreamManagementService_createLocalStream"
            />
          </v-col>
          <v-col class="col" cols="12">
            <v-switch
              v-model="ans"
              :color="CONTROL_COLOR"
              :disabled="!ansSupported"
              :label="
                '自動ノイズ制御' + (!ansSupported ? ' ※未対応ブラウザです' : '')
              "
              dark
              @change="LocalStreamManagementService_createLocalStream"
            />
          </v-col>
        </v-row>
      </div>
    </div>
    <Dialog
      ref="audioMonitoringConfirm"
      mode="confirm"
      title="音声モニタ"
      :width="400"
      @cancel="turnOffAudioMonitoring"
      @ok="turnOnAudioMonitoring"
    >
      <p>自分の音声を出力するモードに切り替えます</p>
      <div>・ハウリング防止のためイヤホン接続を推奨します</div>
      <div>・音声モニタがOFFでも音声は配信されます</div>
      <div style="height: 16px"></div>
      <p>宜しいですか？</p>
    </Dialog>
    <Dialog
      ref="endStreamingConfirm"
      mode="confirm"
      title="配信終了確認"
      @ok="endStreaming"
    >
      <p>配信を終了します。よろしいですか？</p>
    </Dialog>
    <Dialog
      ref="errorDialog"
      title="エラー"
    >
      {{ error }}
    </Dialog>
  </div>
</template>

<script>
import Peer from "skyway-js";
import { SkyWay } from "~/constant.js";
import LocalStreamManagementService from "~/mixins/service/LocalStreamManagementService.js";
import Dialog from "~/components/molecules/Dialog";
import CommentList from "~/components/organisms/CommentList";
import NoLoginStreamingTestMode from "~/no-login-streaming-test/no-login-streaming-test-mode.js";
import BroadcastsDao from "~/mixins/dao/BroadcastsDao";

export default {
  layout: "noHeader",
  components: {
    Dialog,
    CommentList,
  },
  mixins: [LocalStreamManagementService, BroadcastsDao],
  data() {
    return {
      broadcast_: undefined,
      channelId: undefined,
      peer: null,
      sfuRoom: null,
      artistId: null,
      audienceCount: 0,
      isAudioMonitoring: false,
      isStreamingPrepared: false,
      isStreaming: false,
      isShowSettings: false,
      error: "",
    };
  },
  computed: {
    CONTROL_COLOR() {
      return "rgb(231, 64, 89)";
    },
  },
  created() {
    let broadcast = !NoLoginStreamingTestMode.enabled
      ? this.$route.params.broadcast
      : NoLoginStreamingTestMode.broadcast;
    if (!broadcast) {
      const keeped = sessionStorage.getItem("broadcast");
      if (keeped) {
        broadcast = JSON.parse(keeped);
      }
    }
    if (broadcast) {
      sessionStorage.setItem("broadcast", JSON.stringify(broadcast));
      this.broadcast_ = broadcast;
      this.channelId = this.broadcast_.broadcastId;
      setInterval(() => {
        if (this.sfuRoom) {
          this.audienceCount = this.sfuRoom.members.filter((m) => {
            return m !== this.artistId;
          }).length;
        }
      }, 5000);
    } else {
      this.$router.push({ name: "fans-main" });
    }
  },
  async mounted() {
    const videoElm = this.getVideoElement();
    videoElm.addEventListener("pause", async () => {
      // イヤホンが抜けた時の対応
      await this.LocalStreamManagementService_createLocalStream();
      videoElm.muted = true;
      this.isAudioMonitoring = false;
    });
    await this.LocalStreamManagementService_initLocalStream(videoElm);
    await this.LocalStreamManagementService_createLocalStream();
    this.isStreamingPrepared = true;
  },
  methods: {
    getVideoElement() {
      return this.$el.querySelector("#publishing-video");
    },
    toggleAudioMonitoring() {
      if (this.isAudioMonitoring) {
        this.$refs.audioMonitoringConfirm.open();
      } else {
        this.turnOffAudioMonitoring();
      }
    },
    async turnOnAudioMonitoring() {
      await this.LocalStreamManagementService_createLocalStream();
      this.getVideoElement().muted = false;
    },
    turnOffAudioMonitoring() {
      this.getVideoElement().muted = true;
      this.$nextTick(() => {
        this.isAudioMonitoring = false;
      });
    },
    toggleCameraReverseMode() {
      const className = "video-reverse";
      const classList = this.getVideoElement().classList;
      if (classList.contains(className)) {
        classList.remove(className);
      } else {
        classList.add(className);
      }
    },
    startStreaming() {
      try {
        this.peer = new Peer(SkyWay);
        this.peer.on("open", () => {
          this.artistId = this.peer.id;
          this.sfuRoom = this.peer.joinRoom(this.channelId, {
            mode: "sfu",
            stream: this.localStream,
          });
          this.isStreaming = true;
        });
      } catch (e) {
        console.error(e);
        this.error = e;
        this.$refs.errorDialog.open();
      }
    },
    pauseStreaming() {
      if (this.sfuRoom) {
        this.sfuRoom.send("pause-streaming");
        setTimeout(() => {
          this.sfuRoom.close();
          this.sfuRoom = null;
          this.isStreaming = false;
        }, 500);
      }
    },
    openEndStreamingConfirm() {
      this.$refs.endStreamingConfirm.open();
    },
    async endStreaming() {
      try {
        if (this.sfuRoom) {
          if (!NoLoginStreamingTestMode.enabled) {
            await this.BroadcastsDao_finishBroadcast(
              this.broadcast_.broadcastId
            );
            this.broadcast_ = undefined;
          }
          this.sfuRoom.send("end-streaming");
          setTimeout(() => {
            this.sfuRoom.close();
            this.sfuRoom = null;
            this.isStreaming = false;
          }, 500);
        }
        const user = this.$store.state.user.user;
        this.$router.push({
          name: "artists-main",
          params: { artistId: user.userId },
          query: { tab: "tab-broadcasts" },
        });
      } catch (e) {
        console.error(e);
        this.error = e;
        this.$refs.errorDialog.open();
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.col {
  padding: 5px 10px;
}
.pointer {
  cursor: pointer;
}

.no-video {
  width: 100%;
  height: 100vh;
}

.video {
  min-width: 100%;
  min-height: 100vh;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
@media screen and (min-width: 960px) {
  .content {
    background: rgba(50, 50, 50, 1);
    position: absolute;
    left: 0;
    width: 100vw;
    text-align: center;
  }
  .no-video {
    width: 70vw;
    height: 100vh;
    position: relative;
    left: 0;
    overflow: hidden;
  }
  .video-wrap {
    width: 70vw;
    height: 100vh;
    position: relative;
    left: 0;
    overflow: hidden;
  }
  .video {
    height: 100vh;
  }
  .controls {
    background-color: rgba(0, 0, 0, 0.15);
    color: #efefef;
    width: 68vw;
    position: absolute;
    top: 0;
    left: 20px;
    z-index: 120;
  }
  .video-settings {
    background-color: rgba(0, 0, 0, 0.75);
    width: 68vw;
    height: 70vh;
    position: fixed;
    overflow: auto;
    bottom: 0;
    left: 20px;
    z-index: 121;
  }
  .start-stop-buttons {
    background-color: rgba(0, 0, 0, 0);
    width: 70vw;
    height: 60px;
    line-height: 60px;
    position: fixed;
    bottom: 80px;
    left: 0;
    z-index: 20;
  }
}
@media screen and (max-width: 960px) {
  .content {
    background: #000;
    position: absolute;
    left: 0;
    width: 100vw;
    text-align: center;
  }
  .video-wrap {
    width: 100%;
    height: 100vh;
    position: relative;
    overflow: hidden;
  }
  .video {
    width: 100%;
  }
  .controls {
    background-color: rgba(0, 0, 0, 0.15);
    color: #efefef;
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 120;
  }
  .start-stop-buttons {
    background-color: rgba(0, 0, 0, 0);
    width: 100%;
    height: 60px;
    line-height: 60px;
    position: fixed;
    bottom: 130px;
    left: 0;
    z-index: 20;
  }
  .video-settings {
    background-color: rgba(0, 0, 0, 0.75);
    width: 100%;
    height: 70vh;
    position: fixed;
    overflow: auto;
    bottom: 0;
    left: 0;
    z-index: 121;
  }
}
.video-reverse {
  transform: translate(-50%, -50%) rotateY(180deg);
}
.mic-vol {
  height: 45px;
}

.bottom-area {
  width: 100%;
  position: relative;
  bottom: 0;
  left: 0;
  z-index: 10;
}

.text-blink {
  font-size: 1.8rem;
  font-weight: bold;
  animation: blink 0.7s ease-in-out infinite alternate; //点滅アニメの設定
}
/* 点滅 */
@keyframes blink {
  0% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}
</style>

<style>
.mic-input-level .v-progress-circular__overlay {
  transition: all 0.01s ease-in-out !important;
}
</style>
