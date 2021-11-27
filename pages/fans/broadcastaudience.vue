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
              :disabled="!isJoin"
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
    >
      <p>配信が一時停止されました。</p>
      <p>しばらくお待ちください。</p>
    </Dialog>
    <Dialog
      ref="endAlert"
      title="配信終了"
    >
      <p>配信が終了しました。</p>
      <p>ご視聴ありがとうございます。</p>
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
import Peer from "skyway-js";
import { SkyWay, Cloudinary } from "~/constant.js";
import Dialog from "~/components/molecules/Dialog";
import CommentList from "~/components/organisms/CommentList";
import NoLoginStreamingTestMode from "~/no-login-streaming-test/no-login-streaming-test-mode.js";

export default {
  layout: "noHeader",
  components: {
    Dialog,
    CommentList,
  },
  data() {
    return {
      broadcast_: undefined,
      channelId: undefined,
      peer: null,
      sfuRoom: null,
      artistId: null,
      artistImgUrl: "/images/no_image.png",
      audienceCount: 0,
      isJoin: false,
      isStreamingStarted: false,
      isFullscreen: false,
      error: "",
    };
  },
  computed: {
    CONTROL_COLOR() {
      return "rgb(231, 64, 89)";
    },
  },
  async created() {
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
          this.audienceCount =
            this.sfuRoom.members.filter((m) => {
              return m !== this.artistId;
            }).length + 1;
        }
      }, 5000);
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
    this.join();
  },
  methods: {
    getVideoElement() {
      return this.$el.querySelector("#subscribing-video");
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
    join() {
      try {
        this.peer = new Peer(SkyWay);
        this.peer.on("open", () => {
          const videoElm = this.getVideoElement();
          this.sfuRoom = this.peer.joinRoom(this.channelId, {
            mode: "sfu",
          });
          this.sfuRoom.on("stream", (stream) => {
            videoElm.srcObject = stream;
            this.artistId = stream.peerId;
            this.isStreamingStarted = true;
            this.$refs.audioAlert.open();
          });
          this.sfuRoom.on("data", ({ src, data }) => {
            if (src === this.artistId && data === "pause-streaming") {
              videoElm.muted = true;
              this.isStreamingStarted = false;
              this.$refs.pauseAlert.open();
            }
            if (src === this.artistId && data === "end-streaming") {
              videoElm.muted = true;
              this.isStreamingStarted = false;
              this.$refs.endAlert.open();
            }
          });
          this.isJoin = true;
        });
      } catch (e) {
        console.error(e);
        this.error = e;
        this.$refs.errorDialog.open();
      }
    },
    openLeaveConfirm() {
      this.$refs.leaveConfirm.open();
    },
    leave() {
      try {
        const videoElm = this.getVideoElement();
        videoElm.srcObject = null;
        videoElm.pause();
        if (this.sfuRoom) {
          this.sfuRoom.close();
          this.sfuRoom = null;
        }
        this.isJoin = false;
        this.$router.push({ name: "fans-mytickets" });
      } catch (e) {
        console.error(e);
        this.error = e;
        this.$refs.errorDialog.open();
      }
    }
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
  right: 128px;
  bottom: 96px;
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
