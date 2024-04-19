<template>
  <v-app>
    <v-main class="main">
      <!-- Loading Component -->
      <div>
        <Loading v-if="load" />
      </div>

      <!-- Components -->
      <div v-if="isLogged">
        <div>
          <Sidebar />
        </div>
        <div class="right">
          <div>
            <Topbar />
          </div>
          <div class="content">
            <router-view></router-view>
          </div>
        </div>
      </div>

      <div v-else>
        <Login />
      </div>
    </v-main>
  </v-app>
</template>

<script>
import { mapGetters } from "vuex";
import Login from "@/components/Authentification/Login.vue";
import Loading from "@/components/Loading/Loading.vue";

export default {
  components: { Login, Loading },

  data() {
    return {
      isLogged: false,
      load: false,
    };
  },

  computed: {
    ...mapGetters(["getUserActive", "getLoadingValue"]),
  },

  watch: {
    getUserActive(newVal) {
      this.isLogged = newVal !== null;
    },
    getLoadingValue(val) {
      this.load = val === true;
    },
  },

  mounted() {
    if (this.getUserActive != null) {
      this.isLogged = true;
    } else {
      this.$router.push("/");
    }
  },

};
//
</script>
<style scoped>
.main {
  position: relative;
}

.right {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
</style>
