<template>
  <div>
    <div class="content">
      <div class="header-area">
        <v-row class="pa-3" align="center" justify="center">
          <v-col>
            <v-row align="center" justify="center">
              <v-avatar class="ma-2" size="48px">
                <v-img
                  :src="artistImgUrl"
                  alt="artist image"
                />
              </v-avatar>
            </v-row>
            <v-row class="caption" align="center" justify="center">
              <span v-text="broadcast_.username"></span>
            </v-row>
          </v-col>
          <v-col>
            <span>閲覧数:</span>
            <span v-text="audienceCount"></span>
            <span>人</span>
          </v-col>
          <v-col>
            <v-btn
              class="msy-color-red"
              dark
              @click="openLeaveConfirm"
            >
              <v-icon>mdi-logout</v-icon>
              <span class="msy-color-text-white" v-text="'退出する'"></span>
            </v-btn>
          </v-col>
        </v-row>
      </div>
      <div v-show="!isStreamingStarted">
        <v-row class="streaming-not-started" align="center" justify="center">
          <v-col cols="12">
            <v-row class="py-5" align="center" justify="center">
              <v-icon :color="CONTROL_COLOR" size="72px">
                mdi-video-off
              </v-icon>
            </v-row>
            <v-row class="py-5" align="center" justify="center">
              <span
                class="msy-color-text-red"
                v-text="'配信が開始されていません'"
              >
              </span>
            </v-row>
          </v-col>
        </v-row>
      </div>
      <div v-show="isStreamingStarted" class="video-wrap">
        <video
          id="subscribing-video"
          class="video"
          autoplay
          muted
          playsinline
          @click="toggleVideoFitMode"
        ></video>
        <div
          v-show="!isFullscreen"
          class="btn-enter-fullscreen"
          @click="enterFullscreen"
        >
          <v-icon :color="CONTROL_COLOR">
            mdi-fullscreen
          </v-icon>
          <span
            class="msy-color-text-red comment-icon-text"
            v-text="'表示最大化'"
          ></span>
        </div>
        <v-btn
          v-show="isFullscreen"
          class="msy-color-red btn-exit-fullscreen"
          dark
          @click="exitFullscreen"
        >
          <v-icon>mdi-fullscreen-exit</v-icon>
        </v-btn>
      </div>
      <div class="bottom-area">
        <CommentList :room-id="broadcast_.broadcastId" />
      </div>
    </div>
    <Dialog
      ref="audioAlert"
      title="LIVE配信開始"
      @ok="getVideoElement().muted = false"
    >
      <p>音声が流れます。注意してください。</p>
    </Dialog>
    <Dialog
      ref="fullscreenAlert"
      title="画面最大化"
    >
      <p>全画面表示に非対応の端末です。</p>
    </Dialog>
    <Dialog
      ref="pauseAlert"
      title="配信一時停止"
      @ok="isPauseStandby = false"
    >
      <p v-if="isPauseStandby">配信が一時停止されました。</p>
      <p v-else>配信は現在一時停止中です。</p>
      <p>しばらくお待ちください。</p>
    </Dialog>
    <Dialog
      ref="endAlert"
      title="配信終了"
      @ok="isEndStandby = false"
    >
      <div v-if="isEndStandby">
        <p>配信が終了しました。</p>
        <p>ご視聴ありがとうございます。</p>
      </div>
      <div v-else>
        <p>この配信は終了しました。</p>
      </div>
    </Dialog>
    <Dialog
      ref="leaveConfirm"
      mode="confirm"
      title="退出前確認"
      @ok="leave"
    >
      <p>配信から退出します。よろしいですか？</p>
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
import axios from "axios";
import Hls from "hls.js";
import { Cloudinary } from "~/constant.js";
import BroadcastSignalService from "~/mixins/service/BroadcastSignalService.js";
import BroadcastChannelMembersService from "~/mixins/service/BroadcastChannelMembersService.js";
import Dialog from "~/components/molecules/Dialog";
import CommentList from "~/components/organisms/CommentList";
import NoLoginStreamingTestMode from "~/no-login-streaming-test/no-login-streaming-test-mode.js";

export default {
  layout: "noHeader",
  components: {
    Dialog,
    CommentList,
  },
  mixins: [
    BroadcastSignalService,
    BroadcastChannelMembersService
  ],
  data() {
    return {
      broadcast_: undefined,
      channel: null,
      artistImgUrl: "/images/no_image.png",
      audienceCount: 0,
      isStreamingStarted: false,
      isFullscreen: false,
      isPauseStandby: false,
      isEndStandby: false,
      videoFitMode: "horizontal",
      error: "",
    };
  },
  computed: {
    CONTROL_COLOR() {
      return "rgb(231, 64, 89)";
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
        this.$store.commit("user/setUser", {
          userId: Math.random().toString(32).substring(2)
        });
        try {
          this.channel = await NoLoginStreamingTestMode.imageFluxChannelManagement.getChannel();
        } catch (e) {
          console.error(JSON.stringify(e));
          this.error = e;
          this.$refs.errorDialog.open();
          return;
        }
      }
      const channelId = this.channel.channel_id;
      this.BroadcastSignalService_observe(channelId, (signal) => {
        setTimeout(this[signal], 1000);
      });
      this.BroadcastChannelMembersService_observe(channelId, (members) => {
        this.audienceCount = members.length;
      });
      this.BroadcastChannelMembersService_addMember(channelId, this.$store.state.user.user.userId);
      try {
        const url = `https://res.cloudinary.com/${Cloudinary.cloudName}/image/upload/${Cloudinary.quality}/${this.broadcast_.userImageId}`;
        await axios.get(url);
        this.artistImgUrl = url;
      } catch (_) {
        this.artistImgUrl = "/images/no_image.png";
      }
      if (this.$screenfull.isEnabled) {
        this.$screenfull.onchange(() => {
          this.isFullscreen = this.$screenfull.isFullscreen;
        });
      }
    } else {
      this.$router.push({ name: "fans-main" });
    }
  },
  mounted() {
    const videoElm = this.getVideoElement();
    videoElm.addEventListener("ended", () => {
      videoElm.muted = true;
      this.isStreamingStarted = false;
      this.isFullscreen = false;
      if (this.isPauseStandby) {
        this.$refs.pauseAlert.open();
      }
      if (this.isEndStandby) {
        this.$refs.endAlert.open();
      }
    });
    document.addEventListener("visibilitychange", () => {
      const channelId = this.channel.channel_id;
      const userId = this.$store.state.user.user.userId;
      if (document.visibilityState === "visible") {
        this.BroadcastChannelMembersService_addMember(channelId, userId);
      }
      if (document.visibilityState === "hidden") {
        this.BroadcastChannelMembersService_removeMember(channelId, userId);
      }
    });
  },
  methods: {
    getVideoElement() {
      return this.$el.querySelector("#subscribing-video");
    },
    toggleVideoFitMode() {
      this.videoFitMode = this.videoFitMode === "horizontal" ? "vertical" : "horizontal";
      this.getVideoElement().style.width = this.videoFitMode === "horizontal" ? "" : "auto";
    },
    async enterFullscreen() {
      if (this.$screenfull.isEnabled) {
        await this.$screenfull.request(this.getVideoElement().parentElement, {
          navigationUI: "hide",
        });
      } else {
        this.$refs.fullscreenAlert.open();
      }
    },
    async exitFullscreen() {
      await this.$screenfull.exit();
    },
    start() {
      const playlistUrl = this.channel.playlist_url;
      const videoElm = this.getVideoElement();
      if (Hls.isSupported()) {
        console.log("hls.js version=" + Hls.version);
        const hls = new Hls({
          manifestLoadingTimeOut: 3000, // マスターマニフェストのタイムアウト(ミリ秒)
          manifestLoadingMaxRetry: 10, // マスターマニフェストを何回リトライするか
          manifestLoadingMaxRetryTimeout: 3000, // タイムアウトしたあとリトライするまでの最大待機時間(ミリ秒)
          levelLoadingTimeOut: 3000, // レベルマニフェストのタイムアウト(ミリ秒)
          levelLoadingMaxRetry: 10, // レベルマニフェストを何回リトライするか
          levelLoadingMaxRetryTimeout: 3000, // タイムアウトしたあとリトライするまでの最大待機時間(ミリ秒)
          fragLoadingTimeOut: 3000, // 動画データのタイムアウト(ミリ秒)
          fragLoadingMaxRetry: 10, // 動画データを何回リトライするか
          fragLoadingMaxRetryTimeout: 3000, // 動画データがタイムアウトしたあとリトライするまでの最大待機時間(ミリ秒)
          liveBackBufferLength: 0, // 再生し終わったデータを保持する長さ(秒)
        });
        hls.loadSource(playlistUrl);
        hls.attachMedia(videoElm);
      } else if (videoElm.canPlayType("application/vnd.apple.mpegurl")) {
        console.log("use native hls player");
        videoElm.src = playlistUrl;
      } else {
        console.error("sorry, can not play hls");
      }
      this.$refs.audioAlert.open();
      this.isStreamingStarted = true;
    },
    pause() {
      if (this.isStreamingStarted) {
        this.isPauseStandby = true;
      } else {
        this.getVideoElement().muted = true;
        this.$refs.pauseAlert.open();
      }
    },
    end() {
      if (this.isStreamingStarted) {
        this.isEndStandby = true;
      } else {
        this.getVideoElement().muted = true;
        this.$refs.endAlert.open();
      }
    },
    openLeaveConfirm() {
      this.$refs.leaveConfirm.open();
    },
    leave() {
      this.BroadcastChannelMembersService_removeMember(this.channel.channel_id, this.$store.state.user.user.userId);
      this.$router.push({ name: "fans-mytickets" });
    },
  },
};
</script>

<style lang="scss" scoped>
.col {
  padding: 5px 10px;
}
.content {
  background: #000;
  position: absolute;
  left: 0;
  width: 100vw;
  text-align: center;
}
.header-area {
  background-color: rgba(0, 0, 0, 0.15);
  color: #fff;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 20;
}
.streaming-not-started {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}
.video-wrap {
  width: 100%;
  height: 100vh;
  position: relative;
  overflow: hidden;
}
.video {
  min-width: 100%;
  min-height: 100vh;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
/* 画面サイズが変わっても常に動画の中央が表示されるようにする */
/* 動画よりも画面が横に長くなるとき用 */
@media (min-aspect-ratio: 16/9), (aspect-ratio: 16/9) {
  .video {
    height: 100vh;
  }
}
/* 動画よりも画面が縦に長くなるとき用 */
@media (max-aspect-ratio: 16/9) {
  .video {
    width: 100%;
  }
}
.btn-fullscreen {
  cursor: pointer;
  position: fixed;
  z-index: 15;
}
.btn-enter-fullscreen {
  @extend .btn-fullscreen;
  right: 15px;
  bottom: 135px;
}
.btn-exit-fullscreen {
  @extend .btn-fullscreen;
  right: 20px;
  bottom: 20px;
}
.comment-icon-text {
  font-size: 8px;
}
.bottom-area {
  width: 100%;
  position: relative;
  bottom: 0;
  left: 0;
  z-index: 10;
}
</style>
