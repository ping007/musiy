<template>
  <span
    :id="'viewer-' + contentId"
    v-inview:once.enter="onShowingElement"
    class="font-decoration"
  >
    <span v-text="viewsStr"></span>
  </span>
</template>

<script>
import ContentViewsDao from "~/mixins/dao/ContentViewsDao";
export default {
  name: "ViewerCounter",
  mixins: [ContentViewsDao],
  model: {
    prop: "contentId",
  },
  props: ["contentId"],
  data() {
    return {
      views: 0,
      viewsStr: "",
      isIncremented: false,
      canUpdate: true,
    };
  },
  methods: {
    async onShowingElement() {
      if (this.contentId) {
        await this.getAndIncrementViews();
      }
      this.$nextTick(function () {
        const target = document.querySelector(`#viewer-${this.contentId}`);
        const border = `${-window.innerHeight / 3}px 0px`;
        const options = { rootMargin: border };
        const io = new IntersectionObserver((entries) => {
          for (const entry of entries) {
            if (!this.canUpdate && !this.isIncremented) {
              this.ContentViewsDao_Upsertviews(this.contentId, ++this.views);
              this.isIncremented = true;
            }
            this.canUpdate = false;
          }
        }, options);
        io.observe(target);
      });
    },
    async getAndIncrementViews() {
      try {
        this.views = await this.ContentViewsDao_SelectViewsByContentId(
          this.contentId
        );
        this.viewsStr = `${this.views} views`;
      } catch (error) {
        console.error(error);
      }
    },
  },
};
</script>

<style scoped>
.font-decoration {
  color: rgba(0, 0, 0, 0.6);
  font-size: 0.875rem;
  white-space: nowrap;
}
</style>
