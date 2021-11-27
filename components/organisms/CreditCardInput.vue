<template>
  <div class="card-form-wrapper">
    <CardForm
      :form-data="formData"
      @input-card-number="updateCardNumber"
      @input-card-name="updateCardName"
      @input-card-month="updateCardMonth"
      @input-card-year="updateCardYear"
      @input-card-cvv="updateCardCvv"
      @click-register="onSubmit"
    />
  </div>
</template>

<script>
import CardForm from "../molecules/CardForm";
import axios from "~/plugins/axios";
export default {
  name: "CreaditCardInput",
  components: {
    CardForm,
  },
  data() {
    return {
      formData: undefined,
    };
  },
  created() {
    this.formData = {
      cardName: "",
      cardNumber: "",
      cardMonth: "",
      cardYear: "",
      cardCvv: "",
    };
  },
  methods: {
    updateCardNumber(val) {
      this.cardNumber = val;
    },
    updateCardName(val) {
      this.cardName = val;
    },
    updateCardMonth(val) {
      this.cardMonth = val;
    },
    updateCardYear(val) {
      this.cardYear = val;
    },
    updateCardCvv(val) {
      this.cardCvv = val;
    },
    onSubmit(data) {
      this.$emit("click-register", data);
    },
  },
};
</script>

<style lang="scss">
@import "~/assets/style.scss";
</style>
