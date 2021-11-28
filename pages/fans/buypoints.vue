<template>
  <v-container class="fans-buypoints" fluid>
    <v-row class="mx-1">
      <span
        class="title"
        v-text="'購入するポイント数を選択してください'"
      ></span>
    </v-row>
    <v-row class="mx-1">
      <span
        class="body-2"
        v-text="'１ポイント１円として100ポイント以上から購入できます'"
      ></span>
    </v-row>
    <v-row class="mt-5 py-5 mx-1">
      <span v-text="'所持ポイント：'"></span>
      <span v-text="totalPoints + 'P'"></span>
    </v-row>
    <v-form ref="form">
      <v-row class="mx-1">
        <v-text-field
          v-model="points"
          class="point-input-field"
          type="tel"
          min="0"
          clearable
          label="購入ポイント数"
          :suffix="'P'"
          :rules="[rules.validateSupportPoint, rules.maxValue(points, 100000)]"
          onpaste="return false;"
          autocomplete="off"
          @keypress="validateNumOnly"
          @keyup="applyPointRule(points)"
        />
      </v-row>
    </v-form>
    <v-row class="mx-1" align="center" justify="center">
      <span v-text="'※ポイント数は手入力で変更することもできます'"></span>
    </v-row>
    <v-row justify="center" align="center" class="mx-1">
      <v-col>
        <v-btn
          color="brown lighten-4"
          block
          @click="points = 1000"
          v-text="'1000P'"
        />
      </v-col>
      <v-col>
        <v-btn
          color="blue-grey lighten-4"
          block
          @click="points = 3000"
          v-text="'3000P'"
        />
      </v-col>
      <v-col>
        <v-btn
          color="amber lighten-2"
          block
          @click="points = 5000"
          v-text="'5000P'"
        />
      </v-col>
    </v-row>
    <v-row class="mx-1 py-5 mb-5">
      <v-btn
        :disabled="!points || points === '' || parseInt(points) <= 0"
        block
        dark
        class="msy-color-red"
        large
        @click="execBuyPoints"
        v-text="'購入する'"
      />
    </v-row>
  </v-container>
</template>

<script>
import PointsDao from "~/mixins/dao/PointsDao";
import { ValidateRules } from "~/constant.js";
export default {
  mixins: [PointsDao],
  data() {
    return {
      rules: ValidateRules,
      pointContent: {},
      points: 0,
      totalPoints: 0,
    };
  },
  async mounted() {
    await this.loadCurrentTotalPoints();
  },
  methods: {
    async loadCurrentTotalPoints() {
      const user = this.$store.state.user.user;
      if (user) {
        try {
          const points = await this.PointsDao_SelectPointsByUserId(user.userId);
          if (points && points[0]) {
            this.totalPoints = parseInt(points[0].totalPoints);
          }
        } catch (error) {
          console.error(error);
        }
      } else {
        this.$router.push({
          name: "fans-main",
        });
      }
    },
    execBuyPoints() {
      if (this.$refs.form && this.$refs.form.validate()) {
        this.pointContent = {
          imageUrl: "/images/coin.png",
          title: "ポイント購入：" + this.points + "P",
          price: this.points,
        };
        this.$router.push({
          name: "fans-purchase",
          params: {
            content: this.pointContent,
            isMovie: false,
            isMusic: false,
            isPoint: true,
            isPlan: false,
            isTicket: false,
          },
        });
      }
    },
    validateNumOnly(e) {
      const charCode = e.which ? e.which : e.keyCode;
      if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        e.preventDefault();
      }
    },
    applyPointRule(points) {
      this.points = parseInt(String(points) || "0");
    },
  },
};
</script>
<style>
.v-input.point-input-field input {
  text-align: right !important;
}
</style>
<style lang="scss" scoped>
.fans-buypoints {
  margin: 0 0 56px;
}
</style>
