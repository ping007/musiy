<template>
  <div v-show="isShowPage">
    <template>
      <v-tabs v-model="tab">
        <v-tab href="#transfer-request-all-list">振込依頼一覧</v-tab>
        <v-tab href="#musiy-sales-list">売上表（全体）</v-tab>
        <v-tab href="#artists-sales-list">売上表（アーティスト毎）</v-tab>
      </v-tabs>
    </template>
    <v-tabs-items v-model="tab">
      <v-tab-item value="transfer-request-all-list">
        <v-data-table
          v-model="multiSelectedItems"
          :headers="headers"
          :items="formattedItems"
          sort-by="crDatetime"
          :sort-desc="true"
          class="elevation-1"
          :single-select="false"
          item-key="id"
        >
          <template v-slot:[`item.actions`]="{ item }">
            <v-btn
              :color="'primary'"
              @click="showDetail(item)"
              v-text="'詳細確認'"
            />
          </template>
          <template v-slot:[`item.isTransferred`]="{ item }">
            <v-chip
              :color="item.isTransferred ? 'success' : 'warning'"
              dark
              v-text="item.isTransferred ? '振込済' : '未振込'"
            />
          </template>
        </v-data-table>
        <v-container v-if="selectedItem" class="detail-area">
          <v-row>
            <v-col class="bold" v-text="'振込状況'" />
            <v-col>
              <v-chip
                :color="selectedItem.isTransferred ? 'success' : 'warning'"
                dark
                v-text="selectedItem.isTransferred ? '振込済' : '未振込'"
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col class="bold" v-text="'ユーザー名'" />
            <v-col v-text="selectedItem.userName" />
            <v-col class="bold" v-text="'振込金額'" />
            <v-col v-text="selectedItem.amount" />
          </v-row>
          <v-row>
            <v-col class="bold" v-text="'金融機関名'" />
            <v-col v-text="selectedItem.bankName" />
            <v-col class="bold" v-text="'金融機関コード'" />
            <v-col v-text="selectedItem.bankCode" />
          </v-row>
          <v-row>
            <v-col class="bold" v-text="'支店名'" />
            <v-col v-text="selectedItem.branchName" />
            <v-col class="bold" v-text="'支店コード'" />
            <v-col v-text="selectedItem.branchCode" />
          </v-row>
          <v-row>
            <v-col class="bold" v-text="'口座種別'" />
            <v-col v-text="selectedItem.accountType === '1' ? '普通' : '当座'" />
            <v-col class="bold" v-text="'口座番号'" />
            <v-col v-text="selectedItem.accountNumber" />
          </v-row>
          <v-row>
            <v-col class="bold" v-text="'口座名義'" />
            <v-col v-text="selectedItem.kanaName" />
            <v-col />
            <v-col />
          </v-row>

          <v-row>
            <v-col>
              <v-btn
                :color="'error'"
                :disabled="selectedItem.isTransferred"
                @click="showDialog = true"
                v-text="'振込済にする'"
              />
            </v-col>
          </v-row>
          <v-dialog v-model="showDialog" max-width="500px">
            <v-card>
              <v-card-title class="headline">
                ステータスを振込済に変更しますか？
              </v-card-title>
              <v-card-actions>
                <v-spacer />
                <v-btn color="blue darken-1" text @click="showDialog = false">
                  Cancel
                </v-btn>
                <v-btn color="blue darken-1" text @click="dialogConfirmed">
                  OK
                </v-btn>
                <v-spacer />
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-container>
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
        </v-tab-item>
        <v-tab-item value="musiy-sales-list">
          <v-row align="left">
            <v-col
              class="d-flex"
              cols="2"
            >
              <v-select
                v-model="defaultYear"
                :items="selectableYears"
                item-text="text"
                item-value="val"
                return-object
                @change="displayMusiySalesList($event.val)"
              />
            </v-col>
          </v-row>
          <template>
            <v-simple-table>
              <template v-slot:default>
                <thead>
                  <tr>
                    <th class="text-left" v-for="column in salesListColumns" :key="column">
                      {{column}}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="sales in musiySalesListData" :key="sales">
                    <td>{{ sales.header }}</td>
                    <td class="text-right" v-for="value in sales.val" :key="value">{{ value.toLocaleString() }}円</td>
                  </tr>
                </tbody>
              </template>
            </v-simple-table>
            <v-snackbar
              v-model="isShowSalesListErrorSnackbar"
              top
              :multi-line="true"
              :color="'error'"
              :timeout="3000"
            >
              <span v-text="salesListErrorStr"></span>
            </v-snackbar>
          </template>
        </v-tab-item>
        <v-tab-item value="artists-sales-list">
          <v-row align="left">
            <v-col
              class="d-flex"
              cols="2"
            >
              <v-select
                v-model="defaultYear"
                :items="selectableYears"
                item-text="text"
                item-value="val"
                return-object
                @change="displayArtistsSalesList($event.val)"
              />
            </v-col>
          </v-row>
          <div v-for="artistSales of artistsSalesListData" :key="artistSales">
            <template>
              <h1>{{artistSales.artistName}}</h1>
              <v-simple-table>
                <template v-slot:default>
                  <thead>
                    <tr>
                      <th class="text-left" v-for="column in salesListColumns" :key="column">
                        {{column}}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="sales in artistSales.sales" :key="sales">
                    <td>{{ sales.header }}</td>
                    <td class="text-right" v-for="value in sales.val" :key="value">
                      <div v-if="value !== ''">
                        {{ value.toLocaleString() }}円
                      </div>
                    </td>
                    </tr>
                  </tbody>
                </template>
              </v-simple-table>
              <v-snackbar
                v-model="isShowSalesListErrorSnackbar"
                top
                :multi-line="true"
                :color="'error'"
                :timeout="3000"
              >
                <span v-text="salesListErrorStr"></span>
              </v-snackbar>
            </template>
            <br /><br /><br />
          </div>
        </v-tab-item>
      </v-tabs-items>
  </div>
</template>

<script>
import StripeService from "~/mixins/service/StripeService";
import TransferAmountDao from "~/mixins/dao/TransferAmountDao";
import PurchasedContentsDao from "~/mixins/dao/PurchasedContentsDao";
import MoviesDao from "~/mixins/dao/MoviesDao";
import MusicsDao from "~/mixins/dao/MusicsDao";
import PlansDao from "~/mixins/dao/PlansDao";
import BroadcastsDao from "~/mixins/dao/BroadcastsDao";
import UsersDao from "~/mixins/dao/UsersDao";
export default {
  mixins: [StripeService, TransferAmountDao, PurchasedContentsDao, MoviesDao, MusicsDao, PlansDao, BroadcastsDao, UsersDao],
  layout: "noHeader",
  data() {
    return {
      tab: null,
      isShowPage: false,
      showDialog: false,
      isShowSuccessSnackbar: false,
      successStr: "",
      isShowErrorSnackbar: false,
      errorStr: "",
      isShowSalesListErrorSnackbar: false,
      salesListErrorStr: "",
      headers: [
        { text: "操作", value: "actions", sortable: false },
        {
          text: "振込状況",
          value: "isTransferred",
          align: "start",
          sortable: true,
        },
        {
          text: "ユーザー名",
          value: "userName",
          align: "start",
          sortable: false,
        },
        {
          text: "振込金額",
          value: "amount",
          align: "start",
          sortable: false,
        },
        {
          text: "依頼日時",
          value: "crDatetime",
          align: "start",
          sortable: false,
        },
      ],
      serviceStartYear: 2021,
      defaultYear: undefined,
      selectableYears: [],
      items: [],
      formattedItems: [],
      media: undefined,
      artists: undefined,
      musics: undefined,
      movies: undefined,
      plans: undefined,
      broadcasts: undefined,
      selectedItem: undefined,
      multiSelectedItems: [],
      salesListColumns: ["", "1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月", "年間合計"],
      musiySalesListData: [],
      artistsSalesListData: [],
    };
  },
  async created() {
    if (await this.TransferAmountDao_IsMasterAccount()) {
      this.isShowPage = true;
      const thisYear = new Date().getFullYear();
      this.defaultYear = { text: thisYear + "年", val: thisYear };
      for (let i = 0; i <= (thisYear - this.serviceStartYear); i++) {
        const selectableYear = thisYear - i;
        this.selectableYears.push({ text: selectableYear + "年", val: selectableYear });
      }
      await this.getAllItems();
      await this.getSalesListItems();
      this.displayMusiySalesList(thisYear);
      await this.getSalesListItemsByArtist();
      this.displayArtistsSalesList(thisYear);
    } else {
      this.$store.commit("user/setUser", null);
      this.$router.push({
        name: "login",
      });
    }
  },
  watch: {
    items() {
      this.formattedItems = this.formatAmount(this.items, "amount");
    },
  },
  methods: {
    async getAllItems() {
      this.items = [];
      try {
        const results = await this.TransferAmountDao_SelectTransferAmounts();
        if (results) {
          this.items = results;
        }
      } catch (error) {
        this.isShowErrorSnackbar = true;
        this.errorStr = "データの取得に失敗しました";
      }
    },
    formatAmount(array, targetPropName) {
      const formatted = [];
      const copys = JSON.parse(JSON.stringify(array));
      copys.forEach((copy) => {
        copy.amount = Number(copy[targetPropName]).toLocaleString() + "円";
        formatted.push(copy);
      });
      return formatted;
    },
    async getSalesListItems() {
      try {
        const result = await this.PurchasedContentsDao_SelectPurchasedMediaBySpecifiedYear();
        if (result) {
          this.media = result;
        }
      } catch (error) {
        this.isShowSalesListErrorSnackbar = true;
        this.salesListErrorStr = "Musiy売上データの取得に失敗しました";
      }
    },
    displayMusiySalesList(selectedYear) {
      if (this.media) {
        const mediaForSelectedYear = this.media.filter(content => new Date(content.crDatetime).getFullYear() === selectedYear);
        const musicTotalRow = {
          header: "音声販売合計",
          val: this.generateTotalSalesArrayForEachMonth(mediaForSelectedYear.filter(medium => medium.contentType === "music"), "price")
        }
        const movieTotalRow = {
          header: "動画販売合計",
          val: this.generateTotalSalesArrayForEachMonth(mediaForSelectedYear.filter(medium => medium.contentType === "movie"), "price")
        }
        const ticketTotalRow = {
          header: "配信チケット合計",
          val: this.generateTotalSalesArrayForEachMonth(mediaForSelectedYear.filter(medium => medium.contentType === "ticket"), "price")
        }
        const fanClubTotalRow = {
          header: "ファンクラブ合計",
          val: this.generateTotalSalesArrayForEachMonth(mediaForSelectedYear.filter(medium => medium.contentType === "plan"), "price")
        }

        const overallTotalRow = {
          header: "全体総売上",
          val: []
        };
        for (let i = 0; i < 12; i++) {
          overallTotalRow.val.push(musicTotalRow.val[i] + movieTotalRow.val[i] + ticketTotalRow.val[i] + fanClubTotalRow.val[i]);
        }
        overallTotalRow.val.push(overallTotalRow.val.reduce((accum, current) => accum + current));
        const profitRow = {
          header: "利益",
          val: overallTotalRow.val.map(elm => elm * 0.3)
        }
        const transferredRow = {
          header: "振込金合計",
          val: this.generateTotalSalesArrayForEachMonth(this.items.filter(item => new Date(item.crDatetime).getFullYear() === selectedYear), "amount")
        }

        this.musiySalesListData = [overallTotalRow, musicTotalRow, movieTotalRow, ticketTotalRow, fanClubTotalRow, profitRow, transferredRow];
      }
    },
    async getSalesListItemsByArtist() {
      try {
        const artistsResult = await this.UsersDao_SelectAllArtists();
        const musicsResult = await this.MusicsDao_SelectMusicByMusicIds(this.media.filter(medium => medium.contentType === "music").map(music => music.contentId));
        const moviesResult = await this.MoviesDao_SelectMovieByMovieIds(this.media.filter(medium => medium.contentType === "movie").map(movie => movie.contentId));
        const broadcastsResult = await this.BroadcastsDao_SelectBroadcastByBroadcastIds(this.media.filter(medium => medium.contentType === "ticket").map(broadcast => broadcast.contentId));
        const plansResult = await this.PlansDao_SelectPlanByPlanIds(this.media.filter(medium => medium.contentType === "plan").map(plan => plan.contentId));
        if (artistsResult && musicsResult && moviesResult && broadcastsResult && plansResult) {
          [this.artists, this.musics, this.movies, this.broadcasts, this.plans] = [artistsResult, musicsResult, moviesResult, broadcastsResult, plansResult];
        }
      } catch (error) {
        this.isShowSalesListErrorSnackbar = true;
        this.salesListErrorStr = "Musiy売上データの取得に失敗しました";
      }
    },
    displayArtistsSalesList(selectedYear) {
      if (this.artists && this.musics && this.movies && this.broadcasts && this.plans) {
        this.artistsSalesListData = [];
        const mediaByArtists = {};
        this.artists.forEach((artist) => {
          mediaByArtists[artist.userId] = {
            musicIds: this.musics.filter(music => music.userId === artist.userId).map(music => music.musicId),
            movieIds: this.movies.filter(movie => movie.userId === artist.userId).map(movie => movie.movieId),
            broadcastIds: this.broadcasts.filter(broadcast => broadcast.userId === artist.userId).map(broadcast => broadcast.broadcastId),
            planIds: this.plans.filter(plan => plan.userId === artist.userId).map(plan => plan.planId)
          }
        });

        const mediaForSelectedYear = this.media.filter(content => new Date(content.crDatetime).getFullYear() === selectedYear);
        this.artists.forEach((artist) => {
          const musicTotalRow = {
            header: "音声販売合計",
            val: this.generateTotalSalesArrayForEachMonth(mediaForSelectedYear
              .filter(medium => medium.contentType === "music" && mediaByArtists[artist.userId].musicIds.includes(medium.contentId)), "price")
          };
          const movieTotalRow = {
            header: "動画販売合計",
            val: this.generateTotalSalesArrayForEachMonth(mediaForSelectedYear
              .filter(medium => medium.contentType === "movie" && mediaByArtists[artist.userId].movieIds.includes(medium.contentId)), "price")
          };
          const ticketTotalRow = {
            header: "配信チケット合計",
            val: this.generateTotalSalesArrayForEachMonth(mediaForSelectedYear
              .filter(medium => medium.contentType === "ticket" && mediaByArtists[artist.userId].broadcastIds.includes(medium.contentId)), "price")
          };
          const fanClubTotalRow = {
            header: "ファンクラブ合計",
            val: this.generateTotalSalesArrayForEachMonth(mediaForSelectedYear
              .filter(medium => medium.contentType === "plan" && mediaByArtists[artist.userId].planIds.includes(medium.contentId)), "price")
            };

          const overallTotalRow = {
            header: "全体総売上",
            val: []
          };
          for (let i = 0; i < 12; i++) {
            overallTotalRow.val.push(musicTotalRow.val[i] + movieTotalRow.val[i] + ticketTotalRow.val[i] + fanClubTotalRow.val[i]);
          }
          overallTotalRow.val.push(overallTotalRow.val.reduce((accum, current) => accum + current));
          const profitRow = {
            header: "利益",
            val: overallTotalRow.val.map(elm => elm * 0.3)
          };
          const artistSales = {
            header: "手数料を引いたその月の売上",
            val: overallTotalRow.val.map(elm => elm * 0.7)
          };
          const transferredRow = {
            header: "振込金合計",
            val: this.generateTotalSalesArrayForEachMonth(
            this.items.filter(item => new Date(item.crDatetime).getFullYear() === selectedYear && item.transferUserId === artist.userId), "amount")
          };
          const autoTransferredRow = {
            header: "次月末自動振込金額",
            val: this.generateAutoTransferred(artist, mediaByArtists, selectedYear, transferredRow.val, artistSales.val)
          };
          const remainingBalanceRow = {
            header: "残りの売上",
            val: this.generateRemainingBalance(artist, mediaByArtists, artistSales.val, transferredRow.val, autoTransferredRow.val, selectedYear)
          };
          this.artistsSalesListData.push({
            artistName: artist.username,
            sales: [overallTotalRow, musicTotalRow, movieTotalRow, ticketTotalRow, fanClubTotalRow, profitRow, artistSales, transferredRow, remainingBalanceRow, autoTransferredRow]
          });
        })
      }
    },
    generateAutoTransferred(artist, mediaByArtists, selectedYear, transferredForThisYear, artistSalesForSelectedYear) {
      const autoTransferredOrderByMonthDesc = [];

      const mediaForPrevYear = this.media.filter(content => new Date(content.crDatetime).getFullYear() === (selectedYear - 1));
      const musicTotalForPrevYear = this.generateTotalSalesArrayForEachMonth(mediaForPrevYear
        .filter(medium => medium.contentType === "music" && mediaByArtists[artist.userId].musicIds.includes(medium.contentId)), "price");
      const movieTotalForPrevYear = this.generateTotalSalesArrayForEachMonth(mediaForPrevYear
        .filter(medium => medium.contentType === "movie" && mediaByArtists[artist.userId].movieIds.includes(medium.contentId)), "price");
      const ticketTotalForPrevYear = this.generateTotalSalesArrayForEachMonth(mediaForPrevYear
        .filter(medium => medium.contentType === "ticket" && mediaByArtists[artist.userId].broadcastIds.includes(medium.contentId)), "price");
      const fanClubTotalForPrevYear = this.generateTotalSalesArrayForEachMonth(mediaForPrevYear
        .filter(medium => medium.contentType === "plan" && mediaByArtists[artist.userId].planIds.includes(medium.contentId)), "price");
      const overallTotalForPrevYear = [];
      for (let i = 0; i < 12; i++) {
        overallTotalForPrevYear.push(musicTotalForPrevYear[i] + movieTotalForPrevYear[i] + ticketTotalForPrevYear[i] + fanClubTotalForPrevYear[i]);
      }
      overallTotalForPrevYear.push(overallTotalForPrevYear.reduce((accum, current) => accum + current));
      const artistSalesForPrevYear = overallTotalForPrevYear.map(elm => elm * 0.7);
      const transferredForPrevYear = this.generateTotalSalesArrayForEachMonth(
        this.items.filter(item => new Date(item.crDatetime).getFullYear() === (selectedYear - 1) && item.transferUserId === artist.userId), "amount");

      const calcAutoTransferred = function(totalSalesForTheMonthBeforeLast, transferredForPastThreeMonth) {
        if (transferredForPastThreeMonth >= totalSalesForTheMonthBeforeLast) {
          return 0;
        }
        return totalSalesForTheMonthBeforeLast - transferredForPastThreeMonth;
      }
      for (let month = 1; month <= 12; month++) {
        let [totalSalesForTheMonthBeforeLast, transferredForPastThreeMonth] = [0, 0];
        const shouldBeCarriedFromPrevYear = month <= 2;
        if (shouldBeCarriedFromPrevYear) {
          const [monthBeforeLast, lastMonth] = [month === 1 ? 11 : 12, month === 1 ? 12 : 1];
          totalSalesForTheMonthBeforeLast = artistSalesForPrevYear[monthBeforeLast - 1];
          const transferredForTheMonthBeforeLast = transferredForPrevYear[monthBeforeLast - 1];
          const transferredsForLastMonth = month === 1 ? transferredForPrevYear[lastMonth - 1] : transferredForThisYear[lastMonth - 1];
          const transferredsForThisMonth = transferredForThisYear[month - 1];
          transferredForPastThreeMonth = transferredForTheMonthBeforeLast + transferredsForLastMonth + transferredsForThisMonth;
        } else {
          const [monthBeforeLast, lastMonth] = [month - 2, month - 1];
          totalSalesForTheMonthBeforeLast = artistSalesForSelectedYear[monthBeforeLast - 1];
          const transferredForTheMonthBeforeLast = transferredForThisYear[monthBeforeLast - 1];
          const transferredsForLastMonth = transferredForThisYear[lastMonth - 1];
          const transferredsForThisMonth = transferredForThisYear[month - 1];
          transferredForPastThreeMonth = transferredForTheMonthBeforeLast + transferredsForLastMonth + transferredsForThisMonth;
        }
        autoTransferredOrderByMonthDesc.push(calcAutoTransferred(totalSalesForTheMonthBeforeLast, transferredForPastThreeMonth));
      }
      autoTransferredOrderByMonthDesc.push(autoTransferredOrderByMonthDesc.reduce((accum, current) => accum + current));

      return autoTransferredOrderByMonthDesc;
    },
    generateRemainingBalance(artist, mediaByArtists, artistSalesForSelectedYear, transferredForSelectedYear, autoTransferred, selectedYear) {
      const remainingBalanceByMonthDesc = [];

      const mediaForPrevYear = this.media.filter(content => new Date(content.crDatetime).getFullYear() === (selectedYear - 1));
      const musicTotalForPrevYear = this.generateTotalSalesArrayForEachMonth(mediaForPrevYear
        .filter(medium => medium.contentType === "music" && mediaByArtists[artist.userId].musicIds.includes(medium.contentId)), "price");
      const movieTotalForPrevYear = this.generateTotalSalesArrayForEachMonth(mediaForPrevYear
        .filter(medium => medium.contentType === "movie" && mediaByArtists[artist.userId].movieIds.includes(medium.contentId)), "price");
      const ticketTotalForPrevYear = this.generateTotalSalesArrayForEachMonth(mediaForPrevYear
        .filter(medium => medium.contentType === "ticket" && mediaByArtists[artist.userId].broadcastIds.includes(medium.contentId)), "price");
      const fanClubTotalForPrevYear = this.generateTotalSalesArrayForEachMonth(mediaForPrevYear
        .filter(medium => medium.contentType === "plan" && mediaByArtists[artist.userId].planIds.includes(medium.contentId)), "price");
      const overallTotalForPrevYear = [];
      for (let i = 0; i < 12; i++) {
        overallTotalForPrevYear.push(musicTotalForPrevYear[i] + movieTotalForPrevYear[i] + ticketTotalForPrevYear[i] + fanClubTotalForPrevYear[i]);
      }
      overallTotalForPrevYear.push(overallTotalForPrevYear.reduce((accum, current) => accum + current));
      const artistSalesForPrevYear = overallTotalForPrevYear.map(elm => elm * 0.7);

      for (let month = 1; month < 13; month++) {
        if (month === 1) {
          const prevYear = selectedYear - 1;
          const transferredForPrevYear = this.generateTotalSalesArrayForEachMonth(
            this.items.filter(item => new Date(item.crDatetime).getFullYear() === prevYear && item.transferUserId === artist.userId), "amount");
          const autoTransferredForPrevYear = this.generateAutoTransferred(artist, mediaByArtists, prevYear, transferredForPrevYear, artistSalesForPrevYear);
          let remainingBalanceUntilLastMonth = 0;
          for (let monthForPrevYear = 12; monthForPrevYear >= 10; monthForPrevYear--) {
            const i = monthForPrevYear - 1;
            const remainingBalanceForTargetMonth = artistSalesForPrevYear[i] - transferredForPrevYear[i] - autoTransferredForPrevYear[i];
            remainingBalanceUntilLastMonth += remainingBalanceForTargetMonth;
          }
          remainingBalanceByMonthDesc.push(this.calcRemainingBalanceForTargetMonth(artistSalesForSelectedYear, remainingBalanceUntilLastMonth, transferredForSelectedYear, autoTransferred, month));
        } else {
          remainingBalanceByMonthDesc.push(this.calcRemainingBalanceForTargetMonth(artistSalesForSelectedYear, remainingBalanceByMonthDesc[month - 2],
            transferredForSelectedYear, autoTransferred, month));
        }
      }
      remainingBalanceByMonthDesc.push("");
      return remainingBalanceByMonthDesc;
    },
    calcRemainingBalanceForTargetMonth(overallTotalForSelectedYear, remainingBalanceForLastMonth,
      transferredForSelectedYear, autoTransferred, targetMonth) {
      const artistSalesForThisMonth = overallTotalForSelectedYear[targetMonth - 1];
      const transferredForThisMonth = transferredForSelectedYear[targetMonth - 1];
      const autoTransfferdForThisMonth = autoTransferred[targetMonth - 1];
      return (artistSalesForThisMonth + remainingBalanceForLastMonth) - (transferredForThisMonth + autoTransfferdForThisMonth);
    },
    generateTotalSalesArrayForEachMonth(contents, priceColumnName) {
      const totalSalesArray = [];
      for (let i = 1; i <= 12; i++) {
        totalSalesArray.push(this.generateTotalSales(contents, i, priceColumnName));
      }
      totalSalesArray.push(totalSalesArray.reduce((accum, current) => accum + current));
      return totalSalesArray;
    },
    generateTotalSales(contents, month, priceColumnName) {
      const contentsForTargetMonth = contents.filter(content => (new Date(content.crDatetime).getMonth() + 1) === month)
      if (contentsForTargetMonth.length === 0) {
        return 0;
      }
      return contentsForTargetMonth
        .filter(content => content[priceColumnName] !== undefined && content[priceColumnName] !== null)
        .map(content => Number(content[priceColumnName]))
        .reduce((accum, current) => accum + current);
    },
    async showDetail(item) {
      if (item) {
        await this.loadAccountInfo(item);
      }
    },
    async loadAccountInfo(item) {
      try {
        const result = await this.StripeService_loadAccountInfo(
          item.transferUserId
        );
        if (result && result.accountInfo && result.accountInfo.bankCode) {
          const loadedAccountInfo = result.accountInfo;
          this.selectedItem = item;
          this.selectedItem.bankCode = loadedAccountInfo.bankCode;
          this.selectedItem.bankName = loadedAccountInfo.bankName;
          this.selectedItem.branchCode = loadedAccountInfo.branchCode;
          this.selectedItem.branchName = loadedAccountInfo.branchName;
          this.selectedItem.accountType = loadedAccountInfo.accountType;
          this.selectedItem.accountNumber = loadedAccountInfo.accountNumber;
          this.selectedItem.kanaName = loadedAccountInfo.kanaName;
        }
      } catch (error) {
        console.error(error);
      }
    },
    async dialogConfirmed() {
      this.showDialog = false;
      if (this.selectedItem) {
        try {
          await this.TransferAmountDao_UpdateTransferIsTransferred(
            this.selectedItem.transferAmountId
          );
          this.isShowSuccessSnackbar = true;
          this.successStr = "振込済に更新しました";
          this.selectedItem = undefined;
          await this.getAllItems();
        } catch (error) {
          console.error(error);
          this.isShowErrorSnackbar = true;
          this.errorStr = "振込ステータス更新に失敗しました";
          this.selectedItem = undefined;
        }
      }
    },
  },
};
</script>

<style lang="scss" scoped>
</style>
