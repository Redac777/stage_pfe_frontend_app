<template>
  <div class="main-parent">
    <div class="parent">
      <!-- List drivers with associated switches -->
      <div class="resources">
        <div class="label-column">Drivers</div>
        <div class="selectAll">
          <label class="drivername">Select All</label>
          <v-switch
            v-model="selectAll"
            @change="toggleSelectAll"
            hide-details
          ></v-switch>
        </div>
        <hr class="hr" />
        <div class="drivers-container">
          <div
            v-for="(chunk, colIndex) in chunkedDrivers"
            :key="colIndex"
            class="column"
          >
            <div
              v-for="(item, rowIndex) in chunk"
              :key="rowIndex"
              class="driver"
            >
              <div class="drivername">
                {{ item.firstname + " " + item.lastname }}
              </div>
              <v-switch
                v-model="selectedDrivers"
                :value="item"
                hide-details
              ></v-switch>
            </div>
          </div>
        </div>
      </div>

      <!-- List rss with associated switches -->
      <div class="resources">
        <div class="label-column">RSs</div>
        <div class="selectAll">
          <label class="rsname">Select All</label>
          <v-switch
            v-model="selectAllRSs"
            @change="toggleSelectAllRSs"
            hide-details
          ></v-switch>
        </div>
        <hr class="hr" />
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
import moment from "moment";

export default {
  //components
  components: {
    ConfirmDialog,
  },
  props: {
    rsplanningData: {
      type: Object,
      default: null,
    },
  },

  //data
  data() {
    return {
      driversList: [],
      rssList: [],
      selectedDrivers: [],
      selectedRSs: [],
      dialog: {}, // Object to store dialog state for each RS
      endTime: "",
      showConfirmDialog: false,
      shiftId: null,
      profileGroupId: null,
      tableItems: [],
      arrayToSave: [],
      drivers: [],
      rss: [],
      tableHeaders: [],
      inputs: null,
      planning: null,
      allPlannings: [],
    };
  },

  //computed
  computed: {
    //include getters
    ...mapGetters([
      "getDrivers",
      "getEquipements",
      "getCurrentRSPlanning",
      "getPlanningDrivers",
      "getPlanningEquipements",
      "getRSPlannings",
    ]),
    // returns array of 6 drivers per chunk
    chunkedDrivers() {
      return this.chunkArray(this.driversList, 4);
    },

    // returns array of 6 rss per chunk
    chunkedRSs() {
      return this.chunkArray(this.rssList, 4);
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
      "createRSPlanningAction",
      "addUserToPlanning",
      "addEquipementToPlanning",
      "setCurrentRSPlanning",
      "setPlanningDrivers",
      "setUserById",
      "setPlanningEquipements",
      "setEquipementById",
      "setBoxAction",
      "setShiftByCategory",
    ]),

    toggleSelectAll() {
      if (this.selectAll) {
        this.selectAllDrivers();
      } else {
        this.deselectAllDrivers();
      }
    },
    selectAllDrivers() {
      this.selectedDrivers = [];
      this.chunkedDrivers.forEach((chunk) => {
        chunk.forEach((driver) => {
          if (!this.selectedDrivers.includes(driver)) {
            this.selectedDrivers.push(driver);
          }
        });
      });
    },
    deselectAllDrivers() {
      this.selectedDrivers = [];
    },

    toggleSelectAllRSs() {
      if (this.selectAllRSs) {
        this.selectAllRSsList();
      } else {
        this.deselectAllRSsList();
      }
    },
    selectAllRSsList() {
      this.selectedRSs = [];
      this.chunkedRSs.forEach((chunk) => {
        chunk.forEach((rs) => {
          if (!this.selectedRSs.includes(rs)) {
            this.selectedRSs.push(rs);
          }
        });
      });
    },
    deselectAllRSsList() {
      this.selectedRSs = [];
    },

    // set drivers and equipements
    async setData() {
      this.setLoadingValueAction(true);
      if (this.rsplanningData) {
        console.log(JSON.stringify(this.rsplanningData));
        const response = await this.setShiftByCategory({
          category: this.rsplanningData.shift,
        });
        this.inputs = {
          profile_group: "rs",
          role: "driver",
          shift_id: response[0].id,
        };
      } else {
        const shiftCategory = this.getActualShift();
        console.log(shiftCategory);
        const response = await this.setShiftByCategory({
          category: shiftCategory,
        });
        this.inputs = {
          profile_group: "rs",
          role: "driver",
          shift_id: response[0].id,
        };
      }
      // console.log(this.inputs);
      this.setDriversAction(this.inputs).then(() => {
        this.driversList = this.getDrivers;
        if (this.driversList.length > 0) {
          this.shiftId = this.driversList[0].shift_id;
        }
      });
      this.setEquipementsAction().then(() => {
        this.rssList = this.getEquipements.filter(
          (equipement) => equipement.profile_group.type === "rs"
        );
        this.setLoadingValueAction(false);
        if (this.rssList.length > 0) {
          this.profileGroupId = this.rssList[0].profile_group.id;
        }
      });
    },

    createPlanning() {
      this.drivers = [];
      this.rss = [];
      this.tableHeaders = [];
      this.itemsPlanning = [];
      this.showConfirmDialog = false;
      this.setLoadingValueAction(true);
      if (this.rsplanningData) {
        const date = new Date(this.rsplanningData.date);
        // Get the year, month, and day components
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0"); // Month starts from 0
        const day = String(date.getDate()).padStart(2, "0");

        // Construct the formatted date string in "YYYY-mm-dd" format
        const formattedDate = `${year}-${month}-${day}`;
        this.planning = {
          shift_id: this.shiftId,
          profile_group_id: this.profileGroupId,
          planned_at: formattedDate,
        };
      } else {
        this.planning = {
          shift_id: this.shiftId,
          profile_group_id: this.profileGroupId,
        };
      }
      this.createRSPlanningAction(this.planning).then((response) => {
        const addUserPromises = [];
        const addEquipementPromises = [];
        for (let driver in this.selectedDrivers) {
          let userWPlanning = {
            user_id: this.selectedDrivers[driver].id,
            planning_id: response.id,
          };
          addUserPromises.push(this.addUserToPlanning(userWPlanning));
        }
        console.log(this.selectedRSs);
        for (let equ in this.selectedRSs) {
          let equWPlanning = {
            equipement_id: this.selectedRSs[equ].id,
            planning_id: response.id,
          };
          addEquipementPromises.push(
            this.addEquipementToPlanning(equWPlanning)
          );
        }

        Promise.all([...addUserPromises, ...addEquipementPromises])
          .then(() => {
            // All promises have resolved
            this.setBoxesData();
          })
          .catch((error) => {
            this.setLoadingValueAction(false);
            // Handle error if any of the promises fail
            console.error(error);
          });
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
      this.selectedRSs = this.selectedRSs.filter(
        (rs) => rs.matricule !== equ.matricule
      );
    },

    // open confirm dialog
    openConfirmDialog() {
      console.log(this.selectedRSs);
      this.showConfirmDialog = true;
    },

    async setBoxesData() {
      let currentDate = new Date();
      // Get year, month, and day
      let year = currentDate.getFullYear();
      let month = (currentDate.getMonth() + 1).toString().padStart(2, "0"); // Months are zero indexed, so we add 1
      let day = currentDate.getDate().toString().padStart(2, "0");
      let formattedDate = year + "-" + month + "-" + day;
      console.log(formattedDate);
      const dateObject = {
        date: formattedDate,
        shift_id: this.shiftId,
        profile_group_id: this.profileGroupId,
        profileType: "rs",
      };

      try {
        await this.setCurrentRSPlanning(dateObject);
        this.allPlannings = this.getRSPlannings;
        // console.log(this.allPlannings)
        if (this.allPlannings && this.allPlannings.length != 0) {
          this.planning = this.allPlannings[this.allPlannings.length - 1];
          const planningId = {
            planning_id: this.planning.id,
          };

          const driversPromise = this.setPlanningDrivers(planningId);
          const equipementsPromise = this.setPlanningEquipements(planningId);

          await Promise.all([driversPromise, equipementsPromise]);

          const driversPlanning = this.getPlanningDrivers;
          if (driversPlanning) {
            for (let driverP in driversPlanning) {
              const user = {
                user_id: driversPlanning[driverP].user_id,
              };
              const response = await this.setUserById(user);
              this.drivers.push(response);
              console.log(this.drivers);
            }
          }

          const equipementPlanning = this.getPlanningEquipements;
          if (equipementPlanning) {
            for (let equP in equipementPlanning) {
              const equipement = {
                equipement_id: equipementPlanning[equP].equipement_id,
              };
              const response = await this.setEquipementById(equipement);
              this.rss.push(response);
              console.log(this.rss);
            }
          }

          this.rsPlanning(); // Call rsPlanning() after all promises have resolved
        }
      } catch (error) {
        this.setLoadingValueAction(false);
        console.error(error);
        // Handle error
      }
    },

    rsPlanning() {
      let nbrDrivers = this.drivers.length;
      let nbrRtgs = this.rss.length;

      this.drivers = this.drivers.sort(function (a, b) {
        return b.sby_workingHours - a.sby_workingHours;
      });
      let currentTime = new Date().getHours();
      let endTime = 0;
      switch (true) {
        case currentTime >= 7 && currentTime <= 14: // Between 7h and 14h59
          endTime = 7;
          break;
        case currentTime >= 15 && currentTime <= 22: // Between 15h and 22h59
          endTime = 15;
          break;
        default: // Between 23h and 24h or 00h and 6h59
          endTime = 23;
          break;
      }
      let totalHours = 8;
      let continuedHours = totalHours - nbrDrivers;
      let intervalEndTime = 0;
      for (let i = 0; i < nbrDrivers + 1; i++) {
        let intervalHour = 0;

        // Calculate endTime
        if (i === nbrDrivers) {
          intervalHour += continuedHours;
          intervalEndTime = endTime + intervalHour;
        } else {
          intervalEndTime = endTime + 1;
        }
        this.tableHeaders.push({
          title: endTime + " - " + intervalEndTime,
          sortable: false,
        });
        endTime = intervalEndTime;
      }
      const itemsPlanning = [];
      itemsPlanning.push(["Drivers | Time", ...this.tableHeaders]);

      for (let i = 0; i < nbrDrivers; i++) {
        itemsPlanning.push(
          Array(itemsPlanning.length + 1).fill(this.drivers[i].id)
        );
      }

      for (let i = 1; i < nbrDrivers + 1; i++) {
        itemsPlanning[i][i] = "P";
      }
      let rssIndex = 0;
      for (let j = 1; j < nbrDrivers + 2; j++) {
        rssIndex = 0;
        for (let i = 1; i < nbrDrivers + 1; i++) {
          if (itemsPlanning[i][j] != "P") {
            if (rssIndex < this.rss.length) {
              // Check if rssIndex is within bounds
              itemsPlanning[i][j] = this.rss[rssIndex];
              rssIndex++;
            } else {
              // Handle the case when rssIndex exceeds the length of rss array
              // For example, you can break the loop or handle it according to your logic.
              break;
            }
          }
        }
      }
      for (let i = 1; i < nbrDrivers + 1; i++) {
        itemsPlanning[i][0] = this.drivers[i - 1];
      }
      console.log(itemsPlanning);
      let parts = [];
      for (let i = 1; i < nbrDrivers + 1; i++) {
        for (let j = 1; j < nbrDrivers + 2; j++) {
          const equipementId =
            itemsPlanning[i][j] == "P"
              ? null
              : this.rss.find(
                  (rs) => rs.matricule === itemsPlanning[i][j].matricule
                )?.id;
          parts = itemsPlanning[0][j].title.split("+")[0].split("-");
          console.log(parts);
          const boxObject = {
            planning_id: this.planning.id,
            user_id: itemsPlanning[i][0].id,
            equipement_id: equipementId,
            break: itemsPlanning[i][j] == "P" ? true : false,
            start_time: parts[0],
            ends_time: parts[1],
          };
          console.log(boxObject);
          this.arrayToSave.push(boxObject);
        }
      }
      this.confirmPlanning(itemsPlanning);
    },

    confirmPlanning(itemsPlanningArray) {
      const promises = [];
      for (let item in this.arrayToSave) {
        promises.push(this.setBoxAction(this.arrayToSave[item]));
      }
      Promise.all(promises)
        .then(() => {
          // Once all promises are resolved, set loading value to false
          this.setLoadingValueAction(false).then(() => {
            // After setting loading value, log the result
            console.log(itemsPlanningArray);
            window.location.reload();
          });
        })
        .catch((error) => {
          // Handle any errors that occur during the process
          console.error("Error:", error);
          this.setLoadingValueAction(false);
        });
    },
    getActualShift() {
      let thisDate = new Date("2022-02-10T07:00:00");
      let nowDate = new Date();
      let shift = ["D", "A", "B", "C"];
      let momentDate = moment(thisDate);

      while (momentDate.add(72, "hours").toDate() < nowDate) {
        shift = this.shiftArrays(shift);
      }
      if (nowDate.getHours() >= 7 && nowDate.getHours() < 15) return shift[0];
      else if (nowDate.getHours() >= 15 && nowDate.getHours() < 23)
        return shift[1];
      else if (
        nowDate.getHours() == 23 ||
        (nowDate.getHours() >= 0 && nowDate.getHours() < 7)
      )
        return shift[2];
    },
    shiftArrays(array) {
      let c = "";
      c = array[3];
      array[3] = array[2];
      array[2] = array[1];
      array[1] = array[0];
      array[0] = c;

      return array;
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
  margin-top: 2rem;
  display: flex;
  justify-content: space-between;
  gap: 2rem;
  width: fit-content;
  height: fit-content;
}

.create-button {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  height: fit-content;
  margin-top: 1rem;
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

.driver {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 150px;
  margin: 0 0.6rem;
  flex-wrap: wrap;
}
.rs {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.4rem;
  margin: 0 0.6rem;
  flex-wrap: wrap;
}
.selectAll {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 150px;
  margin: 0.8rem 0.6rem;
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
  width: fit-content;
}

.rsname {
  font-size: 0.9rem;
  font-weight: bold;
  width: fit-content;
}

.label-column {
  text-align: center; /* Alignement horizontal */
  font-weight: bold;
  font-size: 1.2rem;
}

.resources {
  display: flex;
  flex-direction: column;
  border: 1px solid #ddd; /* Light gray border */
  border-radius: 8px; /* Rounded corners */
  padding: 20px;
}

.hr {
  border: 1px solid #ddd;
}
</style>
