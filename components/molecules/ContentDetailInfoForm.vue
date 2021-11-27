<template>
  <div>
    <v-row class="mx-1">
      <v-text-field
        v-model="startSeconds_"
        type="number"
        :rules="[rules.onlyZeroAndPositiveNumber]"
        postfix="秒"
        min="0"
        label="再生開始秒数"
        hint="設定された秒数から45秒間が試聴可能になります。"
        @change="$emit('changed')"
      />
    </v-row>
    <v-row class="mx-1">
      <v-text-field
        v-model="title_"
        :rules="[rules.required]"
        label="タイトル"
        @change="$emit('changed')"
      />
    </v-row>
    <v-row class="mx-1">
      <v-textarea
        v-model="description_"
        label="コンテンツの説明"
        @change="$emit('changed')"
      />
    </v-row>
    <v-row class="mx-1">
      <GenreSelectBox
        v-model="genre_"
        :label="'コンテンツの音楽ジャンル'"
        :rules="[rules.required]"
        @change="$emit('changed')"
      />
    </v-row>
    <v-row class="pt-5 mx-1">
      <span class="title" v-text="'楽曲情報'"></span>
    </v-row>
    <v-row class="mx-1">
      <p
        v-text="
          'アップロードされるファイルに含まれる楽曲の情報（複数可）を登録します'
        "
      ></p>
    </v-row>
    <div>
      <v-card
        v-for="(musicDetail, idx) in musicDetails_"
        :key="musicDetail.musicDetailId"
        class="my-4 pa-2"
      >
        <v-row class="mx-1 my-4">
          <span class="title" v-text="'楽曲' + String(idx + 1)"></span>
          <v-spacer />
          <ContentMenus
            :items="contentItems()"
            @delete="deleteMusicDetail(musicDetail)"
          />
        </v-row>
        <v-row class="mx-1">
          <v-text-field
            v-model="musicDetail.musicDetailTitle"
            :rules="[rules.required]"
            label="曲名"
            @change="$emit('changed')"
          />
        </v-row>
        <v-row class="mx-1">
          <v-textarea
            v-model="musicDetail.musicDetailDescription"
            label="楽曲の説明"
            @change="$emit('changed')"
          />
        </v-row>
        <v-row class="mx-1">
          <v-select
            v-model="musicDetail.copyrightType"
            :rules="[rules.required]"
            item-text="label"
            item-value="value"
            :items="copyrightItems"
            label="著作権登録情報"
            @change="$emit('changed')"
          />
        </v-row>
        <v-row class="mx-1">
          <v-text-field
            v-model="musicDetail.copyrightCode"
            label="著作権登録コード"
            @change="$emit('changed')"
          />
        </v-row>
        <v-row class="mx-1">
          <v-text-field
            v-model="musicDetail.composer"
            :rules="
              musicDetail.copyrightType !== 'original' ? [rules.required] : []
            "
            label="作曲者"
            @change="$emit('changed')"
          />
        </v-row>
        <v-row class="mx-1">
          <v-text-field
            v-model="musicDetail.arranger"
            :rules="
              musicDetail.copyrightType !== 'original' ? [rules.required] : []
            "
            label="編曲者"
            @change="$emit('changed')"
          />
        </v-row>
        <v-row class="mx-1">
          <v-text-field
            v-model="musicDetail.lyricist"
            :rules="
              musicDetail.copyrightType !== 'original' ? [rules.required] : []
            "
            label="作詞者"
            @change="$emit('changed')"
          />
        </v-row>
      </v-card>
      <v-row justify="center" align="center" class="my-5 mx-1">
        <v-btn
          color="success"
          block
          @click="addMusicDetail"
          v-text="'楽曲情報を追加する'"
        />
      </v-row>
      <v-row class="pt-5 mx-1">
        <span class="title" v-text="'価格と公開の設定'"></span>
      </v-row>
      <v-row class="mx-1">
        <p
          v-text="'コンテンツの価格や公開範囲、即時公開の設定などを行います'"
        ></p>
      </v-row>
    </div>
    <v-row class="mx-1">
      <v-text-field
        v-model="price_"
        type="tel"
        :rules="getPriceRules"
        prefix="¥"
        :min="0"
        label="コンテンツ販売価格"
        onpaste="return false;"
        autocomplete="off"
        @change="$emit('changed')"
        @keypress="validateNumOnly"
        @keyup="applyCurrencyRule(parseInt(price_))"
      />
    </v-row>
    <v-row class="mx-0 mb-2 grey--text text--darken-2 price-calc-text">
      <span v-text="'販売価格:¥' + price_ + ' ＝ '"></span>
      <span
        v-text="'販売手数料:¥' + Math.round(price_ * marginValue) + ' ＋ '"
      ></span>
      <span
        v-text="'受取金額:¥' + Math.round(price_ * (1 - marginValue))"
      ></span>
    </v-row>
    <v-row justify="center" align="center" class="mx-1">
      <v-col>
        <v-btn
          color="brown lighten-4"
          block
          @click="price_ = 100"
          v-text="'¥100'"
        />
      </v-col>
      <v-col>
        <v-btn
          color="blue-grey lighten-4"
          block
          @click="price_ = 300"
          v-text="'¥300'"
        />
      </v-col>
      <v-col>
        <v-btn
          color="amber lighten-2"
          block
          @click="price_ = 500"
          v-text="'¥500'"
        />
      </v-col>
    </v-row>
    <v-snackbar
      v-model="isShowErrorSnackbar"
      top
      :multi-line="true"
      :color="'error'"
      :timeout="3000"
    >
      <span v-text="errorStr"></span>
    </v-snackbar>
    <Dialog
      ref="deleteConfirm"
      mode="confirm"
      title="削除の確認"
      @ok="execDeleteMusicDetail"
      @cancel="deleteTargetMusicDetail = undefined"
    >
      <p>{{ deleteConfirmText }}</p>
    </Dialog>
  </div>
</template>

<script>
import { ValidateRules, CopyrightItems } from "~/constant.js";
import GenreSelectBox from "~/components/atoms/GenreSelectBox";
import ContentMenus from "~/components/atoms/ContentMenus";
import Dialog from "~/components/molecules/Dialog";
export default {
  components: {
    GenreSelectBox,
    ContentMenus,
    Dialog,
  },
  props: {
    title: {
      type: String,
      default: undefined,
    },
    description: {
      type: String,
      default: undefined,
    },
    genre: {
      default: undefined,
    },
    price: {
      type: Number,
      default: 0,
    },
    startSeconds: {
      type: Number,
      default: 0,
    },
    musicDetails: {
      type: Array,
      default: undefined,
    },
    isArrowZeroPrice: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      rules: ValidateRules,
      copyrightItems: CopyrightItems,
      marginValue: 0.3, // 販売手数料
      isShowErrorSnackbar: false,
      errorStr: "",
      title_: undefined,
      description_: undefined,
      genre_: undefined,
      price_: undefined,
      startSeconds_: undefined,
      musicDetails_: undefined,
      deletedMusicDetails_: [],
      deleteConfirmText: "",
      deleteTargetMusicDetail: undefined,
    };
  },
  computed: {
    getPriceRules() {
      let result = [
        this.rules.number,
        this.rules.minValue(parseInt(this.price_), 100),
        this.rules.maxValue(parseInt(this.price_), 1000000),
      ];
      if (this.isArrowZeroPrice) {
        result = [
          this.rules.number,
          this.rules.maxValue(parseInt(this.price_), 1000000),
        ];
      }
      return result;
    },
  },
  watch: {
    title_(newValue) {
      this.title_ = newValue;
      this.$emit("update:title", this.title_);
    },
    description_(newValue) {
      this.description_ = newValue;
      this.$emit("update:description", this.description_);
    },
    genre_: {
      handler(newValue, oldVal) {
        this.genre_ = newValue;
//        this.$emit("update:music-details", this.genre_);
        this.$emit("update:genre", this.genre_);
      },
      deep: true,
    },
    price_(newValue) {
      this.price_ = parseInt(newValue || 0);
      this.$emit("update:price", this.price_);
    },
    startSeconds_(newValue) {
      this.startSeconds_ = newValue;
      this.$emit("update:start-seconds", this.startSeconds_);
    },
    musicDetails_: {
      handler(newValue, oldVal) {
        this.musicDetails_ = newValue;
        this.$emit("update:music-details", this.musicDetails_);
      },
      deep: true,
    },
    musicDetails: {
      handler(newValue, oldVal) {
        this.musicDetails_ = newValue;
      },
      deep: true,
    },
  },
  created() {
    this.title_ = this.title;
    this.description_ = this.description;
    this.genre_ = this.genre;
    this.price_ = this.price;
    this.startSeconds_ = this.startSeconds;
    this.musicDetails_ = this.musicDetails;
    this.deletedMusicDetails_ = [];
  },
  methods: {
    initMusicDetail() {
      return {
        musicDetailId: this.$uuid.v4(),
        parentContentId: "",
        musicDetailTitle: "",
        musicDetailDescription: "",
        copyrightType: "",
        copyrightCode: "",
        composer: "",
        arranger: "",
        lyricist: "",
      };
    },
    contentItems() {
      return [{ value: "delete", icon: "mdi-trash-can", title: "楽曲を削除" }];
    },
    deleteMusicDetail(musicDetail) {
      if (this.musicDetails_.length > 1) {
        this.deleteConfirmText = `${
          musicDetail.musicDetailTitle !== ""
            ? "曲名：" + musicDetail.musicDetailTitle
            : "こ"
        }の楽曲情報を削除します。よろしいですか？`;
        this.deleteTargetMusicDetail = musicDetail;
        this.$refs.deleteConfirm.open();
      } else {
        this.isShowErrorSnackbar = true;
        this.errorStr = "楽曲情報は０件にできません";
      }
    },
    execDeleteMusicDetail() {
      if (this.deleteTargetMusicDetail) {
        this.deletedMusicDetails_.push(this.deleteTargetMusicDetail);
        this.$emit("update:deleted-music-details", this.deletedMusicDetails_);
        const filteredArray = this.musicDetails_.filter((element) => {
          return (
            element.musicDetailId !== this.deleteTargetMusicDetail.musicDetailId
          );
        });
        console.log(("filteredArray", filteredArray));
        this.musicDetails_ = filteredArray;
        this.deleteTargetMusicDetail = undefined;
      }
    },
    addMusicDetail() {
      if (!this.musicDetails_) {
        this.musicDetails_ = [];
      }
      this.musicDetails_.push(this.initMusicDetail());
    },
    validateNumOnly(e) {
      const charCode = e.which ? e.which : e.keyCode;
      if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        e.preventDefault();
      }
    },
    applyCurrencyRule(points) {
      this.price_ = parseInt(String(points) || 0);
    },
  },
};
</script>

<style lang="scss" scoped>
.price-calc-text {
  font-size: 0.8rem;
}
</style>
