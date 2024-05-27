<template>
  <div class="main-parent">
    <!-- Test -->
    <!-- <div class="test">
      <p>{{ planningData }}</p>
    </div> -->
    <div class="header">
      <h2>Current Shift: {{ actualShift }}</h2>
      <p>Today's Date: {{ todayDate }}</p>
    </div>
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

      <!-- List rtgs with associated switches -->
      <div class="resources">
        <div class="label-column">RTGs</div>
        <div class="selectAll">
          <label class="rtgname">Select All</label>
          <v-switch
            v-model="selectAllRTGs"
            @change="toggleSelectAllRTGs"
            hide-details
          ></v-switch>
        </div>
        <hr class="hr" />
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
import moment from "moment";

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
      selectAll: false,
      selectAllRTGs: false,
      actualShift: null,
      todayDate: "",
      planningId: -1,
      
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

    toggleSelectAllRTGs() {
      if (this.selectAllRTGs) {
        this.selectAllRTGsList();
      } else {
        this.deselectAllRTGsList();
      }
    },
    selectAllRTGsList() {
      this.selectedRTGs = [];
      this.chunkedRTGs.forEach((chunk) => {
        chunk.forEach((rtg) => {
          if (!this.selectedRTGs.includes(rtg)) {
            this.selectedRTGs.push(rtg);
          }
        });
      });
    },
    deselectAllRTGsList() {
      this.selectedRTGs = [];
    },

    // set drivers and equipements data
    async setData() {
      const today = new Date();
      const options = { year: "numeric", month: "long", day: "numeric" };
      this.todayDate = today.toLocaleDateString(undefined, options);
      this.setLoadingValueAction(true);
      if (this.planningData) {
        console.log(JSON.stringify(this.planningData));
        this.actualShift = this.planningData.shift;
        const dateToPlan = new Date(this.planningData.date);
        this.todayDate = dateToPlan.toLocaleDateString(undefined, options);
        const response = await this.setShiftByCategory({
          category: this.planningData.shift,
        });
        // console.log(this.planningData);
        this.inputs = {
          profile_group: "rtg",
          role: "driver",
          shift_id: response[0].id,
        };
      } else {
        this.actualShift = this.getActualShift();
        console.log(this.getActualShift());
        const response = await this.setShiftByCategory({
          category: this.actualShift,
        });
        this.inputs = {
          profile_group: "rtg",
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
      // if (this.selectedDrivers.length !== 0 && this.selectedRTGs !== 0) {
      //   this.drivers = [];
      //   this.rtgs = [];
      //   this.tableHeaders = [];
      //   this.itemsPlanning = [];
      //   this.showConfirmDialog = false;
      //   this.setLoadingValueAction(true);
      //   if (this.planningData) {
      //     const date = new Date(this.planningData.date);
      //     // Get the year, month, and day components
      //     const year = date.getFullYear();
      //     const month = String(date.getMonth() + 1).padStart(2, "0"); // Month starts from 0
      //     const day = String(date.getDate()).padStart(2, "0");
      //     // Construct the formatted date string in "YYYY-mm-dd" format
      //     const formattedDate = `${year}-${month}-${day}`;
      //     this.planning = {
      //       shift_id: this.shiftId,
      //       profile_group_id: this.profileGroupId,
      //       planned_at: formattedDate,
      //     };
      //   } else {
      //     this.planning = {
      //       shift_id: this.shiftId,
      //       profile_group_id: this.profileGroupId,
      //     };
      //   }
      //   this.createPlanningAction(this.planning).then((response) => {
      //     this.planningId = response.id;
      //     const addUserPromises = [];
      //     const addEquipementPromises = [];
      //     for (let driver in this.selectedDrivers) {
      //       let userWPlanning = {
      //         user_id: this.selectedDrivers[driver].id,
      //         planning_id: response.id,
      //       };
      //       this.drivers.push(this.selectedDrivers[driver]);
      //       addUserPromises.push(this.addUserToPlanning(userWPlanning));
      //     }
      //     for (let equ in this.selectedRTGs) {
      //       let equWPlanning = {
      //         equipement_id: this.selectedRTGs[equ].id,
      //         planning_id: response.id,
      //       };
      //       this.rtgs.push(this.selectedRTGs[equ]);
      //       addEquipementPromises.push(
      //         this.addEquipementToPlanning(equWPlanning)
      //       );
      //     }
      //     Promise.all([...addUserPromises, ...addEquipementPromises])
      //       .then(() => {
      //         // All promises have resolved
      //         this.rtgPlanning();
      //       })
      //       .catch((error) => {
      //         this.setLoadingValueAction(false);
      //         // Handle error if any of the promises fail
      //         console.error(error);
      //       });
      //   });
      // }
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

    rtgPlanning() {
      // console.log("drivers : "+JSON.stringify(this.drivers))
      // console.log("rtgs : " + JSON.stringify(this.rtgs))
      // console.log("planning : " + JSON.stringify(this.planning))
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

        const firstValues = [];

        for (let i = 1; i < doubleBreakDrivers.length + 1; i++) {
          firstValues.push(itemsPlanning[i][0]);
        }
        console.log(doubleBreakDrivers);
        console.log(firstValues);
        console.log(itemsPlanning);
        const nonCommonValuesT1 = firstValues.filter(
          (obj1) =>
            !doubleBreakDrivers.some(
              (obj2) => obj1.matricule === obj2.driver.matricule
            )
        );
        const nonCommonValuesT2 = doubleBreakDrivers.filter(
          (obj1) =>
            !firstValues.some(
              (obj2) => obj2.matricule === obj1.driver.matricule
            )
        );
        for (let i = 1; i < nonCommonValuesT1.length + 1; i++) {
          let temp = nonCommonValuesT1[i - 1];
          let driver = this.drivers.find(
            (obj) => obj.matricule === nonCommonValuesT2[i - 1].driver.matricule
          );
          let index = this.drivers.indexOf(driver);
          console.log(index);
          itemsPlanning[i][0] = driver;
          itemsPlanning[index + 1][0] = temp;
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
            planning_id: this.planningId,
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

    // treating sts data
    
  },
};
</script>

<style scoped>
.main-parent {
  display: flex;
  width: fit-content;
  flex-direction: column;
  max-height: 80vh; /* You can adjust this value as needed */
  gap: 0.3rem;
  overflow-y: auto; /* Enable vertical scrolling */
}

.parent {
  margin-top: 1rem;
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
}

.drivers-container,
.rtgs-container {
  display: flex;
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
  width: 120px;
  margin: 0 0.6rem;
  flex-wrap: wrap;
}
.rtg {
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
  width: 120px;
  margin: 0.6rem;
}

.v-switch {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: x-small !important;
}

.drivername,
.rtgname {
  font-size: 0.6rem;
  font-weight: bold;
  width: fit-content;
}

.label-column {
  text-align: center; /* Alignement horizontal */
  font-weight: bold;
  font-size: 1rem;
}

.test {
  display: flex;
  justify-content: center;
  align-items: center;
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
.header {
  background-color: #f5f5f5; /* Light gray background */
  border-bottom: 2px solid #ccc; /* Bottom border */
  padding: 5px 10px; /* Padding for spacing */
  text-align: center; /* Center align the text */
  font-size: 0.7rem; /* Increase font size */
  font-weight: bold; /* Bold text */
  margin-bottom: 0.2rem; /* Space below the header */
}
</style>
