<!-- PrintableTable.vue -->
<template>
    <div class="printable">
      <table border="1">
        <thead>
          <tr>
            <th v-for="header in headers" :key="header.key" :style="{ color: header.color }">
              {{ header.title }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in items" :key="row.id">
            <td v-for="header in headers" :key="header.key" :class="{
                'red' : isBreak(row[header.key].matricule),
                'bold-class' : isDriver(row[header.key])
            }">
              {{ row[header.key].matricule? row[header.key].matricule : row[header.key]}}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      headers: {
        type: Array,
        required: true,
      },
      items: {
        type: Array,
        required: true,
      }
    },
    mounted(){
        this.displayData();
    },
    methods: {
        displayData(){
            console.log(this.headers);
            console.log(this.items);
        },
        isBreak(value){
            return value==="B" || value==="DB"
        },
        isDriver(value){
            return value.matricule ? false : true
        }
    }
  }
  </script>
  
  <style scoped>
  .printable{
    max-height: 2000px;
    overflow-y: auto;
  }
  table {
    width: 100%;
    font-size: x-small;
    border-collapse: collapse;
  }
  
  th, td {
    padding: 2px 8px;
    text-align: left;
  }
  .red{
    color: red;
  }
  .bold-class{
    font-weight: bold;
  }
  </style>
  