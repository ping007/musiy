<template>
  <div class="time-input">
    <v-menu
      ref="timeMenu"
      v-model="timeMenu"
      :close-on-content-click="false"
      :nudge-right="40"
      :return-value.sync="timeStr"
      lazy
      :disabled="!isEditMode"
      transition="scale-transition"
      offset-y
      full-width
      min-width="290px"
    >
      <template v-slot:activator="{ on, attrs }">
        <v-text-field
          v-model="timeShowingStr"
          readonly
          :disabled="!isEditMode"
          :label="label"
          :rules="timeRules"
          v-bind="attrs"
          v-on="on"
        />
      </template>
      <v-time-picker
        v-model="timeStr"
        :use-seconds="useSeconds"
        format="24hr"
        scrollable
        color="rgba(231, 64, 89, 1)"
        header-color="rgba(231, 64, 89, 1)"
      >
        <v-spacer />
        <v-btn text color="rgba(231, 64, 89, 1)" @click="timeMenu = false">
          Cancel
        </v-btn>
        <v-btn text color="rgba(231, 64, 89, 1)" @click="saveTime()">OK</v-btn>
      </v-time-picker>
    </v-menu>
  </div>
</template>

<script>
import { ValidateRules } from "~/constant.js";
export default {
  name: "TimeInput",
  model: {
    prop: "targetTime",
    event: "input",
  },
  props: {
    targetTime: Date,
    label: { type: String, default: "" },
    rules: { type: Array, default: ValidateRules },
    useSeconds: Boolean,
    isEditMode: Boolean,
  },
  data() {
    return {
      datePartStr: "",
      timeMenu: false,
      timeRules: [],
    };
  },
  computed: {
    timeShowingStr: {
      get() {
        return this.timeStr;
      },
      set(val) {
        this.datePartStr = this.$moment(this.targetTime).format("YYYY-MM-DD");
        this.$moment(this.datePartStr + " " + val).toDate();
      },
    },
    timeStr: {
      get() {
        return this.$moment(this.targetTime).format(this.getTimeFormatStr());
      },
      set(val) {
        this.datePartStr = this.$moment(this.targetTime).format("YYYY-MM-DD");
        this.$emit(
          "input",
          this.$moment(this.datePartStr + " " + val).toDate()
        );
      },
    },
  },
  created() {
    this.datePartStr = this.$moment(this.targetTime).format("YYYY-MM-DD");
    this.timeShowingStr = this.$moment(this.targetTime).format(
      this.getTimeFormatStr()
    );
    this.timeRules = this.rules;
  },
  methods: {
    getTimeFormatStr() {
      return this.useSeconds ? "HH:mm:ss" : "HH:mm";
    },
    saveTime() {
      this.$refs.timeMenu.save(this.timeStr);
      this.timeShowingStr = this.$moment(this.targetTime).format(
        this.getTimeFormatStr()
      );
    },
  },
};
</script>

<style>
</style>
