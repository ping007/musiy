export default {
  methods: {
    async TransferAmountDao_SelectTransferAmounts() {
      try {
        const result = await this.$functions.httpsCallable(
          "select_transfer_amounts"
        )({});
        console.log("SQL Result:", result);
        let transferAmounts = [];
        if (result && result.data && result.data.rows.length > 0) {
          transferAmounts = result.data.rows;
        }
        return transferAmounts;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async TransferAmountDao_SelectTransferAmountByUserId() {
      try {
        const result = await this.$functions.httpsCallable(
          "select_transfer_amount_by_user_id"
        )({});
        console.log("SQL Result:", result);
        let transferAmount = 0;
        if (result && result.data && result.data.rows.length > 0) {
          transferAmount = result.data.rows;
        }
        return transferAmount;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async TransferAmountDao_SelectTotalAmountPenddingWithdrawalByUserId() {
      try {
        const result = await this.$functions.httpsCallable(
          "select_total_amount_pendding_withdrawal_by_user_id"
        )({});
        console.log("SQL Result:", result);
        let amountPenddingWithdrawal = 0;
        if (result && result.data && result.data.rows.length > 0 && result.data.rows[0].amountPenddingWirhdrawal != null) {
          amountPenddingWithdrawal = parseInt(
            result.data.rows[0].amountPenddingWirhdrawal
          );
        }
        return amountPenddingWithdrawal;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async TransferAmountDao_InsertTransferAmount(amount) {
      try {
        const sqlResult = await this.$functions.httpsCallable(
          "insert_transfer_amount"
        )({
          amount,
        });
        console.log("SQL Result:", sqlResult);
        return sqlResult;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async TransferAmountDao_UpdateTransferIsTransferred(transferAmountId) {
      try {
        const result = await this.$functions.httpsCallable(
          "update_transfer_is_transferred"
        )({
          transferAmountId,
        });
        console.log("SQL Result:", result);
        return result;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async TransferAmountDao_IsMasterAccount() {
      try {
        const result = await this.$functions.httpsCallable("is_master_account")(
          {}
        );
        console.log("SQL Result:", result);
        return result.data;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
  },
};
