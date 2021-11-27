<template>
  <div class="fans-purchase">
    <div v-show="getMask" class="mask"></div>
    <Loading v-model="loadingValue" />
    <v-container v-if="content">
      <v-row justify="center" align="center" class="mb-4 mt-4">
        <span class="default-font" v-text="'コンテンツ購入'"></span>
      </v-row>
      <v-row>
        <v-divider />
      </v-row>
      <v-row class="mb-4">
        <v-col cols="6" class="block-center">
          <div class="music-image-wrapper">
            <v-icon class="music-favorite">mdi-heart</v-icon>
            <v-img
              v-if="imgUrl && imgUrl !== ''"
              :src="imgUrl"
              lazy-src="/images/no_image.png"
              class="music-image"
            >
              <template v-slot:placeholder>
                <v-row class="fill-height ma-0" align="center" justify="center">
                  <v-progress-circular indeterminate color="grey lighten-5" />
                </v-row>
              </template>
            </v-img>
            <v-img v-else src="/images/no_image.png" />
          </div>
        </v-col>
        <v-col cols="6">
          <v-row
            class="px-4 content-title default-font"
            v-text="content.title"
          />
          <v-row
            class="content-artistname default-font"
            v-text="content.artistName"
          />
          <v-row
            v-if="isMusic || isMovie || isTicket || isPlan"
            justify="center"
            align="center"
            class="px-4 py-5 content-price"
            v-text="totalPrice + 'P'"
          />
          <v-row
            v-else
            justify="center"
            align="center"
            class="px-4 py-5 content-price"
            v-text="'¥' + taxIncludedPrice + '(税込)'"
          />
        </v-col>
      </v-row>

      <v-row v-if="!isPoint" class="px-5">
        <v-col class="block-center">
          <span
            class="default-font-family msy-color-text-black font-weight-bold"
            v-text="
              !isMusic && !isMovie && !isTicket && !isPlan
                ? '価格に上乗せしてアーティストを応援できます'
                : 'ポイントに上乗せしてアーティストを応援できます'
            "
          ></span>
        </v-col>
      </v-row>
      <v-row v-if="!isPoint" class="title support-point-wrapper">
        <v-col class="pb-0">
          <v-text-field
            v-model="appendPrice"
            type="tel"
            min="0"
            :rules="[
              rules.validateSupportPoint(appendPrice),
              rules.maxValue(appendPrice, 1000000),
            ]"
            :label="
              !isMusic && !isMovie && !isTicket && !isPlan
                ? '応援額'
                : '応援ポイント'
            "
            :prefix="!isMusic && !isMovie && !isTicket && !isPlan ? '¥' : ''"
            :suffix="isMusic || isMovie || isTicket || isPlan ? 'P' : ''"
            class="donation-point"
            onpaste="return false;"
            autocomplete="off"
            @keypress="validateNumOnly"
            @keyup="applyPointRule(appendPrice)"
          />
        </v-col>
      </v-row>
      <v-row
        v-if="!isPoint"
        justify="center"
        align="center"
        class="mx-1 mb-3 px-5"
      >
        <v-col>
          <v-btn
            color="brown lighten-4"
            block
            class="font-weight-bold"
            @click="appendPrice = 100"
            v-text="
              !isMusic && !isMovie && !isTicket && !isPlan ? '¥100' : '100P'
            "
          />
        </v-col>
        <v-col>
          <v-btn
            color="blue-grey lighten-4"
            block
            class="font-weight-bold"
            @click="appendPrice = 300"
            v-text="
              !isMusic && !isMovie && !isTicket && !isPlan ? '¥300' : '300P'
            "
          />
        </v-col>
        <v-col>
          <v-btn
            color="amber lighten-2"
            block
            class="font-weight-bold"
            @click="appendPrice = 500"
            v-text="
              !isMusic && !isMovie && !isTicket && !isPlan ? '¥500' : '500P'
            "
          />
        </v-col>
      </v-row>

      <v-row
        v-if="isMusic || isMovie || isTicket || isPlan"
        class="px-5 point-wrapper"
      >
        <v-col>
          <v-row class="mx-3 mb-3">
            <span
              class="default-font point-info"
              v-text="'ポイント情報'"
            ></span>
          </v-row>
          <v-row class="px-8 title" align="center" justify="end">
            <span
              class="default-font default-font-size"
              v-text="'保有ポイント：' + currentPoints + 'P'"
            ></span>
          </v-row>
          <v-row class="px-8 title" align="center" justify="end">
            <span
              class="
                default-font-family default-font-size
                msy-color-text-black
                font-weight-bold
              "
              v-text="'利用ポイント：' + totalPrice + 'P'"
            ></span>
          </v-row>
          <v-row
            v-if="currentPoints - totalPrice >= 0"
            class="px-8 title"
            align="center"
            justify="end"
          >
            <span
              class="default-font default-font-size"
              v-text="'購入後残ポイント：' + (currentPoints - totalPrice) + 'P'"
            ></span>
          </v-row>
          <v-row v-else class="px-4" align="center" justify="center">
            <v-col>
              <v-row align="center" justify="center">
                <span
                  class="red--text"
                  v-text="'保有ポイントが不足しています'"
                ></span>
              </v-row>
              <v-form ref="form">
                <v-row
                  class="px-4 donation-point buy-point-wrapper"
                  align="center"
                  justify="center"
                >
                  <v-text-field
                    v-model="buyPoints"
                    :rules="[
                      rules.validateSupportPoint,
                      rules.maxValue(buyPoints, 100000),
                    ]"
                    label="購入ポイント数"
                    :suffix="'P'"
                  />
                </v-row>
              </v-form>
              <v-row class="px-4" align="center" justify="center">
                <span
                  v-text="'※ポイント数は手入力で変更することもできます'"
                ></span>
              </v-row>
              <v-row align="center" justify="center" class="pa-0 ma-0">
                <v-btn
                  :disabled="buyPoints < totalPrice - currentPoints"
                  depressed
                  rounded
                  class="purchase-direct-btn"
                  @click="execBuyPoints"
                  v-text="'ポイントを購入する'"
                />
              </v-row>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
      <v-row v-else class="px-8">
        <span v-text="'決済カード情報'"></span>
        <Card
          v-if="cardInfo"
          :fields="fields"
          :labels="cardInfo"
          :is-card-number-masked="true"
          :random-backgrounds="true"
          :background-image="undefined"
        />
      </v-row>
      <v-row class="px-8">
        <v-col align="center" justify="center">
          <v-btn
            :disabled="
              (isMusic || isMovie || isTicket || isPlan
                ? currentPoints - totalPrice < 0
                : false) || !cardInfo
            "
            depressed
            rounded
            class="purchase-direct-btn"
            @click="execSavePurchase"
          >
            <v-icon small>mdi-currency-jpy</v-icon>
            <span v-text="'購入する'"></span>
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
    <v-snackbar
      v-model="isShowSuccessSnackbar"
      top
      :multi-line="true"
      :color="'success'"
      :timeout="3000"
      class="snackbar"
    >
      <span v-text="successStr"></span>
    </v-snackbar>
    <v-snackbar
      v-model="isShowErrorSnackbar"
      top
      :multi-line="true"
      :color="'error'"
      :timeout="3000"
      class="snackbar"
    >
      <span v-text="errorStr"></span>
    </v-snackbar>
  </div>
</template>

<script>
import Card from "~/components/molecules/Card";
import Loading from "~/components/molecules/Loading";
import PurchasedContentsDao from "~/mixins/dao/PurchasedContentsDao";
import BroadcastsDao from "~/mixins/dao/BroadcastsDao";
import PointsDao from "~/mixins/dao/PointsDao";
import SupportersDao from "~/mixins/dao/SupportersDao";
import StripeService from "~/mixins/service/StripeService";
import { Cloudinary } from "~/constant";
import { ValidateRules } from "~/constant.js";
import NotificationsService from "~/mixins/service/NotificationsService";
export default {
  components: {
    Card,
    Loading,
  },
  mixins: [
    PurchasedContentsDao,
    BroadcastsDao,
    PointsDao,
    SupportersDao,
    StripeService,
    NotificationsService,
  ],
  data() {
    return {
      cloudinary: Cloudinary,
      rules: ValidateRules,
      content: undefined,
      isMovie: false,
      isMusic: false,
      isPoint: false,
      isPlan: false,
      isTicket: false,
      appendPrice: 0,
      currentPoints: 0,
      buyPoints: 0,
      loadingValue: 0,
      isShowSuccessSnackbar: false,
      successStr: "",
      isShowErrorSnackbar: false,
      errorStr: "",
      fields: {
        cardNumber: "v-card-number",
        cardName: "v-card-name",
        cardMonth: "v-card-month",
        cardYear: "v-card-year",
        cardCvv: "v-card-cvv",
      },
      cardInfo: undefined,
      isMask: false,
      taxVal: 0.1, // 消費税10％
    };
  },
  computed: {
    getMask() {
      return this.isMask;
    },
    imgUrl() {
      return this.content.imageId
        ? `https://res.cloudinary.com/${this.cloudinary.cloudName}/image/upload/${this.cloudinary.quality}/${this.content.imageId}`
        : this.content.imageUrl;
    },
    totalPrice() {
      return (
        parseInt(this.content.price ? this.content.price : 0) +
        (this.appendPrice ? parseInt(this.appendPrice) : 0)
      );
    },
    taxIncludedPrice() {
      return Math.floor(this.totalPrice * (1 + this.taxVal));
    },
    taxIncludedBuyPointsPrice() {
      return Math.floor(this.buyPoints * (1 + this.taxVal));
    },
  },
  async created() {
    await this.preparePurchase();
    const res = await this.StripeService_loadCardInfo();
    this.loadingValue = 100;
    if (res.error) {
      if (res.error.code === "no cards") {
        this.isShowErrorSnackbar = true;
        this.errorStr = res.error.message;
        this.cardInfo = undefined;
        this.content = this.$route.params.content;
        setTimeout(() => {
          this.$router.push({
            name: "changepurchaseinfo",
            params: {
              fromPage: "no-cards",
              fromContent: this.content,
              fromIsMovie: this.isMovie,
              fromIsMusic: this.isMusic,
              fromIsPoint: this.isPoint,
              fromIsPlan: this.isPlan,
              fromIsTicket: this.isTicket,
            },
          });
        }, 3000);
      }
    } else {
      this.cardInfo = res.cardInfo;
    }
  },
  methods: {
    async preparePurchase() {
      if (this.$route.params.content) {
        this.content = this.$route.params.content;
        this.buyPoints = this.content.price < 1000 ? 1000 : this.content.price;
        this.isMovie =
          this.$route.params.isMovie !== undefined &&
          this.$route.params.isMovie;
        this.isMusic =
          this.$route.params.isMusic !== undefined &&
          this.$route.params.isMusic;
        this.isPoint =
          this.$route.params.isPoint !== undefined &&
          this.$route.params.isPoint;
        this.isPlan =
          this.$route.params.isPlan !== undefined && this.$route.params.isPlan;
        this.isTicket =
          this.$route.params.isTicket !== undefined &&
          this.$route.params.isTicket;
        if (this.isMovie || this.isMusic || this.isTicket || this.isPlan) {
          // 最新のポイント残高を取得
          this.loadingValue = 40;
          await this.loadCurrentPoints();
          this.loadingValue = 100;
        }
      } else {
        this.$router.push({
          name: "fans-main",
        });
      }
    },
    async execBuyPoints() {
      if (this.$refs.form && this.$refs.form.validate()) {
        try {
          const user = this.$store.state.user.user;
          if (user) {
            const contentId = this.$uuid.v4();
            const contentType = "point";
            this.loadingValue = 0;
            const stripeResult = await this.StripeService_ExecCardPayment(
              this.taxIncludedBuyPointsPrice
            );
            this.loadingValue = 40;
            console.log("stripeResult:", stripeResult);
            const result =
              await this.PurchasedContentsDao_UpsertPurchasedContent(
                contentId,
                contentType,
                this.buyPoints
              );
            this.loadingValue = 80;
            if (result) {
              // 最新のポイント残高を取得
              await this.loadCurrentPoints();
              this.loadingValue = 100;
              this.isShowSuccessSnackbar = true;
              this.successStr = "ポイントの購入が完了しました。";
            }
          }
        } catch (error) {
          console.error(error);
          this.loadingValue = 100;
        }
      }
    },
    async loadCurrentPoints() {
      const user = this.$store.state.user.user;
      if (user) {
        const points = await this.PointsDao_SelectPointsByUserId(user.userId);
        if (points && points[0]) {
          this.currentPoints = parseInt(points[0].totalPoints);
        }
      }
    },
    async execSavePurchase() {
      try {
        this.loadingValue = 0;
        const user = this.$store.state.user.user;
        if (user) {
          this.isMask = true;
          const purchaseId = this.$uuid.v4();
          let contentId = "";
          let contentType = "";
          if (this.isPoint) {
            contentId = this.$uuid.v4();
            contentType = "point";
            this.loadingValue = 30;
            // ポイント自体以外の物は全てポイントから購入するので
            // Stripeによるカードからの都度支払いが発生するのはポイント購入時のみ
            const stripeResult = await this.StripeService_ExecCardPayment(
              this.taxIncludedPrice
            );
            console.log("stripeResult:", stripeResult);
          } else if (this.isPlan) {
            contentId = this.content.plan.planId;
            contentType = "plan";
          } else if (this.isMusic) {
            contentId = this.content.musicId;
            contentType = "music";
          } else if (this.isMovie) {
            contentId = this.content.movieId;
            contentType = "movie";
          } else if (this.isTicket) {
            contentId = this.content.broadcastId;
            contentType = "ticket";
          }

          let result;

          if (this.isTicket) {
            this.loadingValue = 60;
            result = await this.BroadcastsDao_PurchaseBroadcastTicket(
              user.userId,
              contentId
            );
          } else {
            this.loadingValue = 60;
            result = await this.PurchasedContentsDao_UpsertPurchasedContent(
              contentId,
              contentType,
              this.totalPrice
            );
          }

          if (result) {
            if (this.isPoint) {
              this.loadingValue = 100;
              this.isShowSuccessSnackbar = true;
              this.successStr = "購入が完了しました。３秒後にホームに戻ります";
              this.toNextPage();
            } else if (this.isPlan) {
              const artistUserId = this.content.plan.userId;
              const supporterUserId = user.userId;
              const planId = contentId;
              const isEnable = true;
              this.loadingValue = 80;
              await this.SupportersDao_UpsertSupporter(
                artistUserId,
                supporterUserId,
                planId,
                isEnable
              );
              const supportFromUserId = supporterUserId;
              const supportToUserId = artistUserId;
              this.NotificationsService_startSupportNotification(
                supportFromUserId,
                supportToUserId
              );
              this.loadingValue = 100;
              this.isShowSuccessSnackbar = true;
              this.successStr =
                "購入が完了しました。３秒後にマイアーティストページに移動します";
              this.toNextPage();
            } else if (this.isMusic) {
              this.loadingValue = 100;
              this.isShowSuccessSnackbar = true;
              this.successStr =
                "購入が完了しました。３秒後にマイミュージックページに移動します";
              this.toNextPage();
            } else if (this.isMovie) {
              this.loadingValue = 100;
              this.isShowSuccessSnackbar = true;
              this.successStr =
                "購入が完了しました。３秒後にマイムービーページに移動します";
              this.toNextPage();
            } else if (this.isTicket) {
              this.loadingValue = 100;
              this.isShowSuccessSnackbar = true;
              this.successStr =
                "購入が完了しました。３秒後にマイチケットページに移動します";
              this.toNextPage();
            }
          } else {
            this.loadingValue = 100;
            this.isShowErrorSnackbar = true;
            this.errorStr = "コンテンツの購入に失敗しました。";
            this.isMask = false;
          }
        } else {
          this.$router.push({
            name: "fans-main",
          });
        }
      } catch (error) {
        this.isMask = false;
        this.loadingValue = 100;
        console.error(error);
        if (error.message.includes("You have already purchased the ticket")) {
          this.isShowErrorSnackbar = true;
          this.errorStr = "このコンテンツは購入済です";
        }
        if (error.message.includes("Not enough points")) {
          this.isShowErrorSnackbar = true;
          this.errorStr = "ポイントが足りません";
        }
      }
    },
    toNextPage() {
      setTimeout(() => {
        if (this.isMovie) {
          this.$router.push({
            name: "fans-mymovies",
          });
        } else if (this.isMusic) {
          this.$router.push({
            name: "fans-mymusics",
          });
        } else if (this.isPlan) {
          this.$router.push({
            name: "fans-myartists",
          });
        } else if (this.isTicket) {
          this.$router.push({
            name: "fans-mytickets",
          });
        } else {
          this.$router.push({
            name: "fans-main",
          });
        }
      }, 3000);
    },
    validateNumOnly(e) {
      const charCode = e.which ? e.which : e.keyCode;
      if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        e.preventDefault();
      }
    },
    applyPointRule(points) {
      this.appendPrice = parseInt(String(points) || "0");
    },
  },
};
</script>

<style lang="scss" scoped>
@media screen and (max-width: 960px) {
  .fans-purchase {
    margin: 0 0 56px;
  }
  .music-image-wrapper {
    position: relative;
    width: 35vw;
    height: 35vw;
    display: inline-flex;
    justify-content: center;
    position: relative;
    text-align: center;
    vertical-align: middle;
    overflow: hidden;
    border-radius: 7px;
    box-shadow: 2px 4px 4px gray;
  }
  .music-image-wrapper i {
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
  .music-image {
    width: 35vw;
    height: 35vw;
  }
  .content-title {
    font-size: 1rem;
  }
  .content-artistname {
    font-size: 0.8rem;
    padding-left: 16px;
    padding-right: 16px;
  }
  .content-price {
    font-size: 1.3rem;
    font-weight: bold;
    margin-top: 5vh;
  }
  .support-point-wrapper {
    margin-left: 4px;
    margin-right: 4px;
    padding-left: 20px;
    padding-right: 20px;
  }
  .purchase-direct-btn {
    width: 100%;
  }
}
@media screen and (min-width: 960px) {
  .fans-purchase {
    margin: 0 0 56px;
    width: 56vw;
    margin-left: auto;
    margin-right: auto;
  }
  .music-image-wrapper {
    position: relative;
    width: 20vw;
    height: 20vw;
    display: inline-flex;
    justify-content: center;
    position: relative;
    text-align: center;
    vertical-align: middle;
    overflow: hidden;
    border-radius: 7px;
    box-shadow: 2px 4px 4px gray;
  }
  .music-image-wrapper i {
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
  .music-image {
    max-width: 20vw;
    max-height: 20vw;
  }
  .content-title {
    font-size: 2rem;
    margin-top: 4vh;
  }
  .content-artistname {
    font-size: 2rem;
    font-weight: lighter;
    padding-left: 10vw;
  }
  .content-price {
    font-size: 2rem;
    font-weight: bold;
    margin-top: 5vh;
  }
  .support-point-wrapper {
    width: 40vw;
    margin-left: auto;
    margin-right: auto;
  }
  .point-info {
    font-size: 1.3rem;
  }
  .point-wrapper {
    margin-top: 40px;
  }
  .buy-point-wrapper {
    width: 40vw;
    margin-left: auto;
    margin-right: auto;
  }
  .purchase-direct-btn {
    width: 30vw;
  }
}
hr {
  border-color: rgb(231, 64, 89) !important;
}

.purchase-direct-btn {
  color: white !important;
  border-color: rgba(0, 0, 0, 0) !important;
  background: rgb(231, 64, 89) !important;
  background: linear-gradient(
    135deg,
    rgba(231, 64, 89, 1) 0%,
    rgba(189, 100, 153, 1) 100%
  ) !important;
}
.donation-point input {
  font-size: 2rem !important;
  text-align: center !important;
}
.v-text-field__slot input {
  font-size: 2rem !important;
}
.mask {
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: black;
  padding: 0px;
  top: 0px;
  left: 0px;
  opacity: 0.4;
  z-index: 500;
}
.snackbar {
  z-index: 500;
}
</style>
