<template>
  <div>
    <v-menu
      v-model="menu"
      :close-on-content-click="false"
      :nudge-right="40"
      transition="scale-transition"
      offset-y
      min-width="290px"
    >
      <template v-slot:activator="{ on }">
        <v-text-field
          v-model="dateStrToShow"
          :label="label"
          :rules="rules"
          readonly
          :disabled="!isEditMode"
          v-on="isEditMode ? on : null"
        />
      </template>
      <v-date-picker
        v-model="dateStr"
        :disabled="!isEditMode"
        locale="ja-jp"
        scrollable
        color="rgba(231, 64, 89, 1)"
        header-color="rgba(231, 64, 89, 1)"
        :day-format="date => new Date(date).getDate()"
        @input="menu = false"
      />
    </v-menu>
  </div>
</template>

<script>
export default {
  model: {
    prop: "dateValue",
    event: "input",
  },
  props: ["label", "dateValue", "rules", "isEditMode", "isUseDefaultVal"],
  data() {
    return {
      formatStr: "YYYY年MM月DD日",
      menu: false,
      dateValue_: this.dateValue
        ? this.$moment(this.dateValue).format("YYYY-MM-DD")
        : this.dateStr,
    };
  },
  computed: {
    dateStrToShow: {
      get() {
        return this.$moment(this.dateStr).format("YYYY年MM月DD日");
      },
      set(val) {
        this.$moment(val).toDate();
      },
    },
    dateStr: {
      get() {
        let str = this.$moment().format("YYYY-MM-DD");
        if (this.dateValue_) {
          str = this.$moment(this.dateValue_).format("YYYY-MM-DD");
        }
        return str;
      },
      set(val) {
        this.dateValue_ = this.$moment(val).format("YYYY-MM-DD");
        this.$emit("input", this.$moment(val).toDate());
      },
    },
  },
};
</script>

<style scoped>
</style>
