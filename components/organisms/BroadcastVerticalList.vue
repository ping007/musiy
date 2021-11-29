<template>
  <div>
    <v-container
      v-if="broadcasts && broadcasts.length > 0"
      class="broadcast-list"
    >
      <v-row
        v-for="broadcast in broadcasts"
        :key="broadcast.broadcastId"
        align="center"
        justify="center"
        class="broadcast-list-row"
      >
        <v-col
          v-if="judgeShowBroadcast(broadcast) || isShowAllMode"
          cols="12"
          @click="selectBroadcast(broadcast)"
        >
          <v-row
            class="bold broadcast-title-wrapper"
            align="center"
            justify="center"
          >
            <v-col cols="6">
              <v-row align="center" justify="center">
                <span
                  class="msy-color-text-black"
                  v-text="formatDatetime(broadcast.broadcastDatetime)"
                ></span>
              </v-row>
            </v-col>
            <v-col cols="6">
              <v-row align="center" justify="center">
                <span
                  class="msy-color-text-black"
                  v-text="broadcast.title"
                ></span>
              </v-row>
            </v-col>
          </v-row>
          <v-row align="center" justify="center">
            <div class="broadcast-list-img">
              <v-img
                class="broadcast-list-img-inner"
                :src="
                  broadcast.imageId
                    ? imgUrl(broadcast.imageId)
                    : '/images/no_image.png'
                "
                lazy-src="/images/no_image.png"
              >
                <v-row align="center" justify="center">
                  <div class="broadcast-status">
                    <p v-text="broadcastStatusStr(broadcast)"></p>
                  </div>
                  <div v-if="broadcast.fee" class="ticket-price">
                    <p v-text="broadcast.fee.toLocaleString() + 'P'"></p>
                  </div>
                </v-row>
                <template v-slot:placeholder>
                  <v-row
                    class="fill-height ma-0"
                    align="center"
                    justify="center"
                  >
                    <v-progress-circular indeterminate color="grey lighten-5" />
                  </v-row>
                </template>
              </v-img>
            </div>
          </v-row>
          <v-row
            class="broadcast-list-content my-4"
            align="center"
            justify="center"
          >
            <span
              class="msy-color-text-dark-gray"
              v-text="broadcast.explanation"
            ></span>
          </v-row>
        </v-col>
        <v-col
          v-else-if="
            parseInt(broadcast.allowType) ===
              contentAllowType.FollowersOrSupporters
          "
        >
          <v-row class="bold" align="center" justify="center">
            <v-col cols="6">
              <v-row align="center" justify="center">
                <span
                  class="msy-color-text-black"
                  v-text="formatDatetime(broadcast.broadcastDatetime)"
                ></span>
              </v-row>
            </v-col>
            <v-col cols="6">
              <v-row align="center" justify="center">
                <span
                  class="msy-color-text-black"
                  v-text="broadcast.title"
                ></span>
              </v-row>
            </v-col>
          </v-row>
          <v-row class="py-5" align="center" justify="center">
            <span
              class="msy-color-text-red"
              v-text="'フォロワー・応援者限定コンテンツ'"
            >
            </span>
          </v-row>
          <v-row class="py-2" align="center" justify="center">
            <v-btn
              color="rgb(231, 64, 89)"
              outlined
              dense
              rounded
              @click="$emit('to-follow')"
            >
              <v-icon left>mdi-account-plus</v-icon>
              <span v-text="'フォロー'"></span>
            </v-btn>
          </v-row>
          <v-row class="py-2" align="center" justify="center">
            <v-btn
              class="msy-color-red donation-btn"
              outlined
              rounded
              dark
              @click="$emit('to-support')"
            >
              <v-icon small>mdi-currency-jpy</v-icon>
              <span v-text="'応援する'"></span>
            </v-btn>
          </v-row>
        </v-col>
        <v-col
          v-else-if="
            parseInt(broadcast.allowType) === contentAllowType.Supporters &&
              !judgeAllowedBroadcast(broadcast)
          "
        >
          <v-row class="bold" align="center" justify="center">
            <v-col cols="6">
              <v-row align="center" justify="center">
                <span
                  class="msy-color-text-black"
                  v-text="formatDatetime(broadcast.broadcastDatetime)"
                ></span>
              </v-row>
            </v-col>
            <v-col cols="6">
              <v-row align="center" justify="center">
                <span
                  class="msy-color-text-black"
                  v-text="broadcast.title"
                ></span>
              </v-row>
            </v-col>
          </v-row>
          <v-row class="py-5" align="center" justify="center">
            <v-icon color="rgb(231, 64, 89)" size="72px"> mdi-gift </v-icon>
          </v-row>
          <v-row class="py-5" align="center" justify="center">
            <span
              class="msy-color-text-red"
              v-text="'応援者限定コンテンツ'"
            ></span>
          </v-row>
          <v-row class="py-2" align="center" justify="center">
            <span
              class="msy-color-text-red"
              v-text="
                '応援プラン：' +
                  broadcast.planName +
                  '(' +
                  broadcast.planPrice +
                  'P)以上限定'
              "
            ></span>
          </v-row>
          <v-row class="py-2" align="center" justify="center">
            <v-btn
              class="msy-color-red donation-btn"
              outlined
              rounded
              dark
              @click="$emit('to-support')"
            >
              <v-icon small>mdi-currency-jpy</v-icon>
              <span v-text="'応援する'"></span>
            </v-btn>
          </v-row>
        </v-col>
      </v-row>
    </v-container>
    <v-container v-else-if="!isContentLoaded">
      <v-row justify="center" align="center" class="mx-0 my-5">
        <v-progress-circular
          class="ma-4"
          indeterminate
          :size="24"
          :width="5"
          :rotate="360"
          color="rgb(231, 64, 89)"
        />
        <span class="msy-color-text-red" v-text="'読み込み中'"></span>
      </v-row>
    </v-container>
    <v-container v-else-if="isContentLoaded">
      <v-row class="py-5" justify="center" align="center">
        <v-col class="msy-color-text-red">
          <v-row class="py-5" justify="center" align="center">
            <v-icon color="rgb(231, 64, 89)" size="72px"> mdi-cast </v-icon>
          </v-row>
          <v-row class="py-5" justify="center" align="center">
            <span v-text="'配信予定がありません'"></span>
          </v-row>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import { Cloudinary, ContentAllowType } from "~/constant";
import AllowedContentsService from "~/mixins/service/AllowedContentsService";
import LocalStorageService from "~/mixins/service/LocalStorageService";
import PlansDao from "~/mixins/dao/PlansDao";

export default {
  mixins: [PlansDao, AllowedContentsService, LocalStorageService],
  props: {
    broadcasts: {
      type: Array,
      default: undefined,
    },
    isContentLoaded: {
      type: Boolean,
      default: false,
    },
    isFollowing: {
      type: Boolean,
      default: false,
    },
    supportedPlan: {
      type: Object,
      default: undefined,
    },
    isShowAllMode: {
      type: Boolean,
      default: false,
    },
    cacheKeyPrefix: {
      type: String,
      default: "",
    },
    artistUserId: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      cloudinary: Cloudinary,
      contentAllowType: ContentAllowType,
    };
  },
  watch: {
    broadcasts(newValue, oldValue) {
      this.storeToCache(newValue);
    },
  },
  created() {
    // This storage process is executed when this component is called by ArtistMyProfile,
    // because ArtistMyProfile creates this component on selecting movie tab and watch prop can't inspect initializing target prop on creating component.
    this.storeToCache(this.broadcasts);
  },
  methods: {
    storeToCache(value) {
      if (this.cacheKeyPrefix && !this.artistUserId) {
        this.LocalStorageService_StoreToLocalStorage(
          this.cacheKeyPrefix,
          value,
          this.toCacheModels
        );
      } else if (this.cacheKeyPrefix && this.artistUserId) {
        this.LocalStorageService_StoreToLocalStorageByUser(
          this.cacheKeyPrefix,
          this.artistUserId,
          value,
          this.toCacheModels
        );
      }
    },
    imgUrl(imageId) {
      return `https://res.cloudinary.com/${this.cloudinary.cloudName}/image/upload/${this.cloudinary.quality}/${imageId}`;
    },
    toCacheModels(broadcasts) {
      return this.broadcasts.map((broadcast) => {
        return {
          broadcastId: broadcast.broadcastId,
          broadcastDatetime: broadcast.broadcastDatetime,
          title: broadcast.title,
          imageId: broadcast.imageId,
          fee: broadcast.fee,
          explanation: broadcast.explanation,
          allowType: broadcast.allowType,
          planName: broadcast.planName,
          planPrice: broadcast.planPrice,
        };
      });
    },
    formatDatetime(datetime) {
      return this.$moment(datetime).format("YYYY-MM-DD HH:mm");
    },
    broadcastStatusStr(broadcast) {
      const status = this.getStatus(broadcast);
      let statusStr = "";
      switch (status) {
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
    getStatus(broadcast) {
      let result = 0;
      if (broadcast.deletedDatetime) {
        // 中止
        result = 4;
      } else if (broadcast.isFinished || this.isBroadcastEnded(broadcast)) {
        // 配信済
        result = 2;
      } else if (
        this.isBroadcastStarted(broadcast) &&
        !this.isBroadcastEnded(broadcast) &&
        !broadcast.isFinished
      ) {
        // 配信中
        result = 1;
      } else if (!this.isBroadcastStarted(broadcast)) {
        // 配信前
        result = 0;
      }
      return result;
    },
    selectBroadcast(broadcast) {
      this.$emit("select-broadcast", broadcast);
    },
    isBroadcastStarted(broadcast) {
      // 2分前から入れるようにする
      const startTime = this.$moment(broadcast.broadcastDatetime).subtract(
        120,
        "seconds"
      );
      return this.$moment().isAfter(startTime);
    },
    isBroadcastEnded(broadcast) {
      // 最長2時間
      const endTime = this.$moment(broadcast.broadcastDatetime).add(
        7200,
        "seconds"
      );
      return this.$moment().isAfter(endTime);
    },
    judgeShowBroadcast(broadcast) {
      let result = false;
      if (this.supportedPlan) {
        broadcast.isShow = true;
        broadcast.price = broadcast.fee;
        result = this.AllowedContentsService_JudgeShowContent(
          broadcast,
          this.supportedPlan,
          this.isFollowing
        );
      } else if (
        parseInt(broadcast.allowType) ===
        this.contentAllowType.FollowersOrSupporters
      ) {
        result = this.AllowedContentsService_JudgeShowContent(
          broadcast,
          this.supportedPlan,
          this.isFollowing
        );
      } else {
        result = parseInt(broadcast.allowType) === this.contentAllowType.All;
      }
      return result;
    },
    judgeFollowing(broadcast) {
      broadcast.price = broadcast.fee;
      return this.AllowedContentsService_JudgeFollowing(
        broadcast,
        this.isFollowing
      );
    },
    judgeAllowedBroadcast(broadcast) {
      let result = false;
      if (this.supportedPlan) {
        broadcast.price = broadcast.fee;
        result = this.AllowedContentsService_JudgeAllowedContent(
          broadcast,
          this.supportedPlan
        );
      } else {
        result = parseInt(broadcast.allowType) === this.contentAllowType.All;
      }
      return result;
    },
    judgeMyFeed(broadcast) {
      broadcast.price = broadcast.fee;
      return this.AllowedContentsService_JudgeMyContent(broadcast);
    },
  },
};
</script>

<style lang="scss" scoped>
@media screen and (max-width: 960px) {
  .broadcast-list {
    width: 100vw;
    display: flex;
    padding: 0px;
    background-color: #ffffff !important;
    margin: 12px 0 48px;
    flex-direction: column;
  }

  .broadcast-list-img {
    width: 100%;
  }
  .broadcast-list-row {
    width: 100vw;
    margin: 0;
    padding: 0 10vw;
  }
  .broadcast-status {
    position: absolute;
    top: 0;
    left: 0;
    height: 20px;
    width: 56px;
    background: linear-gradient(
      135deg,
      rgba(231, 64, 89, 1) 0%,
      rgba(189, 100, 153, 1) 100%
    );
    color: #ffffff;
    text-align: center;
    font-size: 0.8rem;
  }
  .ticket-price {
    position: absolute;
    bottom: 0;
    right: 0;
    margin: 8px 12px;
    border-radius: 12px;
    height: 20px;
    width: 56px;
    background: linear-gradient(
      135deg,
      rgba(231, 64, 89, 1) 0%,
      rgba(189, 100, 153, 1) 100%
    );
    color: #ffffff;
    text-align: center;
    font-size: 0.8rem;
  }
  .broadcast-title-wrapper {
    font-size: 0.9rem;
  }
  .broadcast-list-content {
    width: 100%;
    font-size: 0.8rem;
  }
  .broadcast-list-img-inner {
    max-height: 440px;
  }
}
@media screen and (min-width: 960px) {
  .broadcast-list {
    width: 100vw;
    display: flex;
    flex-wrap: nowrap;
    overflow-x: scroll;
    padding: 0px;
    background-color: #ffffff !important;
    margin: 12px 0 48px;
  }

  .broadcast-list-img {
    width: 40vw;
    height: 25vw;
    object-fit: cover;
    overflow: hidden;
    margin: 0 24px;
  }
  .broadcast-list-row {
    width: 40vw;
    height: auto;
    margin: 0;
    padding: 0 12px;
  }
  .broadcast-status {
    position: absolute;
    top: 0;
    left: 0;
    height: 24px;
    width: 56px;
    background: linear-gradient(
      135deg,
      rgba(231, 64, 89, 1) 0%,
      rgba(189, 100, 153, 1) 100%
    );
    color: #ffffff;
    text-align: center;
  }
  .ticket-price {
    position: absolute;
    bottom: 0;
    right: 0;
    margin: 8px 12px;
    border-radius: 12px;
    height: 24px;
    width: 56px;
    background: linear-gradient(
      135deg,
      rgba(231, 64, 89, 1) 0%,
      rgba(189, 100, 153, 1) 100%
    );
    color: #ffffff;
    text-align: center;
  }
  .broadcast-list-content {
    width: 100%;
  }
  .broadcast-list-img-inner {
    max-height: 440px;
  }
}
.broadcast-list-hr {
  border-color: #e74059 !important;
}
</style>
