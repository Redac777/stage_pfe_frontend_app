<template>
  <v-dialog>
    <v-card>
      <v-card-title>Selected Items</v-card-title>

      <v-card-text>
        <!-- Drivers -->
        <div>
          <h4 v-if="equipementType != 'AM'">Selected Drivers</h4>
          <h4 v-if="equipementType == 'AM'">Selected AMS</h4>
          <div class="drivers">
            <ul
              v-for="(chunk, colIndex) in chunkedDrivers"
              :key="colIndex"
              class="column"
            >
              <li
                v-for="(driver, rowIndex) in chunk"
                :key="rowIndex"
                class="driver"
              >
                {{ driver.firstname + " " + driver.lastname }}
                <v-btn class="remove" @click="removeDriver(driver)">
                  <span style="color: red; font-size: 36px">-</span>
                </v-btn>
              </li>
            </ul>
          </div>
        </div>

        <!-- RTGS -->
        <div v-if="equipementType == 'RTG'">
          <h4>Selected RTGs</h4>
          <div class="equipements">
            <ul
              v-for="(chunk, colIndex) in chunkedEquipements"
              :key="colIndex"
              class="column"
            >
              <li v-for="(equ, rowIndex) in chunk" :key="rowIndex" class="equ">
                {{ equ.matricule }}
                <v-btn class="remove" @click="removeEquipement(equ)">
                  <span style="color: red; font-size: 36px">-</span>
                </v-btn>
              </li>
            </ul>
          </div>
        </div>

        <!-- STS && AM (TA STS Crane) -->
        <div v-if="equipementType == 'STS' || equipementType == 'AM'">
          <h4>Selected TA STSs</h4>
          <div class="stss">
            <div v-for="(item, index) in selectedEqus" :key="index" class="sts">
              <div class="stsname">{{ item }}</div>
              <ul class="intervals">
                <li
                  v-for="(interval, intervalIndex) in intervals[item]"
                  :key="intervalIndex"
                  class="equ"
                >
                  {{ interval.startTime }} - {{ interval.endTime }}
                </li>
              </ul>
              <v-btn class="remove" @click="removeEquipement(item)">
                <span style="color: red; font-size: 36px">-</span>
              </v-btn>
            </div>
          </div>
        </div>

        <!-- RSS -->
        <div v-if="equipementType == 'RS'">
          <h4>Selected RSs</h4>
          <div class="rss">
            <div v-for="(item, index) in selectedEqus" :key="index" class="rs">
              <div class="rsname">{{ item }}</div>
              <div class="equ">
                {{ rssStates[index].state }}
              </div>
              <v-btn class="remove" @click="removeEquipement(item)">
                <span style="color: red; font-size: 36px">-</span>
              </v-btn>
            </div>
          </div>
        </div>

        <!-- AMS (ST STS Crane) -->
        <div v-if="equipementType == 'AM'">
          <h4>Selected ST STS</h4>
          <div class="rss">
            <div v-for="item in workers" :key="item" class="rs">
              <div class="rsname">{{ item.STS }}</div>
              <div class="equ">
                {{ item.worker }}
              </div>
              <v-btn class="remove" @click="removeSTSTS(item.STS)">
                <span style="color: red; font-size: 36px">-</span>
              </v-btn>
            </div>
          </div>
        </div>

        <!-- AMS (AM Roles) -->
        <div v-if="equipementType == 'AM'">
          <h4>Selected AM Roles</h4>
          <div class="rss">
            <div v-for="item in selectedRoles" :key="item" class="rs">
              <div class="rsname">{{ item }}</div>
              <div class="equ">
                {{ numWorkers[item] }}
              </div>
              <v-btn class="remove" @click="removeAMRole(item)">
                <span style="color: red; font-size: 36px">-</span>
              </v-btn>
            </div>
          </div>
        </div>
      </v-card-text>

      <!-- Dialog actions -->
      <v-card-actions class="dialogActions">
        <v-btn
          density="default"
          style="background-color: #15263f; color: white; width: 120px"
          @click="validateSelections"
          >Confirm</v-btn
        >
        <v-btn @click="closeDialog">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: [
    "selectedEqus",
    "selectedDrivers",
    "equipementType",
    "intervals",
    "rssStates",
    "workers",
    "selectedRoles",
    "numWorkers",
  ],

  computed: {
    // returns array of 6 drivers per chunk
    chunkedDrivers() {
      if (this.selectedDrivers) return this.chunkArray(this.selectedDrivers, 6);
    },

    // returns array of 6 rtgs per chunk
    chunkedEquipements() {
      if (this.selectedEqus) return this.chunkArray(this.selectedEqus, 6);
    },
  },

  methods: {
    // Emit validation event
    validateSelections() {
      // Perform validation or further actions here
      this.$emit("validateSelections"); // Emit a custom event to notify the parent component
    },

    // Emit close event
    closeDialog() {
      this.$emit("closeDialog"); // Emit an update event to synchronize the dialog prop with the parent
    },

    // Emit remove driver event
    removeDriver(driver) {
      this.$emit("removeDriver", driver);
    },

    // Emit remove equipement event
    removeEquipement(equ) {
      this.$emit("removeEquipement", equ);
    },

    // Emit remove ST STS event
    removeSTSTS(sts) {
      this.$emit("removeSTSTS", sts);
    },

    // Emit remove AM Role event
    removeAMRole(role) {
      this.$emit("removeAMRole", role);
    },

    // Helper function to split an array into chunks
    chunkArray(arr, size) {
      return arr.reduce(
        (acc, _, i) =>
          i % size === 0 ? [...acc, arr.slice(i, i + size)] : acc,
        []
      );
    },
  },
};
</script>

<style scoped>
/* Add your dialog styling here */
.remove {
  box-shadow: none;
  display: flex;
  justify-content: center;
  align-items: center;
}

.v-dialog {
  max-width: 80%;
  min-width: fit-content;
}

.driver,
.equ {
  font-size: small;
  display: flex;
  align-items: center;
}

.v-card-title {
  font-weight: bolder;
  margin: 0.4rem 0.6rem;
}

.dialogActions {
  display: flex;
  justify-content: end;
}

.v-card-text {
  display: flex;
  justify-content: space-between;
}

.column {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.drivers,
.equipements {
  display: flex;
}

.stss,
.rss {
  font-size: small;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.sts,
.rs {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.intervals,
.states {
  display: flex;
  gap: 1rem;
}
</style>
