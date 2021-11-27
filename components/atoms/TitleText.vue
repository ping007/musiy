<template>
  <span
    class="title-text"
    :class="{
      bold: bold !== undefined,
      large: large !== undefined,
      small: small !== undefined,
      agent: agent !== undefined,
      link: link !== undefined,
    }"
    @click="onClickText"
    v-text="text"
  ></span>
</template>

<script>
export default {
  name: "TitleText",
  model: {
    prop: "text",
  },
  props: ["text", "bold", "large", "small", "agent", "link"],
  methods: {
    onClickText(e) {
      e.preventDefault();
      this.$emit("click");
    }
  }
};
</script>

<style scoped>
.title-text {
  font-size: 1rem;
  color: #e74059;
}
.title-text.bold {
  font-weight: bold;
}
.title-text.small {
  font-size: 0.8rem;
}
.title-text.large {
  font-size: 1.4rem;
}
.title-text.agent {
  color: rgba(63, 98, 117, 1);
}
.title-text.link {
  text-decoration: underline;
}
</style>
