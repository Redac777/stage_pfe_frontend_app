<template>
  <div class="main-parent">
    <div class="parent">
      <!-- List drivers with associated switches -->
      <div class="label-column">Drivers</div>
      <div class="drivers-container">
        <div
          v-for="(chunk, colIndex) in chunkedDrivers"
          :key="colIndex"
          class="column"
        >
          <div v-for="(item, rowIndex) in chunk" :key="rowIndex" class="driver">
            <div class="drivername">{{ item.firstname + " " + item.lastname }}</div>
            <v-switch
              v-model="selectedDrivers"
              :value="item"
              hide-details
            ></v-switch>
          </div>
        </div>
      </div>

      <!-- List rss with associated switches -->
      <div class="label-column">RSs</div>
      <div class="rss-container">
        <div
          v-for="(chunk, colIndex) in chunkedRSs"
          :key="colIndex"
          class="column"
        >
          <div v-for="(item, rowIndex) in chunk" :key="rowIndex" class="rs">
            <div class="rsname">{{ item.matricule }}</div>
            <v-switch
              v-model="selectedRSs"
              :value="item"
              hide-details
            ></v-switch>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Button -->
    <div class="create-button">
      <v-btn
        @click="openConfirmDialog"
        density="default"
        style="background-color: #15263f; color: white; width: 120px"
        >Create</v-btn
      >
    </div>

    <!-- Confirm Dialog -->
    <ConfirmDialog
      equipementType="RS"
      v-model="showConfirmDialog"
      @validateSelections="createPlanning"
      @removeDriver="removeDriver"
      @removeEquipement="removeEquipement"
      :selectedDrivers="selectedDrivers"
      :selectedEqus="selectedRSs"
      @closeDialog="showConfirmDialog = false"
    />
  </div>
</template>

<script>
import ConfirmDialog from "../ConfirmDialog.vue";
import { mapGetters, mapActions } from "vuex";

export default {
  //components
  components: {
    ConfirmDialog,
  },

  //data
  data() {
    return {
      driversList: [],
      rssList: [],
      selectedDrivers: [],
      selectedRSs: [],
      dialog: {}, // Object to store dialog state for each RS
      startTime: "",
      endTime: "",
      showConfirmDialog: false,
      shiftId: null,
      profileGroupId: null,
    };
  },

  //computed
  computed: {
    //include getters
    ...mapGetters(["getDrivers", "getEquipements"]),
    // returns array of 6 drivers per chunk
    chunkedDrivers() {
      return this.chunkArray(this.driversList, 6);
    },

    // returns array of 6 rss per chunk
    chunkedRSs() {
      return this.chunkArray(this.rssList, 6);
    },
  },

  // mounted
  mounted() {
    this.setData();
  },

  // methods
  methods: {
    ...mapActions([
      "setDriversAction",
      "setLoadingValueAction",
      "setEquipementsAction",
      "createPlanningAction",
      "addUserToPlanning",
      "addEquipementToPlanning",
    ]),

    // set drivers and equipements
    setData() {
      const inputs = {
        profile_group: "rs",
        role: "driver",
      };
      this.setLoadingValueAction(true);
      this.setDriversAction(inputs).then(() => {
        this.setLoadingValueAction(false);
        this.driversList = this.getDrivers;
        if (this.driversList.length > 0) {
          this.shiftId = this.driversList[0].shift_id;
        }
      });
      this.setEquipementsAction().then(() => {
        this.setLoadingValueAction(false);
        this.rssList = this.getEquipements
          .filter((equipement) => equipement.profile_group.type === "rs");
          if (this.rssList.length > 0) {
          this.profileGroupId = this.rssList[0].profile_group.id;
        }
      });
    },

    createPlanning() {
      let usersAddedSuccessfully = []
      let equAddedSuccessfully = []
      this.showConfirmDialog = false;
      this.setLoadingValueAction(true);
      const planning = {
        shift_id: this.shiftId,
        profile_group_id: this.profileGroupId,
      };
      this.createPlanningAction(planning).then((response) => {
        for (let driver in this.selectedDrivers) {
          let userWPlanning = {
            user_id: this.selectedDrivers[driver].id,
            planning_id: response.id,
          };
          this.addUserToPlanning(userWPlanning).then(() => {
            usersAddedSuccessfully.push(this.selectedDrivers[driver])
          });
        }

        for (let equ in this.selectedRSs) {
          let equWPlanning = {
            equipement_id: this.selectedRSs[equ].id,
            planning_id: response.id
          };
          this.addEquipementToPlanning(equWPlanning).then(() => {
            equAddedSuccessfully.push(this.selectedRSs[equ])
          })
        }

        this.setLoadingValueAction(false);
        console.log(usersAddedSuccessfully)
        console.log(equAddedSuccessfully)
      });
    },

    // splits array into chunks of size
    chunkArray(arr, size) {
      return arr.reduce(
        (acc, _, i) =>
          i % size === 0 ? [...acc, arr.slice(i, i + size)] : acc,
        []
      );
    },

    //remove driver from confirm dialog
    removeDriver(driver) {
      this.selectedDrivers = this.selectedDrivers.filter(
        (item) => item !== driver
      );
    },

    //remove rs from confirm dialog
    removeEquipement(equ) {
      this.selectedRSs = this.selectedRSs.filter((rs) => rs.matricule !== equ.matricule);
    },

    // open confirm dialog
    openConfirmDialog() {
      console.log(this.selectedRSs);
      this.showConfirmDialog = true;
    },
  },
};
</script>

<style scoped>
.main-parent {
  display: flex;
  width: fit-content;
  flex-direction: column;
  height: 88%;
  gap: 0.3rem;
}

.parent {
  display: flex;
  justify-content: center;
  gap: 2rem;
  width: 100%;
  height: fit-content;
}

.create-button {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  height: fit-content;
}

.drivers-container,
.rss-container {
  display: flex;
  gap: 2rem;
}

.column {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.driver,
.rs {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem; /* Espacement entre les drivers */
}

.v-switch {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: x-small !important;
}

.drivername {
  font-size: 0.9rem;
  font-weight: bold;
  width: 100px;
}

.rsname {
  font-size: 0.9rem;
  font-weight: bold;
}

.label-column {
  writing-mode: vertical-rl; /* Écriture verticale */
  text-align: center; /* Alignement horizontal */
  font-weight: bold;
  font-size: 1.2rem;
  transform: rotate(180deg);
}
</style>
