<template>
  <div v-if="value < 100" class="loading" :style="Zindex">
    <v-container class="loading-container" fill-height fluid>
      <v-col>
        <v-row justify="center" align="center">
          <v-progress-circular
            :rotate="-90"
            :size="120"
            :width="4"
            :value="value"
            color="rgb(231, 64, 89)"
          >
            {{ value }}%
          </v-progress-circular>
        </v-row>
        <v-row justify="center" align="center" class="flash animated infinite" py-5>
          <span class="title red--text" v-text="'Loading...'"></span>
        </v-row>
      </v-col>
    </v-container>
  </div>
</template>

<script>
export default {
  name: "Loading",
  model: {
    prop: "value"
  },
  props: {
    value: {
      type: [Number, String],
      required: true,
    },
    zindex: {
      type: [Number, String],
      required: false,
      default: 1000
    }
  },
  computed: {
    Zindex() {
      return {
        "--z-index": Number(this.zindex)
      };
    },
  }
};
</script>

<style scoped>
.loading {
  position: fixed;
  left: 0;
  top: 0;
  --z-index: 1000;
  z-index: var(--z-index);
  min-width: 100vw;
  min-height: 100vh;
  background-color: rgba(255, 255, 255, 0.9);
}
.loading-container {
  min-width: 100vw;
  min-height: 100vh;
}
</style>
