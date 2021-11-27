<template>
  <v-dialog v-model="isOpen" :max-width="width" persistent>
    <v-card dark>
      <v-card-title class="headline justify-center msy-color-red">
        <v-icon v-if="mode === 'alert'">mdi-information-outline</v-icon>
        <v-icon v-if="mode === 'confirm'">mdi-help-circle-outline</v-icon>
        <span>{{ title }}</span>
      </v-card-title>
      <v-card-text class="text-center">
        <div class="contents">
          <slot></slot>
        </div>
      </v-card-text>
      <div v-if="actions.length > 0 || mode === 'alert' || mode === 'confirm'">
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn
            v-for="action in actions"
            :key="action.caption"
            color="primary"
            text
            @click="action.action"
          >
            {{ action.caption }}
          </v-btn>
          <v-btn
            v-if="mode === 'confirm'"
            color="primary"
            text
            @click="cancel"
          >
            CANCEL
          </v-btn>
          <v-btn
            v-if="mode === 'alert' || mode === 'confirm'"
            color="primary"
            text
            @click="ok"
          >
            OK
          </v-btn>
        </v-card-actions>
      </div>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: {
    mode: {
      // custom, alert, confirm
      type: String,
      default: "alert",
    },
    title: {
      type: String,
      default: "Hello!!"
    },
    width: {
      type: Number,
      default: 300,
    },
    actions: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      isOpen: false,
    };
  },
  methods: {
    open() {
      this.isOpen = true;
    },
    close() {
      this.isOpen = false;
    },
    cancel() {
      this.close();
      this.$emit("cancel");
    },
    ok() {
      this.close();
      this.$emit("ok");
    },
  }
};
</script>

<style lang="scss" scoped>
.contents {
  padding-top: 20px;
}
</style>
