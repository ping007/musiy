import { ContentAllowType } from "~/constant";
import SupportPlansService from "~/mixins/service/SupportPlansService";
export default {
  mixins: [SupportPlansService],
  data() {
    return {
      contentAllowType: ContentAllowType,
    };
  },
  methods: {
    AllowedContentsService_JudgeShowContent(
      content,
      supportedPlan,
      isFollowing
    ) {
      let result = false;
      if (parseInt(content.allowType) === this.contentAllowType.All) {
        result = content.isShow;
      } else if (
        parseInt(content.allowType) ===
        this.contentAllowType.FollowersOrSupporters
      ) {
        result =
          content.isShow &&
          (this.AllowedContentsService_JudgeFollowing(content, isFollowing) ||
            this.AllowedContentsService_JudgeAllowedContent(
              content,
              supportedPlan
            ));
      } else if (
        parseInt(content.allowType) === this.contentAllowType.Supporters
      ) {
        result =
          content.isShow &&
          this.AllowedContentsService_JudgeAllowedContent(
            content,
            supportedPlan
          );
      } else if (this.AllowedContentsService_JudgeMyContent(content)) {
        result = true;
      }
      return result;
    },
    AllowedContentsService_JudgeFollowing(content, isFollowing) {
      const user = this.$store.state.user.user;
      let result = false;
      if (user) {
        result = this.AllowedContentsService_JudgeMyContent(content)
          ? true
          : isFollowing;
      }
      return result;
    },
    AllowedContentsService_JudgeAllowedContent(content, supportedPlan) {
      const user = this.$store.state.user.user;
      let result = false;
      if (user) {
        if (this.AllowedContentsService_JudgeMyContent(content)) {
          result = true;
        } else if (supportedPlan) {
          result =
            parseInt(supportedPlan.planPrice) >=
            parseInt(content.planPrice ? content.planPrice : 0);
        } else {
          result = this.SupportPlansService_CanUseContentBySupportedPlan(
            content.userId,
            user.userId,
            content.planPrice ? content.planPrice : 0
          );
        }
      }
      return result;
    },
    AllowedContentsService_JudgeMyContent(content) {
      return this.$store.state.user.user && content
        ? this.$store.state.user.user.userId === content.userId
        : false;
    },
  },
};
