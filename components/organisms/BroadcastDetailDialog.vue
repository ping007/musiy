<template>
  <div class="broadcast-dialog-wrapper">
    <v-dialog
      v-if="broadcast_"
      v-model="isShowBroadcastDialog"
      persistent
      fullscreen
      hide-overlay
      transition="scroll-y-reverse-transition"
    >
      <v-card tile class="dialog-content">
        <div class="dialog-content-wrapper">
          <v-row class="title-area-wrapper">
            <v-card-title class="headline broadcast-headline" primary-title>
              <v-row align="center" justify="center">
                <v-col cols="4" class="py-2 px-5">
                  <v-btn text @click="closeBroadcastDetail">
                    <v-icon
                      dark
                      class="close-icon px-0"
                      color="rgb(231, 64, 89)"
                      @click="closeBroadcastDetail"
                    >
                      mdi-play
                    </v-icon>
                    <span class="caption msy-color-text-red">戻る</span>
                  </v-btn>
                </v-col>
                <v-col cols="8" class="pl-3 pb-2 pt-3">
                  <span
                    class="broadcast-title default-font-family font-weight-bold"
                    v-text="broadcast_.title"
                  ></span>
                </v-col>
              </v-row>
            </v-card-title>
          </v-row>
          <v-row class="header-buffer-area" />
          <v-row align="center" justify="center">
            <v-img
              :src="
                broadcast_.imageId
                  ? imgUrl(broadcast_.imageId)
                  : '/images/no_image.png'
              "
              :width="'100%'"
            >
              <!-- <v-row align="center" justify="center">
                <div>
                  <span v-text="broadcast_.broadcastDatetime"></span>
                </div>
                <div>
                  <span v-text="broadcastStatusStr()"></span>
                </div>
                <div v-if="broadcast_.fee">
                  <span v-text="broadcast_.fee.toLocaleString() + 'Pt'"></span>
                </div>
              </v-row> -->
              <template v-slot:placeholder>
                <v-row class="fill-height ma-0" align="center" justify="center">
                  <v-progress-circular indeterminate color="grey lighten-5" />
                </v-row>
              </template>
            </v-img>
          </v-row>
          <v-row align="center" justify="center">
            <v-col class="broadcast-label" cols="4">
              <span v-text="'共有'"></span>
            </v-col>
            <v-col class="broadcast-content" cols="8">
              <SocialShareButton
                :url="
                  getLocationOrigin() +
                    '/ogp?artist_id=' +
                    broadcast_.userId +
                    '&broadcast_id=' +
                    broadcast_.broadcastId
                "
                :title="broadcast_.title"
                :description="broadcast_.explanation"
              />
            </v-col>
          </v-row>
          <v-row v-if="isBroadcastStatusLoaded" class="display-block mx-0">
            <v-row
              v-if="isFinishedBroadcast"
              class="ma-4 msy-color-text-red"
              align="center"
              justify="center"
            >
              <span v-text="'配信は終了しました。'"></span>
            </v-row>
            <v-row
              v-else-if="isCanceled"
              class="ma-4 msy-color-text-red"
              align="center"
              justify="center"
            >
              <span v-text="'配信はキャンセルされました。'"></span>
            </v-row>
            <v-row
              v-if="!isPurchased && !isCompleted && !isMyBroadcast"
              class="ma-4"
              align="center"
              justify="center"
            >
              <v-btn dark block class="msy-color-red" @click="toPurchasePage">
                <v-icon class="mx-1" small>mdi-ticket</v-icon>
                <span v-text="'チケットを購入する'"></span>
              </v-btn>
            </v-row>
            <div v-if="isPurchased && !isMyBroadcast">
              <v-row
                v-if="isCancelable"
                class="ma-4"
                align="center"
                justify="center"
              >
                <v-btn dark block class="msy-color-red" @click="cancelPurchase">
                  <v-icon class="mx-1" small>mdi-cancel</v-icon>
                  <span v-text="'購入をキャンセルする'"></span>
                </v-btn>
              </v-row>
              <v-row
                v-if="!isCompleted"
                class="ma-4"
                align="center"
                justify="center"
              >
                <v-btn
                  dark
                  block
                  :disabled="!isBroadcasting"
                  class="msy-color-red"
                  @click="startViewing"
                >
                  <v-icon class="mx-1" small>mdi-movie</v-icon>
                  <span v-text="'視聴を開始する'"></span>
                </v-btn>
                <span>
                  ※視聴開始ボタンは開演5分前より有効になります。
                  （有効にならない場合はお手数ですが再度チケットを開き直してください）
                </span>
              </v-row>
            </div>
            <v-row
              v-if="isArtist && isEditable && !isCompleted"
              class="ma-4"
              align="center"
              justify="center"
            >
              <v-btn dark block class="msy-color-red" @click="editBroadcast">
                <v-icon class="mx-1" small>mdi-file-video</v-icon>
                <span v-text="'配信情報を編集する'"></span>
              </v-btn>
            </v-row>
            <v-row
              v-if="isArtist && isEditable && !isCompleted"
              class="ma-4"
              align="center"
              justify="center"
            >
              <v-btn dark block class="msy-color-red" @click="cancelBroadcast">
                <v-icon class="mx-1" small>mdi-video-off</v-icon>
                <span v-text="'配信をキャンセルする'"></span>
              </v-btn>
            </v-row>
            <v-row
              v-if="isArtist && isMyBroadcast && !isCompleted"
              class="ma-4 pb-5"
              align="center"
              justify="center"
            >
              <v-btn dark block class="msy-color-red" @click="startHosting">
                <v-icon class="mx-1" small>mdi-video-switch</v-icon>
                <span v-text="'配信を開始する'"></span>
              </v-btn>
            </v-row>
          </v-row>
          <v-row v-else>
            <v-row justify="center" align="center" class="my-5">
              <v-progress-circular
                indeterminate
                :size="48"
                :width="5"
                :rotate="360"
                color="rgb(231, 64, 89)"
              />
            </v-row>
          </v-row>
          <v-row align="center" justify="center">
            <v-col class="broadcast-label" cols="3">
              <span v-text="'配信日時'"></span>
            </v-col>
            <v-col class="broadcast-content" cols="9">
              <span v-text="broadcastDateTimeStr"></span>
            </v-col>
          </v-row>
          <v-row align="center" justify="center">
            <v-col class="broadcast-label" cols="4">
              <span v-text="'配信者'"></span>
            </v-col>
            <v-col class="broadcast-content" cols="8">
              <span v-text="broadcast_.artistName"></span>
            </v-col>
          </v-row>
          <v-row align="center" justify="center">
            <v-col class="broadcast-label" cols="4">
              <span v-text="'出演者'"></span>
            </v-col>
            <v-col class="broadcast-content" cols="8">
              <span v-text="broadcast_.artists"></span>
            </v-col>
          </v-row>
          <v-row align="start" justify="center">
            <v-col class="broadcast-label" cols="4">
              <span v-text="'配信内容'"></span>
            </v-col>
            <v-col class="broadcast-content" cols="8">
              <span
                class="broadcast-explanation"
                v-text="broadcast_.explanation"
              ></span>
            </v-col>
          </v-row>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import BroadcastsDao from "~/mixins/dao/BroadcastsDao";
import PurchasedContentsDao from "~/mixins/dao/PurchasedContentsDao";
import { Cloudinary } from "~/constant";
import SocialShareButton from "~/components/molecules/SocialShareButton";

export default {
  components: {
    SocialShareButton,
  },
  mixins: [BroadcastsDao, PurchasedContentsDao],
  props: {
    isShow: {
      type: Boolean,
      default: false,
    },
    broadcast: {
      type: Object,
      default: undefined,
    },
    isEditable: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      cloudinary: Cloudinary,
      isShowBroadcastDialog: this.isShow,
      broadcast_: undefined,
      broadcastStatus: 0,
      isBroadcastStatusLoaded: false,
      isPurchased: false,
    };
  },
  computed: {
    isArtist() {
      return this.$store.state.user.user
        ? this.$store.state.user.user.isArtist
        : false;
    },
    isMyBroadcast() {
      return this.$store.state.user.user && this.broadcast_
        ? this.$store.state.user.user.userId === this.broadcast_.userId
        : false;
    },
    isCancelable() {
      // 3日前までキャンセル可能にする
      const canselLimitDatetime = this.$moment(
        this.broadcast_.broadcastDatetime
      ).subtract(3, "days");
      return this.$moment().isBefore(canselLimitDatetime);
    },
    /**
     * 配信済もしくは配信中止されているかどうか判定するメソッド
     */
    isCompleted() {
      return this.broadcastStatus === 2 || this.broadcastStatus === 4;
    },
    isFinishedBroadcast() {
      return this.broadcastStatus === 2;
    },
    isCanceled() {
      return this.broadcastStatus === 4;
    },
    isBroadcasting() {
      return this.broadcastStatus === 1;
    },
    broadcastDateTimeStr() {
      return this.$moment(this.broadcast_.broadcastDatetime).format(
        "YYYY年MM月DD日 HH時mm分"
      );
    },
  },
  watch: {
    async isShow(newValue, oldValue) {
      if (this.broadcast) {
        if (!this.broadcast_) {
          this.broadcast_ = this.broadcast;
          this.broadcast_.artistName = this.broadcast.username;
        }
        this.isShowBroadcastDialog = newValue;
        await this.checkPurchaseBroadcastTicket();
        this.broadcastStatus = this.getStatus();
        this.isBroadcastStatusLoaded = true;
      }
    },
  },
  methods: {
    imgUrl(imageId) {
      return `https://res.cloudinary.com/${this.cloudinary.cloudName}/image/upload/${this.cloudinary.quality}/${imageId}`;
    },
    closeBroadcastDetail() {
      this.isShowBroadcastDialog = false;
      this.isBroadcastStatusLoaded = false;
      this.broadcast_ = undefined;
      sessionStorage.removeItem("broadcast");
      this.$emit("close");
    },
    toPurchasePage() {
      this.broadcast_.imageUrl = this.broadcast_.imageId
        ? this.imgUrl(this.broadcast_.imageId)
        : "/images/no_image.png";
      this.broadcast_.price = this.broadcast_.fee;
      this.$router.push({
        name: "fans-purchase",
        params: {
          content: this.broadcast_,
          isMovie: false,
          isMusic: false,
          isPoint: false,
          isPlan: false,
          isTicket: true,
        },
      });
    },
    cancelPurchase() {
      if (this.broadcast_.purchaseId) {
        const answer = window.confirm(
          "配信チケットの購入をキャンセルすると戻せません。よろしいですか？"
        );
        if (answer) {
          const user = this.$store.state.user.user;
          const purchaseId = this.broadcast_.purchaseId;
          try {
            this.BroadcastsDao_CancelBroadcastTicket(user.userId, purchaseId);
          } catch (error) {
            console.error(error);
          }
        }
      }
    },
    async cancelBroadcast() {
      const answer = window.confirm(
        "配信予定をキャンセルすると戻せません。よろしいですか？"
      );
      if (answer) {
        try {
          await this.BroadcastsDao_CancelOneBroadcast(
            this.broadcast_.broadcastId
          );
          console.log(this.broadcast_.broadcastId);
          this.closeBroadcastDetail();
          this.$emit("broadcast-cancelled");
        } catch (error) {
          console.error(error);
        }
      }
    },
    editBroadcast() {
      if (this.isArtist) {
        this.$router.push({
          name: "artists-createticket",
          params: { broadcast: this.broadcast_ },
        });
      } else {
        this.$router.push({
          name: "fans-main",
        });
      }
    },
    startViewing() {
      let audiencePageName = "fans-broadcastaudience";
      if (this.broadcast_.imagefluxChannelInfoStr) {
        audiencePageName = "fans-broadcastaudience-hd";
      }
      this.$router.push({
        name: audiencePageName,
        params: {
          broadcast: this.broadcast_,
        },
      });
    },
    startHosting() {
      let hostingPageName = "artists-broadcasthost";
      if (this.broadcast_.imagefluxChannelInfoStr) {
        hostingPageName = "artists-broadcasthost-hd";
      }
      this.$router.push({
        name: hostingPageName,
        params: {
          broadcast: this.broadcast_,
        },
      });
    },
    isBroadcastStarted() {
      // 5分前から入れるようにする
      const startTime = this.$moment(
        this.broadcast_.broadcastDatetime
      ).subtract(300, "seconds");
      return this.$moment().isAfter(startTime);
    },
    isBroadcastEnded() {
      // 最長3時間
      const endTime = this.$moment(this.broadcast_.broadcastDatetime).add(
        10800,
        "seconds"
      );
      return this.$moment().isAfter(endTime);
    },
    broadcastStatusStr() {
      let statusStr = "";
      switch (this.broadcastStatus) {
      case 0:
        statusStr = "配信前";
        break;
      case 1:
        statusStr = "配信中";
        break;
      case 2:
        statusStr = "配信済";
        break;
      case 3:
        statusStr = "視聴済";
        break;
      case 4:
        statusStr = "中止";
        break;
      }
      return statusStr;
    },
    getStatus() {
      let result = 0;
      if (this.broadcast_.deletedDatetime) {
        // 中止
        result = 4;
      } else if (this.broadcast_.isFinished || this.isBroadcastEnded()) {
        // 配信済
        result = 2;
      } else if (
        this.isBroadcastStarted() &&
        !this.isBroadcastEnded() &&
        !this.broadcast_.isFinished
      ) {
        // 配信中
        result = 1;
      } else if (!this.isBroadcastStarted()) {
        // 配信前
        result = 0;
      }
      return result;
    },
    async checkPurchaseBroadcastTicket() {
      const userId = this.$store.state.user.user.userId;
      const purchasedUserId = this.broadcast_.purchasedUserId;
      const resultSql = await this.isPurchasedBroadcast(
        userId,
        this.broadcast_.broadcastId
      );
      this.isPurchased = purchasedUserId
        ? userId === purchasedUserId
        : resultSql.data.rows[0].exists;
    },
    async isPurchasedBroadcast(userId, broadcastId) {
      const sqlResult = await this.PurchasedContentsDao_isPurchasedContent(
        userId,
        broadcastId
      );
      return sqlResult;
    },
    getLocationOrigin() {
      return location.origin;
    },
  },
};
</script>

<style lang="scss" scoped>
.broadcast-dialog-wrapper {
  width: 100vw;
}

.dialog-content {
  overflow-x: hidden;
  border-radius: 0px !important;
}
.title-area-wrapper {
  position: fixed;
  width: 100%;
  background-color: white !important;
  top: 0;
  left: 0;
  margin: 0;
  padding: 0;
  z-index: 1;
  height: 86px;
}
.header-buffer-area {
  margin-top: 86px;
}
.close-icon {
  transform: scale(-1, 1);
}
.broadcast-headline {
  display: flex;
  justify-content: flex-start;
  padding: 0 !important;
}
.broadcast-title {
  font-size: 1.2rem;
  margin-right: 30px;
}
.broadcast-explanation {
  white-space: pre-wrap;
}
.broadcast-label {
  text-align: left;
  font-size: 1rem;
  color: rgba(0, 0, 0, 0.5);
  padding-left: 24px;
  white-space: nowrap;
}
.broadcast-content {
  text-align: left;
  color: rgba(0, 0, 0, 0.89);
}
.display-block {
  display: block;
}

@media screen and (min-width: 960px) {
  .dialog-content-wrapper {
    width: 50vw;
    margin-left: auto;
    margin-right: auto;
  }
}
</style>
