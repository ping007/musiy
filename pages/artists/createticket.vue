<template>
  <div>
    <Loading v-model="loadingValue" />
    <v-container class="artists-createticket" :fluid="true">
      <v-form v-if="broadcast" ref="form">
        <v-row class="mx-1 mb-5">
          <span
            class="title"
            v-text="
              mode === 'create' ? 'チケットを新規作成' : 'チケット情報を編集'
            "
          ></span>
        </v-row>
        <v-row class="mx-1" align="center" justify="center">
          <v-text-field
            v-model="broadcast.title"
            :rules="[rules.required]"
            label="チケット名称"
            @change="hasChanges = true"
          />
        </v-row>
        <v-row class="mx-1">
          <span>チケット画像</span>
          <UploadImageFile
            :image-id="broadcast.imageId"
            @uploaded="setImageObj"
          />
        </v-row>
        <v-row class="mx-1" align="center" justify="space-between">
          <DateInputItem
            v-model="broadcast.broadcastDate"
            :rules="[rules.required]"
            :label="'配信日時'"
            :is-edit-mode="mode === 'create'"
          />

          <TimeInputItem
            v-model="broadcast.broadcastTime"
            :label="''"
            :rules="[rules.required]"
            :use-seconds="false"
            :is-edit-mode="mode === 'create'"
          />
        </v-row>
        <v-row class="mx-1" align="center" justify="center">
          <v-text-field
            v-model="broadcast.performers"
            :rules="[rules.required]"
            label="出演者"
            @change="hasChanges = true"
          />
        </v-row>
        <v-row class="mx-1" align="center" justify="center">
          <v-textarea
            v-model="broadcast.description"
            :rules="[rules.required]"
            label="配信内容"
            @change="hasChanges = true"
          />
        </v-row>
        <v-row class="ma-2" justify="center" align="center">
          <div
            class="msy-color-text-red"
            v-text="'※販売価格は一度チケットを作成した後は変更できません'"
          ></div>
        </v-row>
        <v-row class="mx-1" align="center" justify="center">
          <v-text-field
            v-model="broadcast.price"
            :rules="getPriceRules"
            label="販売価格"
            type="tel"
            min="0"
            clearable
            :disabled="mode !== 'create'"
            :suffix="'円'"
            onpaste="return false;"
            autocomplete="off"
            @change="hasChanges = true"
            @keypress="validateNumOnly"
            @keyup="applyCurrencyRule(broadcast.price)"
          />
        </v-row>
        <v-row class="ma-2" justify="center" align="center">
          <div
            class="msy-color-text-red"
            v-text="'※公開範囲は一度チケットを作成した後は変更できません'"
          ></div>
        </v-row>
        <v-row class="mx-1">
          <ContentAllowSelect
            ref="contentAllowSelect"
            :rules="[rules.required]"
            :plans="plans"
            :disabled="mode !== 'create'"
            :selected-allow-type="parseInt(broadcast.allowType)"
            :selected-plan-id-already="selectedPlanId"
            @change="hasChanges = true"
            @allow-type="
              (data) => {
                selectedAllowType = data;
              }
            "
            @plan-selected="
              (data) => {
                selectedPlan = data;
              }
            "
          />
        </v-row>
        <v-row class="mx-1">
          <v-checkbox
            v-model="sendMailCheck"
            :label="`プラン対象者に通知のメールを送る`"
          />
        </v-row>
        <v-row class="mx-1 py-5 my-5">
          <v-btn
            v-if="mode === 'create'"
            block
            dark
            class="msy-color-red"
            large
            @click="execSave"
            v-text="'作成する'"
          />
          <v-btn
            v-if="mode === 'edit'"
            block
            dark
            class="msy-color-red"
            large
            @click="execSave"
            v-text="'変更を保存する'"
          />
        </v-row>
      </v-form>
    </v-container>
    <v-snackbar
      v-model="isShowSuccessSnackbar"
      top
      :multi-line="true"
      :color="'success'"
      :timeout="3000"
    >
      <span v-text="successStr"></span>
    </v-snackbar>
    <v-snackbar
      v-model="isShowErrorSnackbar"
      top
      :multi-line="true"
      :color="'error'"
      :timeout="3000"
    >
      <span v-text="errorStr"></span>
    </v-snackbar>
    <PreventUnload :when="hasChanges" />
  </div>
</template>

<script>
import PreventUnload from "vue-prevent-unload";
import Loading from "~/components/molecules/Loading";
import UploadImageFile from "~/components/molecules/UploadImageFile";
import ContentAllowSelect from "~/components/molecules/ContentAllowSelect";
import DateInputItem from "~/components/atoms/DateInputItem";
import TimeInputItem from "~/components/atoms/TimeInputItem";
import { ValidateRules, ContentAllowType, CacheKeys } from "~/constant.js";
import NotificationsService from "~/mixins/service/NotificationsService";
import ImagefluxConnectionService from "~/mixins/service/ImagefluxConnectionService";
import BroadcastsDao from "~/mixins/dao/BroadcastsDao";
import PlansDao from "~/mixins/dao/PlansDao";
import AllowedContentsDao from "~/mixins/dao/AllowedContentsDao";
import SupportersDao from "~/mixins/dao/SupportersDao";
import LocalStorageService from "~/mixins/service/LocalStorageService";

export default {
  layout: "artist",
  components: {
    PreventUnload,
    Loading,
    UploadImageFile,
    ContentAllowSelect,
    DateInputItem,
    TimeInputItem,
  },
  mixins: [
    NotificationsService,
    ImagefluxConnectionService,
    LocalStorageService,
    BroadcastsDao,
    PlansDao,
    AllowedContentsDao,
    SupportersDao,
  ],
  data() {
    return {
      mode: "create",
      rules: ValidateRules,
      hasChanges: false,
      broadcast: undefined,
      loadingValue: 0,
      plans: [],
      selectedPlan: undefined,
      selectedPlanId: undefined,
      selectedAllowType: ContentAllowType.All,
      isShowSuccessSnackbar: false,
      successStr: "",
      isShowErrorSnackbar: false,
      errorStr: "",
      sendMailCheck: false,
      cacheKeys: CacheKeys,
    };
  },
  computed: {
    isArrowZeroPrice() {
      return this.selectedAllowType === ContentAllowType.Supporters;
    },
    getPriceRules() {
      let result = [
        this.rules.number,
        this.rules.minValue(parseInt(this.broadcast.price), 100),
        this.rules.maxValue(parseInt(this.broadcast.price), 1000000),
      ];
      if (this.isArrowZeroPrice) {
        result = [
          this.rules.number,
          this.rules.maxValue(parseInt(this.broadcast.price), 1000000),
        ];
      }
      return result;
    },
  },
  async created() {
    const broadcast = this.$route.params.broadcast;
    if (broadcast) {
      this.broadcast = broadcast;
      this.mode = "edit";
      this.broadcast.broadcastDate = this.$moment(
        this.broadcast.broadcastDatetime
      ).toDate();
      this.broadcast.broadcastTime = this.$moment(
        this.broadcast.broadcastDatetime
      ).toDate();
      this.broadcast.performers = this.broadcast.artists;
      this.broadcast.description = this.broadcast.explanation;
      this.broadcast.price = this.broadcast.fee ? this.broadcast.fee : 0;
    }
    if (!this.broadcast) {
      this.initTicketObj();
    }
    await this.loadPlans();
    await this.loadSelectedPlan();
    if (this.selectedPlanId) {
      this.execSelectedPlan();
    }
    const user = this.$store.state.user.user;
    this.sendMailCheck = this.LocalStorageService_FetchFromLocalStorageByUser(
      this.cacheKeys.sendMailCheckCreateTicketCacheKeyPrefix,
      user.userId
    );
    this.loadingValue = 100;
  },
  methods: {
    initTicketObj() {
      this.broadcast = {
        broadcastId: undefined,
        imageId: undefined,
        title: "",
        artistId: undefined,
        artistImageId: undefined,
        artistName: undefined,
        broadcastDate: this.$moment().toDate(),
        broadcastTime: this.$moment().toDate(),
        broadcastDatetime: undefined,
        price: 0,
        allowType: ContentAllowType.All,
        performers: "",
        description: "",
        status: 0,
        isPurchased: false,
      };
    },
    setImageObj(imageObject) {
      this.broadcast.imageId = imageObject.imageId;
      this.hasChanges = true;
    },
    async loadPlans() {
      const user = this.$store.state.user.user;
      if (user) {
        const artistUserId = user.userId;
        this.plans = await this.PlansDao_SelectPlansByUserId(artistUserId);
      }
    },
    async loadSelectedPlan() {
      if (this.broadcast) {
        const contentId = this.broadcast.broadcastId;
        const selectedPlan =
          await this.AllowedContentsDao_SelectAllowedContentByContentId(
            contentId
          );
        this.selectedPlanId = selectedPlan.planId
          ? selectedPlan.planId
          : undefined;
      }
    },
    async execSave() {
      if (this.$refs.form.validate()) {
        await this.saveTicket();
      } else {
        this.isShowErrorSnackbar = true;
        this.errorStr = "入力値が不正です。確認してください";
      }
    },
    async saveTicket() {
      this.loadingValue = 0;
      const user = this.$store.state.user.user;

      const fee = this.broadcast.price;
      const title = this.broadcast.title;
      const dateStr = this.$moment(this.broadcast.broadcastDate).format(
        "YYYY-MM-DD"
      );
      const timeStr = this.$moment(this.broadcast.broadcastTime).format(
        "HH:mm"
      );
      this.broadcast.broadcastDatetime = this.$moment(
        dateStr + " " + timeStr
      ).format("YYYY-MM-DD HH:mm:ss");
      const broadcastDatetime = this.broadcast.broadcastDatetime;
      const explanation = this.broadcast.description;
      const imageId = this.broadcast.imageId;
      const artists = this.broadcast.performers;
      const allowType = this.selectedAllowType;
      const datetimeStr = this.$moment(dateStr + " " + timeStr).format(
        "YYYY年MM月DD日 HH時mm分"
      );
      const sendMailCheck = this.sendMailCheck;
      this.LocalStorageService_StoreToLocalStorageByUser(
        this.cacheKeys.sendMailCheckCreateTicketCacheKeyPrefix,
        user.userId,
        this.sendMailCheck
      );
      try {
        let sqlResult;
        this.loadingValue = 40;
        if (this.mode === "create") {
          const broadcastId = this.$uuid.v4();
          const imagefluxChannelInfo =
            await this.ImagefluxConnectionService_createChannel();
          const imagefluxChannelInfoStr = JSON.stringify(imagefluxChannelInfo);
          // const imagefluxChannelInfoStr = null;
          sqlResult = await this.BroadcastsDao_InsertBroadcast(
            broadcastId,
            fee,
            title,
            broadcastDatetime,
            explanation,
            imageId,
            artists,
            allowType,
            imagefluxChannelInfoStr
          );
          await this.saveAllowedContent(broadcastId);
          this.loadingValue = 70;
          await this.NotificationsService_addNewTicketNotification(
            user,
            datetimeStr,
            this.broadcast.title,
            imageId
          );
          this.loadingValue = 80;
          if (sendMailCheck && this.selectedPlan && this.selectedPlan.planId) {
            await this.SupportersDao_SendMailWhenContentUploadByPlanId(
              this.selectedPlan.planId,
              broadcastId,
              "broadcast"
            );
          }
          this.loadingValue = 100;
        } else {
          sqlResult = await this.BroadcastsDao_UpdateBroadcast(
            this.broadcast.broadcastId,
            title,
            broadcastDatetime,
            explanation,
            imageId,
            artists
          );
          this.loadingValue = 70;
          await this.NotificationsService_updateTicketNotification(
            user,
            datetimeStr,
            this.broadcast.title,
            imageId
          );
          this.loadingValue = 80;
          if (sendMailCheck && this.selectedPlan && this.selectedPlan.planId) {
            await this.SupportersDao_SendMailWhenContentUploadByPlanId(
              this.selectedPlan.planId,
              this.broadcast.broadcastId,
              "broadcast"
            );
          }
          this.loadingValue = 100;
        }
        this.hasChanges = false;
        this.isShowSuccessSnackbar = true;
        this.successStr =
          this.mode === "create"
            ? "チケットの作成が完了しました。メインページへ戻ります"
            : "チケットの更新が完了しました。メインページへ戻ります";
        setTimeout(() => {
          this.toArtistMainPage();
        }, 2000);
      } catch (error) {
        console.error(error);
        this.loadingValue = 100;
        this.isShowErrorSnackbar = true;
        this.errorStr =
          this.mode === "create"
            ? "チケットの作成に失敗しました"
            : "チケットの更新に失敗しました";
      }
    },
    async saveAllowedContent(contentId) {
      const allowPlanId = this.selectedPlan
        ? this.selectedPlan.planId
        : undefined;
      const allowPlanName = this.selectedPlan
        ? this.selectedPlan.planName
        : undefined;
      const allowPlanPrice = this.selectedPlan
        ? parseInt(this.selectedPlan.planPrice)
        : 0;
      if (allowPlanId) {
        await this.AllowedContentsDao_UpsertAllowedContent(
          contentId,
          allowPlanId,
          allowPlanName,
          allowPlanPrice
        );
      }
    },
    toArtistMainPage() {
      const user = this.$store.state.user.user;
      this.$router.push({
        name: "artists-main",
        params: { artistId: user.userId },
        query: { tab: "tab-broadcasts" },
      });
    },
    validateNumOnly(e) {
      const charCode = e.which ? e.which : e.keyCode;
      if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        e.preventDefault();
      }
    },
    applyCurrencyRule(points) {
      this.broadcast.price = parseInt(String(points) || "0");
    },
    execSelectedPlan() {
      this.$refs.contentAllowSelect.selectedPlan();
    },
  },
};
</script>

<style lang="scss" scoped>
.artists-createticket {
  margin-bottom: 64px;
}
</style>
