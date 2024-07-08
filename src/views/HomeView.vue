<template>
<div class="search">
  <v-autocomplete
      v-model="search"
      label="Tag"
      id="search"
      :items="tags"
  />
</div>
<div class="tag-info" v-if="tagDetails != null">
  <v-alert v-if="unknownTag" text="This tags purpose is unknown" type="warning" />
  <v-alert v-else :text="tagDetails.desc" type="info" />
</div>
<div v-if="searchResults" class="accordion" id="#results">
  <v-pagination
      v-if="pages > 1"
      v-model="page"
      :length="pages"
      :total-visible="7"
  />
  <v-card
      class="item"
      variant="tonal"
      v-for="(script, script_index) in searchResults"
      :key="`${script_index}`"
      :title="`${script.source_file} - Animation ${script.source_animation}`"
      :subtitle="script.original"
  >
    <template v-slot:append>
      <v-btn :icon="toggleCardIcon(script_index)" @click="toggleCard(script_index)"></v-btn>
    </template>
    <v-list
        density="compact"
        v-model:opened="openedFrames"
        v-if="cardOpened(script_index)"
    >
      <template v-for="(frame, frame_index) in script.data">
        <v-list-item
            v-if="frame.tags.length == 0"
            :key="`${script_index}_${frame_index}_na`"
            :title="`${frame.key}${frame.duration}`"
        >
        </v-list-item>
        <v-list-group
            v-else
            :key="`${script_index}_${frame_index}`"
            :value="`${script_index}_${frame_index}`"
        >
          <template v-slot:activator="{ props }">
            <v-list-item
                v-bind="props"
                :title="`${frame.key}${frame.duration}`"
            />
          </template>

          <v-list-item
              v-for="(tag, tag_index) in frame.tags"
              :class="itemClass(tag.key)"
              :key="`${script_index}_${frame_index}_${tag_index}`"
          >
            <v-container fluid class="ma-0 pa-0">
              <v-row dense>
                <v-col cols="1">{{ tag.key }}</v-col>
                <v-col cols="1">{{ tag.value }}</v-col>
                <v-col cols="3"><span v-for="errata in tag.erratas" :key="errata">{{ errata }}</span></v-col>
                <v-col>{{ itemDesc(tag.key) }}</v-col>
              </v-row>
            </v-container>
          </v-list-item>
        </v-list-group>
      </template>
    </v-list>
  </v-card>
  <v-pagination
      v-if="pages > 1"
      v-model="page"
      :length="pages"
      :total-visible="7"
  />
</div>
</template>

<script setup lang="ts">
import {computed, onMounted, ref, watch} from "vue";
import {getRefs, getScript, getTag, getTags, useDB} from "@/services/db";
import type {IDBPDatabase} from "idb";
import type {Scripts, TagType} from "@/services/types";

const db = ref<IDBPDatabase|null>(null);
const search = ref<string>("");
const tagDetails = ref<TagType|null>(null);
const searchResults = ref<Scripts>([]);
const searchRefs = ref<number[]>([]);
const openedFrames = ref<string[]>([]);
const openedCards = ref<Set<number>>(new Set());
const page = ref(1);
const pages = ref(1);
const pageSize = ref(10);

const tags = ref<string[]>([]);
const descriptions = ref<Map<string, string>>(new Map());

const unknownTag = computed(() => tagDetails.value != null && tagDetails.value.desc === "");

function itemClass(tag: string): string|undefined {
  if (tag === search.value) return "item-interesting";
  return undefined;
}

function toggleCard(index: number): void {
  if (cardOpened(index)) {
    openedCards.value.delete(index)
  } else {
    openedCards.value.add(index);
  }
}

function cardOpened(index: number): boolean {
  return openedCards.value.has(index);
}

function toggleCardIcon(index: number): string {
  if (cardOpened(index)) {
    return "fa fa-caret-down";
  }
  return "fa fa-caret-up";
}

function itemDesc(tag: string): string {
  const value = descriptions.value.get(tag);
  return value ?? "";
}

async function doSearch() {
  if (db.value == null || search.value == null) {
    searchResults.value = [];
    tagDetails.value = null;
    return;
  }
  const [tag, refs] = await Promise.all([
    getTag(db.value, search.value),
    getRefs(db.value, search.value),
  ]);
  tagDetails.value = tag ?? null;
  searchRefs.value = refs;
  pages.value = Math.ceil(refs.length / pageSize.value);
  page.value = 1;
  await updateView();
}

async function updateView() {
  const start = (page.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  const lookup = searchRefs.value.slice(start, end);
  const scripts = await Promise.all(lookup.map(ref => getScript(db.value!, ref)));
  const opened = new Set<string>();

  for (const [script_index, script] of scripts.entries()) {
    for (const [frame_index, frame] of script.data.entries()) {
      for (const tag of frame.tags) {
        if(tag.key === search.value) {
          opened.add(`${script_index}_${frame_index}`);
          break;
        }
      }
    }
  }

  openedFrames.value = Array.from(opened);
  openedCards.value.clear();
  searchResults.value = scripts;
}

watch(page, updateView);
watch(search, doSearch);
onMounted(async () => {
  db.value = await useDB();
  const results = await getTags(db.value);
  for (const tag of results) {
      tags.value.push(tag.tag);
      descriptions.value.set(tag.tag, tag.desc);
  }
});
</script>

<style scoped lang="scss">
.search {
  margin: 1em 25%;
}
.tag-info {
  margin: 1em 25%;
}
.item {
  margin: 1em 25%;
}
.item-interesting {
  background-color: #995544;
}
</style>
