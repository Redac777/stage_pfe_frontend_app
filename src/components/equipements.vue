<template>
    <div class="parentContainer">
        <div class="container">
            <div class="text-center">
                <v-snackbar v-model="snackbar" :timeout="timeout !== null ? timeout : undefined">
                    <span v-html="text">

                    </span>

                    <template v-slot:actions>
                        <v-btn color="blue" variant="text" @click="snackbar = false">
                            Close
                        </v-btn>
                    </template>

                </v-snackbar>
            </div>
            <div class="searchContainer">
                <v-text-field v-model="search" label="Search" prepend-inner-icon="mdi-magnify" variant="outlined"
                    hide-details single-line class="search"></v-text-field>
            </div>

            <v-data-table :headers="headers" :items="filteredEquipements" :search="search" class="table">
                <!-- Add new equipement part -->
                <template v-slot:top>
                    <v-toolbar flat v-bind:class="{ 'addEquipementButtonZone': true }">

                        <!-- Dialog to add newequipement -->
                        <v-dialog v-model="dialog" max-width="500px">
                            <!-- Button to display addequipement dialog -->
                            <template v-slot:activator="{ props }">
                                <div class="addActions">
                                    <div>
                                        <v-btn icon color="white" @click="openFileDialog"
                                            v-bind:class="{ 'importEquipementsButton': true }">
                                            <v-icon size="small">
                                                mdi-upload
                                            </v-icon>
                                            <input type="file" ref="fileInput" style="display: none" accept=".xls,.xlsx"
                                                @change="handleFileUpload">
                                        </v-btn>
                                    </div>
                                    <div class="addEquipementButtonStyle">
                                        <v-btn icon v-bind="props" color="white"
                                            v-bind:class="{ 'addEquipementButton': true }">
                                            <v-icon size="small">
                                                mdi-crane
                                            </v-icon>
                                        </v-btn>
                                    </div>
                                </div>

                            </template>
                            <!-- Add dialog content -->
                            <v-card class="dialog">
                                <div class="dialogTop">
                                    <div>
                                        <v-card-title class="dialogAddEquipementTitleContainer">
                                            <span class="text-h5">{{ dialogType === 'edit' ? 'Edit equipement' : 'New equipement'
                                                }}</span>
                                        </v-card-title>
                                    </div>

                                </div>
                                <v-form @submit.prevent="save">
                                    <v-card-text>
                                        <v-container>
                                            <v-row cols="16">
                                                <v-col cols="16">
                                                    <v-text-field v-model="equipement.matricule" label="Matricule"
                                                        class="custom-text-field"
                                                        :rules="[submitClicked ? requiredRule(equipement.matricule, 'matricule') : () => true]"></v-text-field>
                                                </v-col>
                                            </v-row>
                                            <v-row cols="16">
                                                <v-col cols="16">
                                                    <v-select :items="profileGroups" density="default" item-title="type"
                                                        item-value="id" label="Profile Groups"
                                                        v-model="equipement.profile_group_id"
                                                        :rules="[submitClicked ? requiredRule(equipement.profile_group_id, 'profile_group') : () => true]">
                                                        ></v-select>
                                                </v-col>
                                            </v-row>

                                            <v-row cols="16" v-if="dialogType === 'edit'">
                                                <v-col cols="16">
                                                    <div>
                                                        <label for="radio-group"
                                                            style="font-weight: bold;">Status:</label>
                                                        <v-radio-group v-model="equipement.status" id="radio-group" inline>
                                                            <v-radio label="Works" value=1></v-radio>
                                                            <v-radio label="Out of service" value=0></v-radio>
                                                        </v-radio-group>
                                                    </div>
                                                </v-col>
                                            </v-row>
                                        </v-container>

                                    </v-card-text>
                                    <!-- Actions to save or cancel -->
                                    <v-card-actions>
                                        <v-spacer></v-spacer>
                                        <v-btn color="white" class="dialogCancel" variant="text" @click="close">
                                            Cancel
                                        </v-btn>
                                        <v-btn color="white" variant="text" class="dialogOk" type="submit">
                                            Save
                                        </v-btn>
                                    </v-card-actions>
                                </v-form>
                            </v-card>
                        </v-dialog>
                        <!-- Dialog for delete confirm-->
                        <v-dialog v-model="dialogDelete" max-width="500px">
                            <v-card>
                                <v-card-title class="dialogText">Are you sure you want to delete this
                                   equipement ?</v-card-title>
                                <v-card-actions>
                                    <v-spacer></v-spacer>
                                    <v-btn class="dialogCancel" variant="text" @click="closeDelete">Cancel</v-btn>
                                    <v-btn class="dialogOk" variant="text" @click="deleteItemConfirm">OK</v-btn>
                                    <v-spacer></v-spacer>
                                </v-card-actions>
                            </v-card>
                        </v-dialog>
                    </v-toolbar>
                </template>
                <template v-slot:item="{ item }">
                    <tr :class="{ 'inactive-equipement': item.status === 0 }">
                        <td>{{ item.matricule }}</td>
                        <td>{{ item.profile_groupName }}</td>
                        <td>
                            <div class="actions">
                                <v-btn icon class="icon" size="small" color="green-darken-4" @click="editItem(item)">
                                    <v-icon>
                                        mdi-pencil
                                    </v-icon>
                                </v-btn>

                                <v-btn icon class="icon" size="small" color="red" @click="deleteItem(item)">
                                    <v-icon>
                                        mdi-delete
                                    </v-icon>
                                </v-btn icon>
                            </div>
                        </td>
                    </tr>
                </template>
            </v-data-table>
        </div>
    </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import * as XLSX from 'xlsx';
export default {
    data: () => ({
        dialog: false,
        dialogDelete: false,
        dialogReset: false,
        editedItem: null,
        search: '',
        dialogType: '',
        snackbar: false,
        text: '',
        notAddedEquipements: [],
        timeout: 2500,
        selectedValue: "",
        profileGroups: [],
        file: {
            name: '',
        },
        reader: null,
        fileRead: false,
       equipement: {
            id: -1,
            matricule: "",
            profile_group_id: "",
            profile_groupName: "",
            status: -1
        },
        headers: [
            {
                title: 'Matricule',
                sortable: true,
                key: 'matricule',
            },
            {
                title: 'Profile Group',
                sortable: false,
                key: 'profile_group',
            },
            {
                title: 'Actions',
                sortable: false,
                key: 'actions',
            }
        ],
        equipements: [],
        searchQuery: '',
        filteredEquipements: [],
        submitClicked: false,
    }),

    computed: {
        ...mapGetters(["getEquipements", "getProfileGroups"]),

    },

    watch: {
        dialog(val) {
            val || this.close()
        },
        dialogDelete(val) {
            val || this.closeDelete()
        },
        selectedValue(newValue) {
            console.log(newValue);
        }
    },
    mounted() {
        this.refreshEquipementsTable();
    },

    methods: {

        ...mapActions([
            "setEquipementsAction",
            "setLoadingValueAction",
            "deleteEquipementAction",
            "addEquipementAction",
            "editEquipementAction",
            "setProfileGroupsAction"
        ]),
       

        requiredRule(field, fieldName) {
            return field || field === 0 ? true : `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} field is required`;
        },

        refreshEquipementsTable(val) {
            this.setLoadingValueAction(true)
            this.setEquipementsAction()
                .then((response) => {
                    this.equipements = this.getEquipements;
                    this.filteredEquipements = this.equipements.map(item => ({
                        matricule: item.matricule,
                        profile_groupName: item.profile_group ? item.profile_group.type : 'none',
                        status: item.status,
                        id: item.id,
                        profile_group_id:item.profile_group_id
                    }))
                    if (val) {
                        this.text = val.text
                        if (this.notAddedEquipements.length > 0) {
                            this.timeout = null
                            this.snackbar = true
                            this.notAddedEquipements = []
                        }
                        else {
                            this.timeout = 1500
                            this.snackbar = true
                        }

                    }
                })
                .catch(error => {
                    console.error("Setequipements error:", error);
                    this.setLoadingValueAction(false)
                });
               
            this.setProfileGroupsAction().then(() => {
                this.setLoadingValueAction(false)
                this.profileGroups = this.getProfileGroups.map((profileGroup) => ({
                    type: profileGroup.type,
                    id: profileGroup.id
                }))
            })

        },

        editItem(item) {
            this.editedItem = { ...item };
            this.editedIndex = item.id;
            this.dialogType = 'edit';
            this.dialog = true;
            // Populate otherequipement details
            this.equipement.id = this.editedIndex;
            this.equipement.matricule = this.editedItem.matricule;
            this.equipement.profile_group_id = this.editedItem.profile_group_id;
            this.equipement.status = String(this.editedItem.status);
        },

        deleteItem(item) {
            this.editedItem = { ...item };
            this.editedIndex = item.id;
            this.dialogDelete = true;
        },

        deleteItemConfirm() {
            this.setLoadingValueAction(true)
            this.deleteEquipementAction(this.editedIndex).then((response) => {
                this.setLoadingValueAction(false)
                this.refreshEquipementsTable({ text: "equipement deleted successfully" })
            }).catch(error => {
                console.error("Deleteequipement error:", error);
                this.setLoadingValueAction(false)
                this.text = "error deletingequipement"
                this.snackbar = true
            });
            this.closeDelete()
        },

        close() {
            this.dialog = false
            this.$nextTick(() => {
                this.editedItem = Object.assign({}, this.defaultItem)
                this.editedIndex = -1
            })
            this.dialogType = ''
            this.equipement.matricule = ''
            this.equipement.profile_group_id = ''
            this.equipement.status = ''
        },
        closeDelete() {
            this.dialogDelete = false
            this.$nextTick(() => {
                this.editedItem = Object.assign({}, this.defaultItem)
                this.editedIndex = -1
            })
        },

        save() {
            this.submitClicked = true
            if (!this.equipement) {
                console.log("Equipement Not Defined")
            }
            const equipementToSend = { ...this.equipement };
            delete equipementToSend.id;
            delete equipementToSend.profile_groupName;
            if (!equipementToSend || Object.values(equipementToSend).some(value => !value)) {
                console.log("Invalidequipement",equipementToSend)
                return;
            }
            else {
                if (this.dialogType == "edit") {
                    this.setLoadingValueAction(true)
                    this.editEquipementAction(this.equipement)
                        .then((response) => {
                            this.setLoadingValueAction(false)
                            if (response)
                                this.refreshEquipementsTable({ text: "equipement edited successfully" })
                            else {
                                this.text = "error editing equipement"
                                this.snackbar = true
                            }
                        }).catch(error => {
                            console.error("Edit equipement error:", error);
                            this.setLoadingValueAction(false)
                            this.text = "error editing equipement"
                            this.snackbar = true
                        });
                    this.close()
                }
                else {
                    delete equipementToSend.status;
                    this.setLoadingValueAction(true)
                    this.addEquipementAction(equipementToSend).then((response) => {
                        this.setLoadingValueAction(false)
                        if (response)
                            this.refreshEquipementsTable({ text: "equipement added successfully" })
                        else {
                            this.text = "error addingequipement"
                            this.snackbar = true
                        }
                    }).catch(error => {
                        console.error("Registerequipement error:", error);
                        this.setLoadingValueAction(false)
                        this.text = "error addingequipement"
                        this.snackbar = true
                    });
                    // console.log(equipementToSend)
                    this.close()
                }

            }
        },
        openFileDialog() {
            this.$refs.fileInput.click();
        },
        importEquipements(reader, file) {
            reader.onload = (e) => {
                const data = new Uint8Array(e.target.result); // Convert file data to Uint8Array
                const workbook = XLSX.read(data, { type: 'array' }); // Read the Excel file
                const sheetName = workbook.SheetNames[0]; // Get the name of the first sheet
                const worksheet = workbook.Sheets[sheetName]; // Get the worksheet
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }); // Convert worksheet to JSON
                // Now you can work with the jsonData array containing your Excel data
                const texts = [];
                this.setLoadingValueAction(true);
                const promises = [];
                
                for (const row in jsonData) {
                    const profileGroup = this.profileGroups.find((profileGroup) => profileGroup.type == jsonData[row][1]);
                    if (row != 0) {
                        const equipement = {
                            matricule: jsonData[row][0],
                            profile_group_id: profileGroup? profileGroup.id : null,
                        };
                        const promise = this.addEquipementAction(equipement)
                            .then((response) => {
                                if (!response) {
                                    this.notAddedEquipements.push(equipement.matricule);
                                }
                            })
                            .catch(error => {
                                console.log("error adding equipement:", error);
                                this.notAddedEquipements.push(equipement.matricule);
                            });
                        promises.push(promise);
                    }
                }
                Promise.all(promises)
                    .then(() => {
                        this.setLoadingValueAction(false);
                        this.refreshEquipementsTable({ text: " Importing equipements done" + '<br>' + "Error adding equipements : " + (this.notAddedEquipements.length > 0 ? this.notAddedEquipements.join(", ") : "none") });
                        this.reader = null
                        this.file = {
                            name: ""
                        }
                    });
            };
            reader.readAsArrayBuffer(file);
        },
        handleFileUpload(event) {
            // Handle file upload logic here
            this.file = event.target.files[0]; // Get the selected file
            this.reader = new FileReader();
            this.importEquipements(this.reader, this.file)
            event.target.value = null;
        }
    },


}
</script>
<style scoped>
.container {
    display: grid;
    grid-template-rows: 10vh 10vh 70vh;
}

.addEquipementButtonZone {
    background-color: white;
    height: 30px;
    margin-bottom: 2rem;
}

.addEquipementButton {
    border: 1px solid gray;
    background-color: darkblue;
}

.addEquipementButtonStyle {
    width: fit-content;
    display: flex;
    justify-content: end;
    align-items: center;
}

.parentContainer {
    width: 100%;
    scroll-behavior: none;
}

.searchContainer {
    margin: auto;
    width: 60vw;
}

.dialogText {
    font-size: medium;
    background-color: white;
    text-align: center;
}

.dialogCancel {
    background-color: red;
    color: white;
}

.dialogCancel:hover {
    background-color: darkred;
}

.dialogOk {
    background-color: blue;
    color: white;
}

.dialogOk:hover {
    background-color: darkblue;
}

.dialogAddEquipementTitleContainer {
    display: flex;
    width: 100%;
    justify-content: start;
    margin-left: 15px;
    padding-top: 15px;
}

.actions {
    display: flex;
    justify-content: start;
    align-items: center;
}

.icon {
    margin: 6px;
}

.inactive-equipement {
    color: lightsalmon;
}

.dialog {
    z-index: 20;
}

.dialogTop {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.importfile {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin-top: 6px;
}

.importfile p {
    font-size: small;
}

.addActions {
    width: 100%;
    display: flex;
    justify-content: end;
    align-items: center;
    padding-right: 5%;
    gap: 2%;
}

.importEquipementsButton {
    border: 1px solid gray;
    background-color: black;
}
</style>