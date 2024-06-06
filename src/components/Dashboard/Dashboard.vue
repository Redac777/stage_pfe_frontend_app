<template>
  <div class="main">
    <div class="content">
      <!-- <v-btn @click="reset"> Reset </v-btn>  -->
      <DashboardNavigation @updateActiveComponent="updateActiveComponent" />
      <RTGhome
        v-if="
          (activeComponent == 'RTGhome' &&
            this.role &&
            this.role.name !== 'driver' &&
            this.role.name !== 'am' &&
            (!this.plannings ||
              (this.plannings && this.plannings.length === 0))) ||
          this.createdPlanningData
        "
        :planningData="createdPlanningData"
      />
      <RTGPlanningOutput
        v-if="
          activeComponent == 'RTGhome' &&
          this.plannings &&
          this.plannings.length !== 0 &&
          !this.createdPlanningData
        "
        @createPlanning="handleCreatePlanning"
      />
      <STShome
        v-if="
          (activeComponent == 'STShome' &&
            this.role &&
            this.role.name !== 'driver' &&
            this.role.name !== 'am' &&
            (!this.stsPlannings ||
              (this.stsPlannings && this.stsPlannings.length === 0))) ||
          this.createdSTSPlanningData
        "
        :stsplanningData="createdSTSPlanningData"
      />
      <STSPlanningOutput
        v-if="
          activeComponent == 'STShome' &&
          this.stsPlannings &&
          this.stsPlannings.length !== 0 &&
          !this.createdSTSPlanningData
        "
        @createPlanning="handleCreateSTSPlanning"
      />
      <RShome
        v-if="
          (activeComponent == 'RShome' &&
            this.role &&
            this.role.name !== 'driver' &&
            this.role.name !== 'am' &&
            (!this.rsPlannings ||
              (this.rsPlannings && this.rsPlannings.length === 0))) ||
          this.createdRSPlanningData
        "
        :rsplanningData="createdRSPlanningData"
      />
      <RSPlanningOutput
        v-if="
          activeComponent == 'RShome' &&
          this.rsPlannings &&
          this.rsPlannings.length !== 0 &&
          !this.createdRSPlanningData
        "
        @createPlanning="handleCreateRSPlanning"
      />
      <AMhome
        v-if="
          (activeComponent == 'AMhome' &&
            this.role &&
            this.role.name !== 'driver' &&
            this.role.name !== 'am' &&
            (!this.amPlannings ||
              (this.amPlannings && this.amPlannings.length === 0))) ||
          this.createdAMPlanningData
        "
        :amplanningData="createdAMPlanningData"
      />
      <AMPlanningOutput
        v-if="
          activeComponent == 'AMhome' &&
          this.amPlannings &&
          this.amPlannings.length !== 0 &&
          !this.createdAMPlanningData
        "
        @createPlanning="handleCreateAMPlanning"
      />
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

export default {
  data() {
    return {
      activeComponent: "RTGhome",
      plannings: null,
      rsPlannings: null,
      stsPlannings: null,
      amPlannings: null,
      createdPlanningData: null,
      createdRSPlanningData: null,
      createdSTSPlanningData: null,
      createdAMPlanningData: null,
      role: null,
    };
  },
  computed: {
    ...mapGetters([
      "getPlannings",
      "getRSPlannings",
      "getSTSPlannings",
      "getAMPlannings",
      "getUserRole",
    ]),
    // includePlanning(){
    //     return this.plannings && this.plannings.length!==0 && this.plannings.find(planning=>planning)
    // }
  },

  mounted() {
    this.getCurrentPlanningMethod();
  },

  methods: {
    ...mapActions(["clearPlannings"]),
    updateActiveComponent(value) {
      this.activeComponent = value;
      switch (value) {
        case "RTGhome":
          this.createdRSPlanningData = null;
          this.createdSTSPlanningData = null;
          this.createdAMPlanningData = null;
          // this.rsPlannings = null;
          break;
        case "RShome":
          this.createdPlanningData = null;
          this.createdSTSPlanningData = null;
          this.createdAMPlanningData = null;
          break;
        case "STShome":
          this.createdPlanningData = null;
          this.createdRSPlanningData = null;
          this.createdAMPlanningData = null;
          break;
        case "AMhome":
          this.createdPlanningData = null;
          this.createdRSPlanningData = null;
          this.createdSTSPlanningData = null;
          break;
        // this.plannings = null;
      }
    },
    getCurrentPlanningMethod() {
      this.plannings = this.getPlannings;
      this.rsPlannings = this.getRSPlannings;
      this.stsPlannings = this.getSTSPlannings;
      this.amPlannings = this.getAMPlannings;
      this.role = this.getUserRole;

      // console.log(this.createdPlanningData)
    },

    reset() {
      this.clearPlannings();
      window.location.reload();
    },

    handleCreatePlanning(data) {
      // console.log(data)
      this.createdPlanningData = data;
      // console.log(JSON.stringify(this.createdPlanningData))
    },
    handleCreateRSPlanning(data) {
      // console.log(data)
      this.createdRSPlanningData = data;

      // console.log(JSON.stringify(this.createdRSPlanningData))
    },
    handleCreateSTSPlanning(data) {
      // console.log(data)
      this.createdSTSPlanningData = data;

      // console.log(JSON.stringify(this.createdRSPlanningData))
    },
    handleCreateAMPlanning(data) {
      // console.log(data)
      this.createdAMPlanningData = data;
      // console.log(JSON.stringify(this.createdRSPlanningData))
    },
  },
};
</script>

<style scoped>
.main {
  background-color: white;
  height: 100%;
}

.content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
}
</style>
