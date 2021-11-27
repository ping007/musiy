<template>
  <div>
    <v-dialog v-if="user" v-model="isShowRegisterDialog" persistent width="500">
      <v-card>
        <v-card-title class="headline msy-color-red" primary-title>
          <span class="msy-color-text-white" v-text="'アーティスト登録'"></span>
          <v-icon
            class="close-icon"
            @click="(isShowRegisterDialog = false), $emit('close')"
          >
            mdi-close
          </v-icon>
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col>
              <v-row align="center" justify="center">
                <v-checkbox v-model="isConfirmTermAndPolicy" />
                <div class="ml-5">
                  <TitleText
                    link
                    small
                    @click="$router.push({ name: 'terms-of-artist' })"
                    v-text="'アーティスト利用規約'"
                  />
                  <TitleText small v-text="'に同意する'" />
                </div>
              </v-row>
            </v-col>
          </v-row>
          <v-row class="mt-4 py-4 body-1">
            <span
              v-text="'上記規約に同意してアーティストとして登録しますか？'"
            ></span>
          </v-row>
          <!-- <v-row class="py-2 body-2">
            <span
              v-text="
                '※2週間の無料トライアル期間後に以下よりプランを選ぶ形となります。'
              "
            ></span>
          </v-row>
          <v-row class="py-2 body-1">
            <span
              v-text="
                '①無料使用（コンテンツ編集機能なし）：コンテンツ販売手数料25％。'
              "
            ></span>
          </v-row> -->
          <!-- <v-row class="py-2 body-1">
            <span
              v-text="
                '②編集機能あり：980円（月額課金）。コンテンツ販売手数料20％'
              "
            ></span>
          </v-row> -->
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn
            class="my-4 mx-2 msy-color-red"
            dark
            @click="execArtistRegistration"
          >
            <v-icon> mdi-music </v-icon>
            <span v-text="'アーティストとして登録する'"></span>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
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
import UsersDao from "~/mixins/dao/UsersDao";
import TitleText from "~/components/atoms/TitleText";
export default {
  components: {
    TitleText,
  },
  mixins: [UsersDao],
  props: ["isShow"],
  data() {
    return {
      isShowRegisterDialog: this.isShow,
      user: undefined,
      isConfirmTermAndPolicy: false,
      isShowErrorSnackbar: false,
      errorStr: "",
    };
  },
  watch: {
    isShow(newValue, oldValue) {
      this.isShowRegisterDialog = newValue;
    },
  },
  created() {
    const user = this.$store.state.user.user;
    if (user) {
      this.user = user;
    }
  },

  methods: {
    async execArtistRegistration() {
      if (this.isConfirmTermAndPolicy) {
        try {
          await this.UsersDao_UpdateUserIsArtist(this.user.userId);
          const loginUser = await this.UsersDao_SelectUserByUserId(
            this.user.userId
          );
          this.$store.commit("user/setUser", loginUser);
          this.toArtistPage();
        } catch (error) {
          console.error(error);
          this.isShowErrorSnackbar = true;
          this.errorStr = "アーティスト登録に失敗しました";
          this.$emit("error");
        }
      } else {
        this.isShowErrorSnackbar = true;
        this.errorStr = "チェックボックスがチェックされていません";
      }
    },
    toArtistPage() {
      this.$router.push({
        name: "artists-main",
        params: { artistId: this.user.userId },
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.close-icon {
  position: absolute;
  right: 16px;
  top: 18px;
}
</style>
