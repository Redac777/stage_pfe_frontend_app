<template>
  <div class="main-parent">
    <!-- Test -->
    <!-- <div class="test">
      <p>{{ planningData }}</p>
    </div> -->
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

      <!-- List rtgs with associated switches -->
      <div class="label-column">RTGs</div>
      <div class="rtgs-container">
        <div
          v-for="(chunk, colIndex) in chunkedRTGs"
          :key="colIndex"
          class="column"
        >
          <div v-for="(item, rowIndex) in chunk" :key="rowIndex" class="rtg">
            <div class="rtgname">{{ item.matricule }}</div>
            <v-switch
              v-model="selectedRTGs"
              :value="item"
              hide-details
            ></v-switch>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Button  -->
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
      equipementType="RTG"
      v-model="showConfirmDialog"
      @validateSelections="createPlanning"
      @removeDriver="removeDriver"
      @removeEquipement="removeEquipement"
      :selectedDrivers="selectedDrivers"
      :selectedEqus="selectedRTGs"
      @closeDialog="showConfirmDialog = false"
    />
  </div>
</template>

<script>
import ConfirmDialog from "../ConfirmDialog.vue";
import { mapGetters, mapActions } from "vuex";

export default {
  components: {
    ConfirmDialog,
  },

  //props
  props: {
    planningData: {
      type: Object,
      default: null,
    },
  },

  //data
  data() {
    return {
      driversList: [],
      rtgsList: [],
      selectedDrivers: [],
      selectedRTGs: [],
      tableItems: [],
      arrayToSave: [],
      showConfirmDialog: false,
      shiftId: null,
      profileGroupId: null,
      drivers: [],
      rtgs: [],
      tableHeaders: [],
      inputs: null,
      planning: null,
      allPlannings: [],
    };
  },

  // computed
  computed: {
    //include getters
    ...mapGetters([
      "getDrivers",
      "getEquipements",
      "getCurrentPlanning",
      "getPlanningDrivers",
      "getPlanningEquipements",
      "getPlannings",
    ]),
    // returns array of 6 drivers per chunk
    chunkedDrivers() {
      if (this.driversList) return this.chunkArray(this.driversList, 6);
    },

    // returns array of 6 rtgs per chunk
    chunkedRTGs() {
      return this.chunkArray(this.rtgsList, 6);
    },
  },

  //mounted
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
      "setCurrentPlanning",
      "setPlanningDrivers",
      "setUserById",
      "setPlanningEquipements",
      "setEquipementById",
      "setBoxAction",
      "setShiftByCategory",
    ]),

    // set drivers and equipements data
    async setData() {
      this.setLoadingValueAction(true);
      if (this.planningData) {
        console.log(this.planningData)
        const response = await this.setShiftByCategory({
          category: this.planningData.shift,
        });
        this.inputs = {
          profile_group: "rtg",
          role: "driver",
          shift_id: response[0].id,
        };
      } else {
        this.inputs = {
          profile_group: "rtg",
          role: "driver",
        };
      }
      console.log(this.inputs);
      this.setDriversAction(this.inputs).then(() => {
        this.driversList = this.getDrivers;
        if (this.driversList.length > 0) {
          this.shiftId = this.driversList[0].shift_id;
        }
      });
      this.setEquipementsAction().then(() => {
        this.rtgsList = this.getEquipements.filter(
          (equipement) => equipement.profile_group.type === "rtg"
        );
        this.setLoadingValueAction(false);
        if (this.rtgsList.length > 0) {
          this.profileGroupId = this.rtgsList[0].profile_group.id;
        }
      });
    },

    //open confirm Dialog
    openConfirmDialog() {
      this.showConfirmDialog = true;
    },

    // splits array into chunks of size
    chunkArray(arr, size) {
      return arr.reduce(
        (acc, _, i) =>
          i % size === 0 ? [...acc, arr.slice(i, i + size)] : acc,
        []
      );
    },

    // returns selected drivers and rtgs
    createPlanning() {
      this.drivers = [];
      this.rtgs = [];
      this.tableHeaders = [];
      this.itemsPlanning = [];
      this.showConfirmDialog = false;
      this.setLoadingValueAction(true);
      if (this.planningData) {
        const date = new Date(this.planningData.date);
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
      this.createPlanningAction(this.planning).then((response) => {
        const addUserPromises = [];
        const addEquipementPromises = [];
        for (let driver in this.selectedDrivers) {
          let userWPlanning = {
            user_id: this.selectedDrivers[driver].id,
            planning_id: response.id,
          };
          addUserPromises.push(this.addUserToPlanning(userWPlanning));
        }

        for (let equ in this.selectedRTGs) {
          let equWPlanning = {
            equipement_id: this.selectedRTGs[equ].id,
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

    //remove driver from confirm dialog
    removeDriver(driver) {
      this.selectedDrivers = this.selectedDrivers.filter(
        (item) => item !== driver
      );
    },

    //remove rtg from confirm dialog
    removeEquipement(equ) {
      this.selectedRTGs = this.selectedRTGs.filter((item) => item !== equ);
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
        profileType: "rtg",
      };

      try {
        // let type = "rtg";
        await this.setCurrentPlanning(dateObject);
        this.allPlannings = this.getPlannings;
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
            }
          }

          const equipementPlanning = this.getPlanningEquipements;
          if (equipementPlanning) {
            for (let equP in equipementPlanning) {
              const equipement = {
                equipement_id: equipementPlanning[equP].equipement_id,
              };
              const response = await this.setEquipementById(equipement);
              this.rtgs.push(response);
            }
          }

          this.rtgPlanning(); // Call rtgPlanning() after all promises have resolved
        }
      } catch (error) {
        this.setLoadingValueAction(false);
        console.error(error);
        // Handle error
      }
    },

    rtgPlanning() {
      let nbrDrivers = this.drivers.length;
      let nbrRtgs = this.rtgs.length;
      let nbrSubs = nbrDrivers - nbrRtgs;
      let nbrCols = Math.ceil(nbrDrivers / nbrSubs);
      let colDuration = 480 / nbrCols;
      let divNbrDriverPerNbrSubs = nbrDrivers % nbrSubs;
      let nbrDoubleBreak =
        divNbrDriverPerNbrSubs != 0 ? nbrSubs - divNbrDriverPerNbrSubs : 0;
      this.drivers = this.drivers.sort(function (a, b) {
        return b.workingHours - a.workingHours;
      });
      let currentTime = new Date().getHours();
      let startTime = 0;
      switch (true) {
        case currentTime >= 7 && currentTime <= 14: // Between 7h and 14h59
          startTime = 7;
          break;
        case currentTime >= 15 && currentTime <= 22: // Between 15h and 22h59
          startTime = 15;
          break;
        default: // Between 23h and 24h or 00h and 6h59
          startTime = 23;
          break;
      }
      for (let i = 0; i < nbrCols; i++) {
        let hours = Math.floor(startTime); // Extract whole hours
        let minutes = Math.round((startTime - hours) * 60); // Extract remaining minutes and round

        // Adjust minutes if they exceed 60
        if (minutes >= 60) {
          hours += 1; // Increment hours
          minutes -= 60; // Subtract 60 from minutes
        }

        // Format startTime as "hh:mm"
        let startTimeFormatted =
          hours + ":" + (minutes < 10 ? "0" : "") + minutes;

        // Calculate endTime
        let endTime = startTime + colDuration / 60;

        let endTimeHours = Math.floor(endTime); // Extract whole hours for end time
        let endTimeMinutes = Math.round((endTime - endTimeHours) * 60); // Extract remaining minutes and round

        // Adjust endTime if minutes exceed 60
        if (endTimeMinutes >= 60) {
          endTimeHours += 1; // Increment hours
          endTimeMinutes -= 60; // Subtract 60 from minutes
        }

        // Format endTime as "hh:mm"
        let endTimeFormatted =
          endTimeHours +
          ":" +
          (endTimeMinutes < 10 ? "0" : "") +
          endTimeMinutes;

        // Push start and end times to the tableHeaders array
        this.tableHeaders.push({
          title: startTimeFormatted + " - " + endTimeFormatted,
          sortable: false,
        });

        // Update startTime for the next iteration
        startTime = endTimeHours + endTimeMinutes / 60;
      }
      const itemsPlanning = [];
      itemsPlanning.push(["Drivers | Time", ...this.tableHeaders]);

      for (let i = 0; i < nbrDrivers; i++) {
        itemsPlanning.push(Array(nbrCols + 1).fill(this.drivers[i]));
      }

      let k = 0;
      for (let i = 1; i < nbrDrivers + 1; i += nbrSubs) {
        k++;
        let maxJ = i + nbrSubs;
        if (maxJ > nbrDrivers) maxJ = maxJ - nbrDoubleBreak;
        for (let j = i; j < maxJ; j++) {
          itemsPlanning[j][k] = "P";
        }
      }

      let startDoubleBreak = itemsPlanning.length - nbrSubs;
      let rtgsIndex = 0;
      for (let j = 1; j < nbrCols + 1; j++) {
        rtgsIndex = 0;
        for (let i = 1; i < nbrDrivers + 1; i++) {
          if (itemsPlanning[i][j] != "P") {
            if (rtgsIndex < this.rtgs.length) {
              // Check if rtgsIndex is within bounds
              itemsPlanning[i][j] = this.rtgs[rtgsIndex];
              rtgsIndex++;
            } else {
              // Handle the case when rtgsIndex exceeds the length of rtgs array
              // For example, you can break the loop or handle it according to your logic.
              break;
            }
          }
        }
      }
      if (nbrDoubleBreak != 0) {
        for (
          let i = startDoubleBreak;
          i < startDoubleBreak + nbrDoubleBreak;
          i++
        ) {
          itemsPlanning[i][k] = "DP";
        } 
        const doubleBreakDrivers = [];

        for (let i = 1; i < nbrDrivers + 1; i++) {
          if (itemsPlanning[i][nbrCols] == "DP") {
            doubleBreakDrivers.push({
              index: i,
              driver: itemsPlanning[i][0],
            });
          }
        }


        const firstValues = []
        
        for(let i=1 ; i<doubleBreakDrivers.length+1;i++){
            firstValues.push(itemsPlanning[i][0])
        }
        console.log(doubleBreakDrivers)
        console.log(firstValues)
        console.log(itemsPlanning)
        const nonCommonValuesT1 = firstValues.filter(obj1 => !doubleBreakDrivers.some(obj2 => obj1.matricule === obj2.driver.matricule));
        const nonCommonValuesT2 = doubleBreakDrivers.filter(obj1=> !firstValues.some(obj2 => obj2.matricule === obj1.driver.matricule));
        for(let i = 1;i<nonCommonValuesT1.length+1;i++){
            let temp = nonCommonValuesT1[i-1]
            let driver = this.drivers.find(obj=>obj.matricule===nonCommonValuesT2[i-1].driver.matricule)
            let index = this.drivers.indexOf(driver)
            console.log(index)
            itemsPlanning[i][0] = driver
            itemsPlanning[index+1][0] = temp
        }

      }

      const id = 1;
      let parts = [];
      for (let i = 1; i < nbrDrivers + 1; i++) {
        for (let j = 1; j < nbrCols + 1; j++) {
          const equipementId =
            itemsPlanning[i][j] == "P" || itemsPlanning[i][j] == "DP"
              ? null
              : this.rtgs.find(
                  (rtg) => rtg.matricule === itemsPlanning[i][j].matricule
                )?.id;
          parts = itemsPlanning[0][j].title.split("+")[0].split("-");

          const boxObject = {
            planning_id: this.planning.id,
            user_id: itemsPlanning[i][0].id,
            equipement_id: equipementId,
            break:
              itemsPlanning[i][j] == "P" || itemsPlanning[i][j] == "DP"
                ? true
                : false,
            start_time: parts[0],
            ends_time: parts[1],
          };
          console.log(boxObject);
          this.arrayToSave.push(boxObject);
        }
      }
      this.confirmPlanning(itemsPlanning);

      // console.log(
      //   this.drivers.map((driver) => ({
      //     driverName: driver.firstname + " " + driver.lastname,
      //     driverWorkingHours: driver.workingHours,
      //   }))
      // );
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
.rtgs-container {
  display: flex;
  gap: 2rem;
}

.column {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.driver,
.rtg {
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

.rtgname {
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

.test {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
