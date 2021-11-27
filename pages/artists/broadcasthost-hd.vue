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
          <v-col v-show="!isStreaming" class="col pa-0" cols="12">
            <v-icon class="my-2" color="#FFF" size="24px">mdi-video-off</v-icon>
            <span class="msy-color-text-white">配信停止中</span>
          </v-col>
          <v-col v-show="isStreaming" class="col pa-0 text-blink" cols="12">
            <v-icon class="my-2" color="red" size="24px">mdi-video</v-icon>
            <span class="red--text">配信放送中</span>
            <span class="red--text">閲覧数:</span>
            <span class="red--text" v-text="audienceCount"></span>
            <span class="red--text">人</span>
          </v-col>
        </v-row>
        <v-row justify="center" align="center" no-gutters>
          <v-col class="col py-0" cols="6">
            <v-switch
              v-model="isAudioMonitoring"
              :color="CONTROL_COLOR"
              dark
              label="音声モニタ"
              @change="toggleAudioMonitoring"
            />
          </v-col>
          <v-col class="col right py-0" cols="6">
            <v-btn class="msy-color-red" dark @click="toggleCameraReverseMode">
              左右反転モード切替
            </v-btn>
          </v-col>
        </v-row>
        <v-row justify="center" align="center" no-gutters>
          <v-col class="mic-vol col py-0" cols="7">
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
          <v-col class="col right py-0" cols="5">
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
          align="center"
          justify="center"
        >
          <div class="my-0 pointer" @click="isShowSettings = true">
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
        <CommentList
          :room-id="broadcast_.broadcastId"
          :is-show-only="false"
          :is-host="true"
        />
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
      ref="countDownDialog"
      mode="custom"
      :title="countDownDialogTitle"
    >
      <div
        class="count-down-dialog-content"
        v-text="countDownDialogContent"
      ></div>
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
import Sora from "sora-js-sdk";
import LocalStreamManagementService from "~/mixins/service/LocalStreamManagementService.js";
import BroadcastSignalService from "~/mixins/service/BroadcastSignalService.js";
import BroadcastChannelMembersService from "~/mixins/service/BroadcastChannelMembersService.js";
import ImagefluxConnectionService from "~/mixins/service/ImagefluxConnectionService";
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
  mixins: [
    LocalStreamManagementService,
    ImagefluxConnectionService,
    BroadcastSignalService,
    BroadcastChannelMembersService,
    BroadcastsDao,
  ],
  data() {
    return {
      broadcast_: undefined,
      channel: null,
      publisher: null,
      audienceCount: 0,
      isAudioMonitoring: false,
      isShowSettings: false,
      isStreamingPrepared: false,
      isStreaming: false,
      countDownDialogTitle: "",
      countDownDialogContent: 0,
      error: "",
    };
  },
  computed: {
    CONTROL_COLOR() {
      return "rgb(231, 64, 89)";
    },
  },
  watch: {
    async localStreamCreated() {
      if (this.isStreaming) {
        await this.startStreaming();
      }
    },
  },
  async created() {
    let broadcast = !NoLoginStreamingTestMode.enabled ? this.$route.params.broadcast : NoLoginStreamingTestMode.broadcast;
    if (!broadcast) {
      const keeped = sessionStorage.getItem("broadcast");
      if (keeped) {
        broadcast = JSON.parse(keeped);
      }
    }
    if (broadcast) {
      sessionStorage.setItem("broadcast", JSON.stringify(broadcast));
      this.broadcast_ = broadcast;
      if (!NoLoginStreamingTestMode.enabled) {
        const imagefluxChannelInfoStr = this.broadcast_.imagefluxChannelInfoStr;
        if (imagefluxChannelInfoStr) {
          this.channel = JSON.parse(imagefluxChannelInfoStr).data;
        }
      } else {
        try {
          this.channel = await NoLoginStreamingTestMode.imageFluxChannelManagement.getChannel();
        } catch (e) {
          console.error(JSON.stringify(e));
          this.error = e;
          this.$refs.errorDialog.open();
          return;
        }
      }
      this.BroadcastChannelMembersService_observe(this.channel.channel_id, (members) => {
        this.audienceCount = members.length;
      });
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
    window.addEventListener("pagehide", () => {
      if (this.isStreaming) {
        this.BroadcastSignalService_reave(this.channel.channel_id);
      }
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
    async startStreaming() {
      if (!this.publisher) {
        const debug = false;
        const soraConnection = Sora.connection(this.channel.sora_url, debug);
        const metadata = {};
        const options = {
          audio: true,
          audioCodecType: "OPUS",
          audioBitRate: 192, // [kbps]
          video: true,
          videoCodecType: "H264",
          videoBitRate: 2000, // [kbps]
        };
        this.publisher = soraConnection.sendonly(
          this.channel.channel_id,
          metadata,
          options
        );
      }
      try {
        this.countDownDialogTitle = !this.isStreaming ? "配信カウントダウン" : "切り替え中";
        this.countDownDialogContent = "配信準備中";
        this.$refs.countDownDialog.open();
        await this.publisher.connect(this.localStream);
        await this.BroadcastSignalService_startSignal(this.channel.channel_id);
        this.countDownDialogContent = 5;
        const countDownIntervalId = setInterval(() => {
          this.countDownDialogContent--;
          if (this.countDownDialogContent === 0) {
            this.isStreaming = true;
            this.$refs.countDownDialog.close();
            clearInterval(countDownIntervalId);
          }
        }, 1000);
      } catch (e) {
        this.$refs.countDownDialog.close();
        console.error(e);
        this.error = e;
        this.$refs.errorDialog.open();
      }
    },
    pauseStreaming() {
      // 動画の最後が切れてしまうのでボタン押下後に1秒待ってから切断する
      setTimeout(async () => {
        try {
          await this.BroadcastSignalService_pauseSignal(
            this.channel.channel_id
          );
          this.publisher.disconnect();
          this.isStreaming = false;
          await this.LocalStreamManagementService_createLocalStream();
        } catch (e) {
          console.error(e);
          this.error = e;
          this.$refs.errorDialog.open();
        }
      }, 1000);
    },
    openEndStreamingConfirm() {
      this.$refs.endStreamingConfirm.open();
    },
    endStreaming() {
      // 動画の最後が切れてしまうのでボタン押下後に1秒待ってから切断する
      setTimeout(async () => {
        try {
          if (!NoLoginStreamingTestMode.enabled) {
            await this.BroadcastsDao_finishBroadcast(this.broadcast_.broadcastId);
            this.broadcast_ = undefined;
          }
          const channelId = this.channel.channel_id;
          await this.BroadcastSignalService_endSignal(channelId);
          this.publisher.disconnect();
          this.isStreaming = false;
          await this.ImagefluxConnectionService_deleteChannel(channelId);
          this.$router.push({
            name: "artists-main",
            params: { artistId: this.$store.state.user.user.userId },
            query: { tab: "tab-broadcasts" },
          });
        } catch (e) {
          console.error(e);
          this.error = e;
          this.$refs.errorDialog.open();
        }
      }, 1000);
    }
  },
};
</script>

<style lang="scss" scoped>
.content {
  background: rgba(50, 50, 50, 1);
  left: 0;
  position: absolute;
  text-align: center;
  width: 100vw;
}
.col {
  padding: 5px 10px;

  &.right {
    text-align: right;
  }
}
.pointer {
  cursor: pointer;
}
.no-video {
  height: 100vh;
  width: 100vw;
}
.video-wrap {
  height: 100vh;
  position: relative;
  overflow: hidden;
  width: 100vw;
}
.video {
  left: 50%;
  min-height: 100vh;
  min-width: 100%;
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
}
.controls {
  background-color: rgba(0, 0, 0, 0.15);
  color: #efefef;
  padding: 5px;
  position: absolute;
  top: 0;
  width: 100vw;
  z-index: 120;
}
.video-settings {
  background-color: rgba(0, 0, 0, 0.75);
  bottom: 0;
  height: 70vh;
  overflow: auto;
  position: fixed;
  width: 100vw;
  z-index: 121;
}
.start-stop-buttons {
  background-color: rgba(0, 0, 0, 0);
  height: 60px;
  left: 0;
  line-height: 60px;
  position: fixed;
  width: 100vw;
  z-index: 20;
}
@media screen and (min-width: 960px) {
  .video {
    height: 100vh;
  }
  .start-stop-buttons {
    bottom: 80px;
  }
}
@media screen and (max-width: 960px) {
  .video {
    width: 100vw;
  }
  .start-stop-buttons {
    bottom: 130px;
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
  position: fixed;
  bottom: 0;
  left: 0;
  z-index: 10;
}
.text-blink {
  font-size: 1.5rem;
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
.count-down-dialog-content {
  font-size: 1.8rem;
}
</style>

<style>
.mic-input-level .v-progress-circular__overlay {
  transition: all 0.01s ease-in-out !important;
}
</style>
