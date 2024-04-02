<template>
    <div class="main">
        <Sidebar/>
        <div class="right">
            <div>
                <Topbar/>
            </div>
            <div class="content">
            <DashboardNavigation/>
            <RTGhome/>
            </div>
        </div>
        
    </div>
    
  </template>

<script>


</script>

<style scoped>
.main{
    background-color: white;
    height: 100%;
}

.right{
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}
.content{
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}


</style>