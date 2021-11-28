export default {
  methods: {
    isUndefinedOrNull(value) {
      return !this.isNotUndefinedAndNotNull(value);
    },
    isNotUndefinedAndNotNull(value) {
      if (value === null || value === undefined) {
        return false;
      }
      return true;
    }
  }
};
