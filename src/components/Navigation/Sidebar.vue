<template>
  <div class="sidebar">
    <v-card>
      <v-navigation-drawer
        v-model="drawer"
        :rail="rail"
        permanent
        @click="rail = false"
      >
        <!-- top items -->
        <div class="topitems">
          <v-list-item
            prepend-avatar="https://randomuser.me/api/portraits/men/85.jpg"
            :title="
              authUser ? authUser.firstname + ' ' + authUser.lastname : ''
            "
            style="color: #f9fbfc"
          >
            <template v-slot:append>
              <v-btn
                icon
                @click.stop="rail = !rail"
                v-bind:class="{ closedrawer: true }"
              >
                <v-icon size="small" style="color: white">
                  mdi-arrow-left
                </v-icon>
              </v-btn>
            </template>
          </v-list-item>

          <v-list-item
            v-for="(item, index) in items"
            :key="index"
            :prepend-icon="item.icon"
            :title="item.title"
            :value="item.value"
            :style="{
              color: '#F9FBFC',
              backgroundColor: item.selected ? 'rgba(217, 217, 217, 0.2)' : '',
            }"
            @click="selectItem(index)"
            nav
          ></v-list-item>
        </div>

        <!-- divider -->
        <v-divider></v-divider>

        <!-- bottom items -->
        <div class="bottomitems">
          <v-btn icon @click="logout">
            <v-icon size="small" style="color: white"> mdi-logout </v-icon>
          </v-btn>
        </div>
      </v-navigation-drawer>
    </v-card>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

export default {
  data() {
    return {
      drawer: true,
      rail: true,
      authUser: null,
      items: [
        {
          icon: "mdi-view-dashboard",
          title: "Planning",
          value: "planning",
          selected: true,
        },
        {
          icon: "mdi-account-group-outline",
          title: "Users",
          value: "users",
          selected: false,
        },
        {
          icon: "mdi-crane",
          title: "Equipments",
          value: "equipments",
          selected: false,
        },
      ],
    };
  },

  mounted() {
    this.getAuthUser();
  },

  computed: {
    ...mapGetters(["getMessages", "getUserActive"]),
  },

  methods: {

    ...mapActions(["logoutAction","clearPlannings"]),
    getAuthUser() {
      this.authUser = this.getUserActive;
    },

    logout() {
      this.logoutAction()
        .then(() => {
          console.log(this.getMessages.logout);
          this.clearPlannings()
          this.redirectAfterLogout();
        })
        .catch((error) => {
          console.error("Logout error:", error);
        });
    },

    redirectAfterLogout() {
      this.$router.push("/");
      localStorage.clear();
    },

    selectItem(index) {
      this.items.forEach((item, i) => {
        item.selected = i === index;
      });
      switch (index) {
        case 0:
          this.$router.push("/dashboard");
          break;
        case 1:
          this.$router.push("/users");
          break;
        case 2:
          this.$router.push("/equipements");
          break;
      }
    },
  },
};
</script>

<style scoped>
.sidebar {
  z-index: 30;
  opacity: 1;
}

.v-navigation-drawer {
  height: 100vh;

  background-color: #15263f;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex-wrap: wrap;
  flex-shrink: 1;
}

.topitems {
  height: 80vh;
}


.bottomitems {
  width: 100%;
  display: flex;
  justify-content: center;
}

.v-btn {
  background-color: #15263f;
}

.v-list-item {
  margin: 1rem 0;
}
</style>
