<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <div class="d-flex align-center">
        <v-img
          alt="Sparcs Logo"
          class="shrink mr-2"
          contain
          src="https://sparcs-public.s3.ap-northeast-2.amazonaws.com/SPARCS_Branding/1_SPARCS/SPARCS_white.png"
          transition="scale-transition"
          width="120"
        />
        <span
          style="
            font-size: 22px;
            font-weight: bold;
            font-family: 'Raleway', sans-serif;
          "
          >GOIN</span
        >
      </div>
      <v-spacer></v-spacer>
      <v-btn text v-text="`Hello ${this.my_name}`"></v-btn>
      <v-btn text v-text="'logout'" @click="logout"></v-btn>
    </v-app-bar>

    <v-main style="margin-bottom: 120px">
      <v-container>
        <p
          style="
            margin-top: 15px;
            font-size: 2rem;
            font-family: 'Raleway', sans-serif;
          "
        >
          Goin Ranking
        </p>
        <v-list-item-subtitle style="margin-bottom: 10px">
          repository의 최근 100개의 commits, PRs을 반영합니다.
        </v-list-item-subtitle>
        <v-data-table
          dense
          :headers="table_headers"
          :items="table_items"
          item-key="name"
          class="elevation-3"
        ></v-data-table>
      </v-container>
      <v-container>
        <p style="font-size: 2rem; font-family: 'Raleway', sans-serif">
          Developer Quiz
        </p>
        <v-list-item-subtitle style="margin-bottom: 20px">
          Quiz를 맞추어 SPARCS SLAVE에 도전하세요!
        </v-list-item-subtitle>
        <v-btn @click="fetchQuiz">
          {{ quiz_data.length == 0 ? "Start" : "Stop" }}
        </v-btn>
        <v-card class="mx-auto mt-4" v-if="quiz_data.length != 0">
          <v-list-item three-line>
            <v-list-item-content>
              <div class="text-h6 mb-4">#{{ quiz_num + 1 }}</div>
              <v-list-item-title class="text-h5 mb-1">
                {{ quiz_data[quiz_num].question }}
              </v-list-item-title>
              <v-list-item-subtitle>
                Category:
                {{ quiz_data[quiz_num].category }}
                | Tag:
                {{ quiz_data[quiz_num].tags.map((x) => x.name).join(", ") }}
                | Difficulty:
                {{ quiz_data[quiz_num].difficulty }}
                |
                {{
                  quiz_data[quiz_num].multiple_correct_answers === "true"
                    ? "Multiple Choose"
                    : "Single Choose"
                }}
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-container fluid class="ml-4">
            <v-checkbox
              v-model="selecteda"
              :label="quiz_data[quiz_num].answers.answer_a"
              v-if="quiz_data[quiz_num].answers.answer_a != null"
            ></v-checkbox>
            <v-checkbox
              v-model="selectedb"
              :label="quiz_data[quiz_num].answers.answer_b"
              v-if="quiz_data[quiz_num].answers.answer_b != null"
            ></v-checkbox>
            <v-checkbox
              v-model="selectedc"
              :label="quiz_data[quiz_num].answers.answer_c"
              v-if="quiz_data[quiz_num].answers.answer_c != null"
            ></v-checkbox>
            <v-checkbox
              v-model="selectedd"
              :label="quiz_data[quiz_num].answers.answer_d"
              v-if="quiz_data[quiz_num].answers.answer_d != null"
            ></v-checkbox>
            <v-checkbox
              v-model="selectede"
              :label="quiz_data[quiz_num].answers.answer_e"
              v-if="quiz_data[quiz_num].answers.answer_e != null"
            ></v-checkbox>
            <v-checkbox
              v-model="selectedf"
              :label="quiz_data[quiz_num].answers.answer_f"
              v-if="quiz_data[quiz_num].answers.answer_f != null"
            ></v-checkbox>
            <p
              class="mt-4"
              v-if="quiz_answer_mode"
              :style="
                (this.notion_text.length == 6 ? 'color: green' : 'color: red') +
                '; font-weight: bold'
              "
            >
              {{ notion_text }}
            </p>
          </v-container>
          <v-card-actions class="pt-0">
            <v-btn text @click="quizSubmit">
              {{ !quiz_answer_mode ? "SUBMIT" : "NEXT" }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-container>
    </v-main>
    <v-dialog v-model="githubdialog" max-width="400">
      <v-card>
        <v-card-title class="text-h5">
          Github 계정을 입력하세요. (약 1~2분 소요)
        </v-card-title>
        <v-text-field
          id="githubid"
          name="githubid"
          label="GithubID"
          v-model="githubid"
          style="padding: 16px 16px"
        ></v-text-field>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="green darken-1" text @click="githubsubmit">
            제출
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script>
import { mapGetters } from "vuex";
import http from "../http";

export default {
  name: "Home",

  components: {},
  computed: {
    ...mapGetters(["isAuthenticated", "getAccessToken"]),
  },
  data: () => ({
    my_name: "",
    items: [],
    title: "",
    subtitle: "",
    githubdialog: false,
    githubid: "",
    table_items: [],
    quiz_data: [],
    quiz_score: 0,
    selecteda: false,
    selectedb: false,
    selectedc: false,
    selectedd: false,
    selectede: false,
    selectedf: false,
    quiz_num: -1,
    quiz_answer_mode: false,
    notion_text: "정답입니다!",
    table_headers: [
      { text: "Ranking", value: "index" },
      {
        text: "SPARCS Nickname",
        align: "start",
        sortable: false,
        value: "sparcs_id",
      },
      { text: "Degree", value: "degree" },
      { text: "Commits", value: "commits" },
      { text: "PRs", value: "prs" },
      { text: "# of Repos", value: "repos_num" },
      { text: "Quiz Score", value: "games" },
      { text: "Total pts", value: "total_pt" },
    ],
  }),
  methods: {
    send() {
      alert("send");
    },
    logout() {
      this.$store.dispatch("logout", {}).then(() => {
        if (!this.isAuthenticated) {
          this.$router.push({
            name: "Login",
          });
        }
      });
    },
    githubsubmit() {
      http.get("githubid?github_id=" + this.githubid).then(async (res) => {
        console.log(res);
        if (res.data.ok) this.githubdialog = false;

        await this.reloadDash();
      });
    },
    fetchQuiz() {
      if (this.quiz_num != -1) {
        this.resetQuiz();
      } else {
        http.get("graphql/quizes?query={getQuizes}").then(async (res) => {
          this.resetSelect();
          this.quiz_data = JSON.parse(res.data.data.getQuizes);
          this.quiz_num = 0;
        });
      }
    },
    async quizSubmit() {
      const cans = this.quiz_data[this.quiz_num].correct_answers;
      if (!this.quiz_answer_mode) {
        let all_success = true;
        if (cans.answer_a_correct != this.selecteda.toString())
          all_success = false;
        if (cans.answer_b_correct != this.selectedb.toString())
          all_success = false;
        if (cans.answer_c_correct != this.selectedc.toString())
          all_success = false;
        if (cans.answer_d_correct != this.selectedd.toString())
          all_success = false;
        if (cans.answer_e_correct != this.selectede.toString())
          all_success = false;
        if (cans.answer_f_correct != this.selectedf.toString())
          all_success = false;
        if (all_success) {
          this.notion_text = "정답입니다!";
          this.quiz_score++;
        } else
          this.notion_text =
            "오답입니다. 정답: " +
            Object.values(this.quiz_data[this.quiz_num].correct_answers)
              .map((e, i) => [e, "ABCDEF"[i]])
              .filter((x) => x[0] == "true")
              .map((x) => x[1]);
        this.quiz_answer_mode = true;
        return;
      }

      if (this.quiz_num >= 4) {
        alert(`획득 점수: ${this.quiz_score}`);
        await http.get(
          `graphql/user?query={update_games(sparcs_id:"${this.my_name}",score:${this.quiz_score})}`
        );
        await this.reloadDash();
        this.resetQuiz();
        return;
      }
      this.resetSelect();
      this.quiz_answer_mode = false;
      this.quiz_num = this.quiz_num + 1;
    },
    resetSelect() {
      this.selecteda = false;
      this.selectedb = false;
      this.selectedc = false;
      this.selectedd = false;
      this.selectede = false;
      this.selectedf = false;
    },
    resetQuiz() {
      this.quiz_answer_mode = false;
      this.quiz_data = [];
      this.quiz_num = -1;
      this.quiz_score = 0;
    },
    async reloadDash() {
      const gres = await http.get(
        "graphql/user?query={users{sparcs_id, degree, commits, prs, repos_num, games, total_pt}}"
      );
      console.log(gres);
      // console.log("asdf", gres.data.users);
      this.table_items = gres.data.data.users.map((x, i) => {
        console.log("index", i);
        return { index: i + 1, ...x };
      });
      // this.table_items = gres.data.data.users;
    },
  },
  async mounted() {
    //Load user id from server (to check api working)
    http
      .get("id")
      .then(async (res) => {
        this.my_name = res.data.id[0];
        if (!res.data.id[1]) {
          this.githubdialog = true;
        }

        await this.reloadDash();
      })
      .then()
      .catch((err) => {
        if (err.response.data.reason === "not-logged-in") {
          console.log("not-logged-in from api");
        }
      });
  },
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Raleway:wght@800&display=swap");
</style>