<template>
    <div role="status" class="loading">
        <img src="../../../src/assets/images/loading_gif.gif" alt="loading_gif">
    </div>
</template>

<script>
export default {
}
</script>

<style>
.loading{
    position: absolute;
    z-index: 30;
    inset: 0;
    display: flex;
    justify-content: center;
    align-items: end;
    background-color: rgba(0, 0, 0, 0.5);
}
</style>