<template>
  <v-container v-if="loading" fluid class="fill-height">
    <v-row justify="center">
      <v-col class="d-flex justify-center">
        <v-progress-circular color="primary" indeterminate :size="64" />
      </v-col>
    </v-row>
  </v-container>
  <v-layout v-else class="container">
    <v-main>
      <h1>String tool</h1>
      <RouterView />
    </v-main>
  </v-layout>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import {onMounted, ref} from "vue";
import {loadData, useDB} from "@/services/db";

const loading = ref(true);

async function setup() {
  const db = await useDB();
  await loadData(db);
  loading.value = false;
  console.info("Data loaded.");
}

onMounted(setup);
</script>

<style scoped lang="scss">
h1 {
  text-align: center;
}
</style>
