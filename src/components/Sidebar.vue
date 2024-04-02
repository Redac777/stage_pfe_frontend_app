<template>
    <v-card>
                <v-navigation-drawer
                v-model="drawer"
                :rail="rail"
                permanent
                @click="rail = false"
                >
                <div class="topitems">
                    <v-list-item
                    prepend-avatar="https://randomuser.me/api/portraits/men/85.jpg"
                    title="John Leider"
                    nav
                    style="color:#F9FBFC "
                >
                    <template v-slot:append>
                    <v-btn icon 
                    @click.stop="rail = !rail" 
                    v-bind:class="{ 'closedrawer': true }"
                    >
                        <v-icon size="small" style="color: white;">
                            mdi-arrow-left
                        </v-icon>
                    </v-btn>
                    </template>
                    
                </v-list-item>

                <v-list-item
                    v-for="(item, index) in items"
                    :key="index"
                    :prepend-icon="item.icon"
                    :title="item.title"
                    :value="item.value"
                    :style="{ color:'#F9FBFC',backgroundColor: item.selected ? 'rgba(217, 217, 217, 0.2)' : '' }"
                    @click="selectItem(index)"
                    nav
                ></v-list-item>
                </div>
                <v-divider></v-divider>
                <div class="bottomitems">
                    <v-btn icon @click="logout">
                        <v-icon size="small" style="color: white;">
                            mdi-logout
                        </v-icon>
                    </v-btn>
                </div>
                </v-navigation-drawer>
    </v-card>
</template>

<script>
   export default {
        data () {
      return {
        drawer: true,
        rail: true,
        items: [
        { icon: "mdi-view-dashboard", title: "Planning", value: "planning", selected: true },
        { icon: "mdi-account-group-outline", title: "Users", value: "users", selected: false },
        { icon: "mdi-crane", title: "Equipments", value: "equipments", selected: false }
      ]
      }
    },
    methods: {
    selectItem(index) {
      this.items.forEach((item, i) => {
        item.selected = i === index;
      });
    },
    logout() {
            // Perform logout logic here
            // For example, redirect the user to the logout page or clear session data
            // After logout, you can navigate to the login page or perform any other required action
        }

  }
    }
</script>

<style scoped>
.v-navigation-drawer{
    height: 100vh;
    
    background-color: #15263F;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    flex-wrap: wrap;
    flex-shrink: 1;
}
.topitems{
    height: 80vh;
}
.bottomitems{
    width: 100%;
    display: flex;
    justify-content: center;

}
.v-btn { 
    background-color: #15263F;
}
.v-list-item{
margin : 1rem 0;
}
</style>