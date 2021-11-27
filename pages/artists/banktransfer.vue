<template>
  <div>
    <Loading v-model="loadingValue" />
    <v-container class="artists-supporters">
      <div v-if="!isAccountInfoExists">
        <v-row class="mx-1">
          <span class="title" v-text="'振込先口座情報を登録'"></span>
        </v-row>
        <v-form ref="form">
          <v-row class="mx-2">
            <span
              class="body-2"
              v-text="'売上金の振込先を登録してください'"
            ></span>
          </v-row>
          <v-row
            class="ma-2"
            align="center"
            justify="end"
            @click="closeAccountInfoInput"
          >
            <v-icon
              v-show="loadedAccountInfo"
              size="32"
              :color="'rgb(231, 64, 89)'"
            >
              mdi-close
            </v-icon>
            <div class="msy-color-text-red" v-text="'閉じる'"></div>
          </v-row>
          <v-row class="mx-1">
            <v-col cols="8">
              <v-autocomplete
                v-model="bankInfo"
                auto-select-first
                clearable
                :rules="[rules.required]"
                label="金融機関名"
                :items="bankSearchItems"
                :loading="isBankSearchLoading"
                :search-input.sync="bankSearch"
                item-text="name"
                item-value="code"
                placeholder="金融機関名で検索"
                prepend-icon="mdi-database-search"
                return-object
                :no-data-text="'候補がありません'"
              />
            </v-col>
            <v-col cols="4">
              <v-text-field
                v-model="bankCode"
                readonly
                :rules="[rules.required]"
                type="tel"
                label="金融機関コード"
              />
            </v-col>
          </v-row>
          <v-row class="mx-1">
            <v-col cols="8">
              <v-autocomplete
                v-model="branchInfo"
                auto-select-first
                clearable
                :rules="[rules.required]"
                label="支店名"
                :items="branchSearchItems"
                :loading="isBranchSearchLoading"
                :search-input.sync="branchSearch"
                item-text="name"
                item-value="code"
                placeholder="支店名で検索"
                prepend-icon="mdi-database-search"
                return-object
                :no-data-text="'候補がありません'"
              />
            </v-col>
            <v-col cols="4">
              <v-text-field
                v-model="branchCode"
                readonly
                :rules="[rules.required]"
                type="tel"
                label="支店コード"
              />
            </v-col>
          </v-row>

          <v-row class="mx-2">
            <v-select
              v-model="accountType"
              :rules="[rules.required]"
              :items="accountTypes"
              item-text="label"
              item-value="accountTypeId"
              label="預金種別（普通/当座）"
            />
          </v-row>
          <v-row class="mx-2">
            <v-text-field
              v-model="accountNumber"
              :rules="[rules.required, rules.number]"
              type="tel"
              label="口座番号"
            />
          </v-row>
          <v-row class="mx-2">
            <v-text-field
              v-model="kanaName"
              :rules="[rules.required, rules.zenkana]"
              type="text"
              label="口座名義カナ"
            />
          </v-row>
        </v-form>
        <v-row class="mx-2">
          <v-btn
            block
            dark
            class="msy-color-red"
            large
            @click="saveAccountInfo"
            v-text="'振込先を登録する'"
          />
        </v-row>
      </div>
      <div v-else>
        <v-row class="mx-1">
          <span class="title" v-text="'振込申請'"></span>
        </v-row>
        <v-row class="mx-1">
          <span class="body-2" v-text="'売上金を振込申請できます'"></span>
        </v-row>
        <v-row class="mt-5 mx-1">
          <span v-text="'売上金：'"></span>
          <span v-text="salesAmount"></span>
          <span v-text="'円'"></span>
        </v-row>
        <v-row class="mt-5 mx-1">
          <span v-text="'振込可能額：'"></span>
          <span v-text="transferAvarableAmount"></span>
          <span v-text="'円'"></span>
        </v-row>
        <v-row class="mt-5 mx-1">
          <span v-text="'※売上金に対する手数料は３０％です。'"></span>
        </v-row>
        <v-row class="mt-5 mx-1">
          <span
            v-text="'※１回の振込あたり振込手数料が350円かかります。'"
          ></span>
        </v-row>
        <v-row class="mt-5 pb-5 mx-1">
          <span v-text="'振込申請中：'"></span>
          <span v-text="amountPenddingWithdrawal"></span>
          <span v-text="'円'"></span>
        </v-row>
        <v-row class="mx-1">
          <v-text-field
            v-model="transferAmount"
            :rules="[
              rules.required,
              rules.maxValue(transferAmount, transferAvarableAmount),
            ]"
            type="tel"
            label="振込金額"
            :suffix="'円'"
            onpaste="return false;"
            autocomplete="off"
            @keypress="validateNumOnly"
            @keyup="applyCurrencyRule($event.target.value)"
          />
        </v-row>
        <v-row class="mx-1">
          <div>
            <span class="title" v-text="'振込先口座情報'"></span>
          </div>
          <v-card class="account-info-card my-2">
            <v-row class="mx-1" align="center" justify="end">
              <v-icon :color="'rgb(231, 64, 89)'"> mdi-pencil </v-icon>
              <div class="ma-2 msy-color-text-red" @click="changeAccountInfo">
                <span v-text="'口座情報を変更する'"></span>
              </div>
            </v-row>
            <v-row class="mx-1">
              <v-col cols="8">
                <label class="content-label" v-text="'金融機関名'"></label>
                <div class="content-text" v-text="bankName"></div>
              </v-col>
              <v-col cols="4">
                <label class="content-label" v-text="'支店名'"></label>
                <div class="content-text" v-text="branchName"></div>
              </v-col>
            </v-row>
            <v-row class="mx-1">
              <v-col cols="3">
                <label class="content-label" v-text="'口座種別'"></label>
                <div
                  class="content-text"
                  v-text="accountType === '1' ? '普通' : '当座'"
                ></div>
              </v-col>
              <v-col cols="4">
                <label class="content-label" v-text="'口座番号'"></label>
                <div class="content-text" v-text="accountNumber"></div>
              </v-col>
              <v-col cols="5">
                <label class="content-label" v-text="'口座名義'"></label>
                <div class="content-text" v-text="kanaName"></div>
              </v-col>
            </v-row>
          </v-card>
        </v-row>
        <v-row class="mx-1 py-5 mb-5">
          <v-btn
            block
            dark
            class="msy-color-red"
            large
            :disabled="isRequesting"
            @click="execTransfer"
            v-text="'振込申請する'"
          />
        </v-row>
      </div>
      <v-snackbar
        v-model="isShowSuccessSnackbar"
        top
        :multi-line="true"
        :color="'success'"
        :timeout="3000"
      >
        <span v-text="successStr"></span>
      </v-snackbar>
      <v-snackbar
        v-model="isShowErrorSnackbar"
        top
        :multi-line="true"
        :color="'error'"
        :timeout="3000"
      >
        <span v-text="errorStr"></span>
      </v-snackbar>
    </v-container>
  </div>
</template>

<script>
import { ValidateRules } from "~/constant.js";
import axios from "~/plugins/axios";
import Loading from "~/components/molecules/Loading";
import StripeService from "~/mixins/service/StripeService";
import PurchasedContentsDao from "~/mixins/dao/PurchasedContentsDao";
import TransferAmountDao from "~/mixins/dao/TransferAmountDao";
export default {
  layout: "artist",
  components: {
    Loading,
  },
  mixins: [StripeService, PurchasedContentsDao, TransferAmountDao],
  data() {
    return {
      loadingValue: 0,
      rules: ValidateRules,
      transferAmount: 0,
      salesAmount: 0,
      isAccountInfoExists: false,
      accountTypes: [
        { accountTypeId: 1, label: "普通預金" },
        { accountTypeId: 2, label: "当座預金" },
      ],
      loadedAccountInfo: null,
      bankInfo: null,
      bankCode: null,
      bankName: null,
      bankSearchItems: [],
      isBankSearchLoading: false,
      bankSearch: null,
      branchInfo: null,
      branchCode: null,
      branchName: null,
      branchSearch: null,
      branchSearchItems: [],
      isBranchSearchLoading: false,
      accountType: null,
      accountNumber: null,
      kanaName: "",
      isShowSuccessSnackbar: false,
      successStr: "",
      isShowErrorSnackbar: false,
      errorStr: "",
      amountPenddingWithdrawal: 0,
      isRequesting: false,
    };
  },
  computed: {
    transferAvarableAmount() {
      // 手数料30％で振込手数料350円都度徴収
      return Math.round(
        this.salesAmount * 0.7 - this.amountPenddingWithdrawal - 350
      );
    },
  },
  watch: {
    async bankSearch(val) {
      this.isBankSearchLoading = true;
      await this.loadBankItems(val);
      this.isBankSearchLoading = false;
    },
    async branchSearch(val) {
      this.isBranchSearchLoading = true;
      await this.loadBranchItems(val);
      this.isBranchSearchLoading = false;
    },
    bankInfo(val) {
      if (val) {
        this.bankCode = val.code ? val.code : null;
        this.bankName = val.name ? val.name : null;
      }
    },
    branchInfo(val) {
      if (val) {
        this.branchCode = val.code ? val.code : null;
        this.branchName = val.name ? val.name : null;
      }
    },
  },
  async created() {
    this.loadingValue = 0;
    try {
      await this.loadAccountInfo();
      this.loadingValue = 20;
      await this.loadSalesAmount();
      this.loadingValue = 50;
      await this.loadBankItems("");
      this.loadingValue = 100;
    } catch (error) {
      console.error(error);
      this.loadingValue = 100;
    }
  },
  methods: {
    async loadBankItems(bankName) {
      try {
        const results = await axios.get("https://bank.teraren.com/banks.json", {
          params: { name: bankName },
        });
        if (results.data && results.data.length > 0) {
          this.bankSearchItems = [];
          results.data.forEach((result) => {
            const bank = {
              code: result.code,
              name: result.name,
            };
            this.bankSearchItems.push(bank);
          });
        }
      } catch (error) {
        console.error(error);
      }
    },
    async loadBranchItems(branchName) {
      if (!this.bankCode) {
        return;
      }
      try {
        const results = await axios.get(
          `https://bank.teraren.com/banks/${this.bankCode}/branches/search.json`,
          {
            params: { name: branchName },
          }
        );
        if (results.data && results.data.length > 0) {
          this.branchSearchItems = [];
          results.data.forEach((result) => {
            const bank = {
              code: result.code,
              name: result.name,
            };
            this.branchSearchItems.push(bank);
          });
        }
      } catch (error) {
        console.error(error);
      }
    },
    async loadSalesAmount() {
      try {
        const result = await this.PurchasedContentsDao_SelectPurchasedContentsAmountByArtistUserId();
        this.amountPenddingWithdrawal = await this.TransferAmountDao_SelectTotalAmountPenddingWithdrawalByUserId();
        if (result && result.sum > 0) {
          this.salesAmount = result.sum;
        }
      } catch (error) {
        console.error(error);
      }
    },
    async loadAccountInfo() {
      try {
        const result = await this.StripeService_loadAccountInfo();
        if (result && result.accountInfo && result.accountInfo.bankCode) {
          this.loadedAccountInfo = result.accountInfo;
          this.bankCode = this.loadedAccountInfo.bankCode;
          this.bankName = this.loadedAccountInfo.bankName;
          this.branchCode = this.loadedAccountInfo.branchCode;
          this.branchName = this.loadedAccountInfo.branchName;
          this.accountType = this.loadedAccountInfo.accountType;
          this.accountNumber = this.loadedAccountInfo.accountNumber;
          this.kanaName = this.loadedAccountInfo.kanaName;
          this.isAccountInfoExists = true;
        }
      } catch (error) {
        console.error(error);
      }
    },
    changeAccountInfo() {
      this.bankCode = null;
      this.bankName = null;
      this.branchCode = null;
      this.branchName = null;
      this.accountType = null;
      this.accountNumber = null;
      this.kanaName = null;
      this.isAccountInfoExists = false;
    },
    closeAccountInfoInput() {
      this.bankCode = this.loadedAccountInfo.bankCode;
      this.bankName = this.loadedAccountInfo.bankName;
      this.branchCode = this.loadedAccountInfo.branchCode;
      this.branchName = this.loadedAccountInfo.branchName;
      this.accountType = this.loadedAccountInfo.accountType;
      this.accountNumber = this.loadedAccountInfo.accountNumber;
      this.kanaName = this.loadedAccountInfo.kanaName;
      this.isAccountInfoExists = true;
    },
    async saveAccountInfo() {
      if (this.$refs.form.validate()) {
        try {
          const accountInfo = {
            bankCode: this.bankCode,
            bankName: this.bankName,
            branchCode: this.branchCode,
            branchName: this.branchName,
            accountType: this.accountType,
            accountNumber: this.accountNumber,
            kanaName: this.kanaName,
          };
          await this.StripeService_SaveAccountInfo(accountInfo);
          this.isAccountInfoExists = true;
          this.isShowSuccessSnackbar = true;
          this.successStr = "口座情報の登録が完了しました";
        } catch (error) {
          console.error(error);
          this.isShowErrorSnackbar = true;
          this.errorStr = "口座情報の登録に失敗しました";
        }
      }
    },
    async execTransfer() {
      this.isRequesting = true;
      try {
        await this.TransferAmountDao_InsertTransferAmount(this.transferAmount);
        alert("振込申請が完了しました");
        this.$router.push({
          name: "artists-main",
          params: { artistId: 0 },
        });
      } catch (error) {
        console.error(error);
        this.isShowErrorSnackbar = true;
        this.errorStr = "振込の申請に失敗しました";
      }
      this.isRequesting = false;
    },
    validateNumOnly(e) {
      const charCode = e.which ? e.which : e.keyCode;
      if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        e.preventDefault();
      }
    },
    applyCurrencyRule(points) {
      this.transferAmount = parseInt(String(points) || "0");
    },
  },
};
</script>

<style lang="scss" scoped>
.content-label {
  font-size: 0.7rem;
  color: rgba(0, 0, 0, 0.65);
}
.content-text {
  font-size: 1rem;
  white-space: nowrap;
}
.account-info-card {
  width: 100%;
}
</style>
