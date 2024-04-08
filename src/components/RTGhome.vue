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
            <div class="drivername">{{ item }}</div>
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
            <div class="rtgname">{{ item }}</div>
            <v-switch
              v-model="selectedRTGs"
              :value="item"
              hide-details
            ></v-switch>
          </div>
        </div>
      </div>
    </div>

    <!-- Start Button  -->
    <div class="start-button">
      <v-btn
        @click="getData"
        density="default"
        style="background-color: #15263f; color: white; width: 120px"
        >Start</v-btn
      >
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
export default {
  data() {
    return {
      driversList: [],
      rtgsList: [
        "RTG1",
        "RTG2",
        "RTG3",
        "RTG4",
        "RTG5",
        "RTG6",
        "RTG7",
        "RTG8",
        "RTG9",
        "RTG10",
        "RTG11",
        "RTG12",
        "RTG13",
        "RTG14",
        "RTG15",
        "RTG16",
        "RTG17",
        "RTG18",
        "RTG19",
        "RTG20",
        "RTG21",
        "RTG22",
      ],
      selectedDrivers: [],
      selectedRTGs: [],
    };
  },
  computed: {
    ...mapGetters(["getDrivers"]),
    // returns array of 6 drivers per chunk
    chunkedDrivers() {
      if (this.driversList) return this.chunkArray(this.driversList, 6);
    },

    // returns array of 6 rtgs per chunk
    chunkedRTGs() {
      return this.chunkArray(this.rtgsList, 6);
    },
  },

  mounted() {
    this.setDrivers();
  },
  methods: {
    ...mapActions(["setDriversAction", "setLoadingValueAction"]),
    setDrivers() {
      const inputs = {
        profile_group: "rtg",
        role: "driver",
      };
      this.setLoadingValueAction(true);
      this.setDriversAction(inputs).then(() => {
        this.setLoadingValueAction(false);
        this.driversList = this.getDrivers.map(
          (driver) => driver.firstname + " " + driver.lastname
        );
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

    // returns selected drivers and rtgs
    getData() {
      console.log("Selected drivers : " + this.selectedDrivers);
      console.log("Selected RTGs : " + this.selectedRTGs);
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
.start-button {
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
</style>
