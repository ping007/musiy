<template>
  <v-container>
    <v-row class="pt-5 pb-10 px-8" align="center" justify="center">
      <h1
        class="msy-color-text-red default-font-family"
        v-text="username + 'さん'"
      ></h1>
      <h1 class="msy-color-text-red default-font-family">ようこそ！Musiyへ</h1>
    </v-row>
    <v-row class="logo" align="center" justify="center">
      <v-img src="/images/logo_icon.png" max-width="180" />
    </v-row>
    <v-row
      class="pt-10 pb-2 px-8 msy-color-text-dark-gray default-font-family"
      align="center"
      justify="start"
    >
      <span v-text="'登録されたメールアドレスに'"></span>
      <span v-text="'メールを送信しました。'"></span>
    </v-row>
    <v-row
      class="px-8 py-2 msy-color-text-dark-gray default-font-family"
      align="center"
      justify="start"
    >
      <span v-text="'メール内のリンクをタップして、'"></span>
      <span v-text="'アカウントを有効化してください。'"></span>
    </v-row>
    <v-row
      class="px-8 py-2 msy-color-text-dark-gray default-font-family"
      align="center"
      justify="start"
    >
      <span v-text="'メールが届かない場合は'"></span>
      <span v-text="'迷惑メールフォルダに届いている場合'"></span>
      <span v-text="'があるのでご確認ください。'"></span>
    </v-row>
    <v-row
      class="px-8 pt-10 msy-color-text-dark-gray default-font-family"
      align="center"
      justify="start"
    >
      <span v-text="'Musiyの音楽溢れる世界を'"></span>
      <span v-text="'楽しんでいただければ幸いです。'"></span>
    </v-row>
    <v-row
      class="px-8 pt-5 msy-color-text-dark-gray default-font-family"
      align="end"
      justify="end"
    >
      <span v-text="'Musiy運営より'"></span>
    </v-row>
    <!-- <v-form ref="form">
      <v-row>
        <v-text-field
          label="確認コード"
          @input="invalidCode = false"
          :rules="[rules.required, rules.confirmationCode, invalidCodeRule]"
          v-model="confirmationCode"
        ></v-text-field>
      </v-row>
    </v-form>-->
    <!-- <v-row class="pt-4 pb-5 mb-5">
      <v-btn @click="confirm" v-text="'ログイン画面へ'"></v-btn>
    </v-row>-->
  </v-container>
</template>

<script>
import { ValidateRules } from "~/constant.js";
export default {
  layout: "noHeader",
  data() {
    return {
      username: "",
      confirmationCode: "",
      rules: ValidateRules,
      invalidCode: false,
      invalidCodeRule: (val) => {
        return (
          this.invalidCode === false ||
          "確認コードが間違っています。正しいコードを入力してください。"
        );
      },
    };
  },
  created() {
    if (this.$route.params.username) {
      this.username = this.$route.params.username;
    } else {
      this.$router.push({
        name: "login",
      });
    }
  },
  methods: {
    confirm() {
      this.$router.push({
        name: "login",
        params: { mode: "edit" },
      });
    },
  },
};
</script>

<style lang="scss" scoped>
</style>
