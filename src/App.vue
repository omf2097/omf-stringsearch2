<template>
  <div class="container">
    <header>
      <h1>String tool</h1>
    </header>
    <main>
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'

</script>

<style scoped lang="scss">
h1 {
  text-align: center;
}
</style>
