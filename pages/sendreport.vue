<template>
  <div>
    <v-container fluid>
      <v-form ref="form">
        <v-row class="mx-2">
          <v-text-field
            v-model="contentId"
            type="input"
            disabled
            :rules="[rules.required]"
            label="違反コンテンツID"
          />
        </v-row>
        <v-row class="mx-2">
          <v-text-field
            v-model="contentType"
            type="input"
            disabled
            :rules="[rules.required]"
            label="違反コンテンツタイプ"
          />
        </v-row>
        <v-row class="mx-2">
          <v-text-field
            v-model="userId"
            type="input"
            disabled
            :rules="[rules.required]"
            label="報告ユーザーID"
          />
        </v-row>
        <v-row class="mx-2">
          <v-select
            v-model="reportType"
            :rules="[rules.required]"
            item-text="label"
            item-value="val"
            :items="reportTypeItems"
            label="報告内容を選択してください"
          />
        </v-row>
        <v-row class="mx-2">
          <v-textarea
            v-model="reportTemplateText"
            :rules="[rules.required, isEdited]"
            outlined
            label="報告の詳細を記入してください"
          />
        </v-row>
      </v-form>
      <v-row class="mx-2">
        <v-col class="text-center">
          <v-btn
            block
            large
            dark
            class="msy-color-red"
            @click="execSaveReport"
            v-text="'違反報告する'"
          />
        </v-col>
      </v-row>
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
  </div>
</template>

<script>
import { ValidateRules } from "~/constant.js";
export default {
  data() {
    return {
      contentId: "",
      contentType: "",
      userId: "",
      rules: ValidateRules,
      reportType: 0,
      reportTypeItems: [
        { label: "自身の創作物が無断転載されている", val: 1 },
        { label: "著作物（楽曲）が無断で使用されている", val: 2 },
        { label: "著作物（画像）が無断で使用されている", val: 3 },
        { label: "その他", val: 99 },
      ],
      templateTexts: {
        1: "無断転載されている創作物の詳細（元URL等）：",
        2: "無断使用されている著作物の詳細（元URL等）：",
        3: "無断使用されている著作物の詳細（元URL等）：",
        99: "報告の詳細な内容：",
      },
      isShowSuccessSnackbar: false,
      successStr: "",
      isShowErrorSnackbar: false,
      errorStr: "",
      currentTemplateText: "",
      isEdited: (value) => {
        return this.currentTemplateText !== value || "入力必須項目です。";
      },
    };
  },
  computed: {
    reportTemplateText: {
      get() {
        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
        this.currentTemplateText = this.templateTexts[this.reportType];
        return this.templateTexts[this.reportType];
      },
      set(value) {},
    },
  },
  created() {
    const contentId = this.$route.params.contentId;
    if (!contentId) {
      this.$router.push({ name: "fans-main" });
    } else {
      this.userId = this.$store.state.user.user.userId;
      this.contentId = contentId;
      this.contentType = this.$route.params.contentType;
    }
  },
  methods: {
    execSaveReport() {
      try {
        if (this.$refs.form.validate()) {
          this.isShowSuccessSnackbar = true;
          this.successStr = "違反報告を行いました";
          setTimeout(() => {
            this.$router.push({
              name: "fans-main",
            });
          }, 3000);
        } else {
          this.isShowErrorSnackbar = true;
          this.errorStr = "入力値が不正です。確認してください";
        }
      } catch (error) {
        this.isShowErrorSnackbar = true;
        this.errorStr = "違反報告の送信に失敗しました";
      }
    },
  },
};
</script>

<style lang="scss" scoped>
</style>
