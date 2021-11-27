<template>
  <div class="broadcast-list-wrapper">
    <v-container v-if="broadcasts" class="broadcast-list">
      <v-row v-if="broadcasts.length > 0" dense>
        <v-col
          v-for="broadcast in broadcasts"
          :key="broadcast.imageId"
          class="py-2 broadcast-card-wrapper"
          cols="6"
          sm="6"
          md="4"
          lg="4"
        >
          <div
            v-if="judgeShowBroadcast(broadcast) || isShowAllMode"
            class="broadcast-card"
            @click="$emit('select-item', broadcast)"
          >
            <v-row>
              <div class="broadcast-image-wrapper">
                <v-icon
                  v-if="isFavorite(broadcast.imageId)"
                  class="broadcast-favorite"
                >
                  mdi-heart
                </v-icon>
                <img
                  v-if="broadcast.imageId"
                  class="broadcast-image"
                  :src="imgUrl(broadcast.imageId)"
                  alt="broadcast image"
                />
                <img
                  v-else
                  class="broadcast-image"
                  :src="'/images/no_image.png'"
                  alt="broadcast image"
                />
              </div>
            </v-row>
            <v-row class="mt-2">
              <div class="broadcast-title">
                <span
                  class="
                    msy-color-text-blue-gray
                    default-font
                    font-weight-light
                  "
                  v-text="broadcast.title"
                ></span>
              </div>
            </v-row>
            <v-row>
              <div class="broadcast-artist-name">
                <span
                  class="
                    msy-color-text-blue-gray
                    default-font
                    font-weight-light
                  "
                  v-text="broadcast.artists"
                ></span>
              </div>
            </v-row>
          </div>
        </v-col>
      </v-row>
      <v-row v-else class="py-5" justify="center" align="center">
        <v-col class="msy-color-text-red">
          <v-row class="py-5" justify="center" align="center">
            <v-icon color="rgb(231, 64, 89)" size="72px">
              mdi-broadcast-note-off
            </v-icon>
          </v-row>
          <v-row class="py-5" justify="center" align="center">
            <span v-text="'コンテンツはありません'"></span>
          </v-row>
        </v-col>
      </v-row>
    </v-container>
    <v-container v-else class="broadcast-list">
      <v-row dense justify="center" align="center" class="my-5">
        <v-progress-circular
          indeterminate
          :size="48"
          :width="5"
          :rotate="360"
          color="rgb(231, 64, 89)"
        />
      </v-row>
    </v-container>
  </div>
</template>

<script>
import { Cloudinary, ContentAllowType } from "~/constant";
import AllowedContentsService from "~/mixins/service/AllowedContentsService";
import LocalStorageService from "~/mixins/service/LocalStorageService";
export default {
  name: "BroadcastList",
  mixins: [AllowedContentsService, LocalStorageService],
  props: {
    broadcasts: {
      type: Array,
      default: undefined,
    },
    likes: {
      type: Array,
      default: undefined,
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
    cacheKeyPrefix: String,
    artistUserId: String,
  },
  data() {
    return {
      cloudinary: Cloudinary,
      contentAllowType: ContentAllowType,
    };
  },
  computed: {
    isFavorite() {
      return function (id) {
        return this.likes && this.likes.includes(id);
      };
    },
  },
  watch: {
    broadcasts(newValue, oldValue) {
      this.LocalStorageService_StoreToLocalStorageByUser(
        this.cacheKeyPrefix,
        this.artistUserId,
        newValue,
        this.toCacheModels
      );
    },
  },
  created() {
    // This storage process is executed when this component is called by ArtistMyProfile,
    // because ArtistMyProfile creates this component on selecting broadcast tab and watch prop can't inspect initializing target prop on creating component.
    this.LocalStorageService_StoreToLocalStorageByUser(
      this.cacheKeyPrefix,
      this.artistUserId,
      this.broadcasts,
      this.toCacheModels
    );
  },
  methods: {
    imgUrl(imageId) {
      return `https://res.cloudinary.com/${this.cloudinary.cloudName}/image/upload/${this.cloudinary.quality}/${imageId}`;
    },
    toCacheModels(broadcasts) {
      return this.broadcasts.map((broadcast) => {
        return {
          imageId: broadcast.imageId,
          title: broadcast.title,
          artists: broadcast.artists,
          allowType: broadcast.allowType,
        };
      });
    },
    judgeShowBroadcast(broadcast) {
      let result = false;
      if (this.supportedPlan) {
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
      return this.AllowedContentsService_JudgeFollowing(
        broadcast,
        this.isFollowing
      );
    },
    judgeAllowedBroadcast(broadcast) {
      let result = false;
      if (this.supportedPlan) {
        result = this.AllowedContentsService_JudgeAllowedContent(
          broadcast,
          this.supportedPlan
        );
      } else {
        result = parseInt(broadcast.allowType) === this.contentAllowType.All;
      }
      return result;
    },
    judgeMyBroadcast(broadcast) {
      return this.AllowedContentsService_JudgeMyContent(broadcast);
    },
  },
};
</script>

<style lang="scss" scoped>
@media screen and (max-width: 960px) {
  .broadcast-list-wrapper {
    width: 100vw;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .broadcast-list {
    width: 100%;
    padding: 0 24px;
  }
  .broadcast-card {
    width: 40vw;
    margin: 8px 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .broadcast-image-wrapper {
    position: relative;
    width: 40vw;
    height: 40vw;
    display: inline-flex;
    justify-content: center;
    position: relative;
    text-align: center;
    vertical-align: middle;
    overflow: hidden;
    border-radius: 7px;
    box-shadow: 2px 4px 4px gray;
  }
  .broadcast-image-wrapper i {
    position: absolute;
    font-size: 20px;
    top: 0.5rem;
    left: 0.5rem;
    color: rgb(231, 64, 89);
    color: linear-gradient(
      135deg,
      rgba(231, 64, 89, 1) 0%,
      rgba(189, 100, 153, 1) 100%
    );
    z-index: 1;
  }
  .broadcast-image {
    width: 40vw;
    height: 40vw;
    object-fit: cover;
  }
  .broadcast-title {
    font-size: 1.2rem;
    display: flex;
    width: 40vw;
    padding-left: 1px;
    white-space: nowrap;
    overflow: hidden;
  }
  .broadcast-artist-name {
    font-size: 0.8rem;
    display: flex;
    width: 40vw;
    padding-left: 1px;
    align-items: center;
  }
}
@media screen and (min-width: 960px) {
  .broadcast-list-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .broadcast-list {
    width: 100%;
    padding: 0 24px;
  }
  .broadcast-card-wrapper {
    margin-left: auto;
    margin-right: auto;
    margin-bottom: 4vh;
  }
  .broadcast-card {
    width: 15vw;
    margin-left: auto;
    margin-right: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .broadcast-image-wrapper {
    position: relative;
    width: 15vw;
    height: 15vw;
    display: inline-flex;
    justify-content: center;
    position: relative;
    text-align: center;
    vertical-align: middle;
    overflow: hidden;
    border-radius: 7px;
    box-shadow: 2px 4px 4px gray;
  }
  .broadcast-image-wrapper i {
    position: absolute;
    font-size: 20px;
    top: 0.5rem;
    left: 0.5rem;
    color: rgb(231, 64, 89);
    color: linear-gradient(
      135deg,
      rgba(231, 64, 89, 1) 0%,
      rgba(189, 100, 153, 1) 100%
    );
    z-index: 1;
  }
  .broadcast-image {
    width: 15vw;
    height: 15vw;
    object-fit: cover;
  }
  .broadcast-title {
    font-size: 1.2rem;
    display: flex;
    width: 15vw;
    padding-left: 1px;
    white-space: nowrap;
    overflow: hidden;
  }
  .broadcast-artist-name {
    font-size: 0.8rem;
    display: flex;
    width: 15vw;
    padding-left: 1px;
    align-items: center;
  }
}
</style>
