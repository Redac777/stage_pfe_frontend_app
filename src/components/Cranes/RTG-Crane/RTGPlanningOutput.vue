<template>
  <div>
    <v-data-table :headers="tableHeaders">
      <template v-slot:item="{ item }">
        <tr>
          <!-- Display driver's full name -->
          <td>{{ item.firstname }} {{ item.lastname }}</td>
          <!-- Display RTGs -->
          <td v-for="sub in this.subsequents">{{ sub }}</td>
        </tr>
      </template>
    </v-data-table>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

export default {
  data() {
    return {
      drivers: [],
      rtgs: [],
      tableHeaders: [],
      planning: [],
      tableItems: [],
    };
  },

  computed: {
    ...mapGetters([
      "getDrivers",
      "getRTGs",
      "getCurrentPlanning",
      "getPlanningDrivers",
      "getPlanningEquipements",
    ]),
  },
  mounted() {
    this.setData();
  },

  methods: {
    ...mapActions([
      "setCurrentPlanning",
      "setLoadingValueAction",
      "setPlanningDrivers",
      "setUserById",
      "setPlanningEquipements",
      "setEquipementById",
    ]),

    async setData() {
      
      let currentDate = new Date();

      // Get year, month, and day
      let year = currentDate.getFullYear();
      let month = (currentDate.getMonth() + 1).toString().padStart(2, "0"); // Months are zero indexed, so we add 1
      let day = currentDate.getDate().toString().padStart(2, "0");
      let formattedDate = year + "-" + month + "-" + day;
      const dateObject = {
        date: formattedDate,
      };
      this.setLoadingValueAction(true);
      try {
        
        await this.setCurrentPlanning(dateObject);
        this.planning = this.getCurrentPlanning;
        if (this.planning) {
          const planningId = {
            planning_id: this.planning[0].id,
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
          this.setLoadingValueAction(false);
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
      let nbrDoubleBreak = nbrSubs - (nbrDrivers % nbrSubs);
      this.drivers = this.drivers.sort(function (a, b) {
        return b.workingHours - a.workingHours;
      });
      let endTime = 7;
      this.tableHeaders.push({
        title: "Driver | Time",
        align: "start",
        sortable: true,
        key: "driver",
      });
      for (let i = 0; i < nbrCols; i++) {
        this.tableHeaders.push({
          title:
            endTime.toFixed(2) +
            " - " +
            (endTime + colDuration / 60).toFixed(2),
          sortable: false,
        }); // Convert endsTime to fixed decimal places
        endTime += colDuration / 60;
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
      let tempDriver = null;
      for (let i = 1; i < nbrDoubleBreak + 1; i++) {
        tempDriver = itemsPlanning[i][0];
        itemsPlanning[i][0] = doubleBreakDrivers[i - 1].driver;
        itemsPlanning[doubleBreakDrivers[i - 1].index][0] = tempDriver;
      }




      const id = 1;
      const arrayToSave = [];
      let parts=[]
      for (let i = 1; i < nbrDrivers + 1; i++) {
        for (let j = 1; j < nbrCols + 1; j++) {
          const equipementId =
            itemsPlanning[i][j] == "P" || itemsPlanning[i][j] == "DP"
              ? null
              : this.rtgs.find((rtg) => rtg.matricule === itemsPlanning[i][j].matricule)
                  ?.id;
              parts = itemsPlanning[0][j+1].title.split('+')[0].split('-');
         

          arrayToSave.push({
            planning_id: this.planning[0].id,
            user_id: itemsPlanning[i][0].id,
            equipement_id: equipementId,
            break:
              itemsPlanning[i][j] == "P" || itemsPlanning[i][j] == "DP"
                ? true
                : false,
            start_time: parseFloat(parts[0]),
            ends_time: parseFloat(parts[1]),
          });
          
        }
      }
      console.log(arrayToSave)
      // console.log(
      //   this.drivers.map((driver) => ({
      //     driverName: driver.firstname + " " + driver.lastname,
      //     driverWorkingHours: driver.workingHours,
      //   }))
      // );
      
    },
  },
};
</script>

<style scoped></style>
