import EmptyValUtils from "~/mixins/util/EmptyValUtils";

export default {
  mixins: [EmptyValUtils],
  methods: {
    LocalStorageService_StoreToLocalStorage(key, value, toCacheModelsCallback) {
      if (this.isUndefinedOrNull(key) || this.isUndefinedOrNull(value)) {
        return;
      }
      const cacheModel = this.isNotUndefinedAndNotNull(toCacheModelsCallback)
        ? toCacheModelsCallback(value)
        : value;
      localStorage.setItem(key, JSON.stringify(cacheModel));
    },
    LocalStorageService_StoreToLocalStorageByUser(
      keyPrefix,
      userId,
      value,
      toCacheModelsCallback
    ) {
      if (this.isUndefinedOrNull(keyPrefix) || this.isUndefinedOrNull(userId)) {
        return;
      }
      const key = this.LocalStorageService_GenerateKeyForEachUser(
        keyPrefix,
        userId
      );
      this.LocalStorageService_StoreToLocalStorage(
        key,
        value,
        toCacheModelsCallback
      );
    },
    LocalStorageService_FetchFromLocalStorage(key) {
      if (this.isUndefinedOrNull(key)) {
        return null;
      }
      const cache = localStorage.getItem(key);
      if (this.isUndefinedOrNull(cache)) {
        return null;
      }
      return JSON.parse(cache);
    },
    LocalStorageService_FetchFromLocalStorageByUser(keyPrefix, userId) {
      if (this.isUndefinedOrNull(keyPrefix) || this.isUndefinedOrNull(userId)) {
        return;
      }
      const key = this.LocalStorageService_GenerateKeyForEachUser(
        keyPrefix,
        userId
      );
      return this.LocalStorageService_FetchFromLocalStorage(key);
    },
    LocalStorageService_GenerateKeyForEachUser(keyPrefix, userId) {
      return keyPrefix + "_" + userId;
    },
  },
};
