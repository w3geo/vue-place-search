<template>
  <v-autocomplete
    v-model="model"
    v-model:search="search"
    hide-details
    single-line
    variant="outlined"
    auto-select-first
    clearable
    density="compact"
    prepend-inner-icon="mdi-magnify"
    :items="items"
    :loading="!!abortController"
    item-title="properties.name"
    hide-no-data
    :custom-filter="filter"
    label="Ort, Adresse, Flurname,..."
    return-object
    class="rounded"
    @click:clear="clear"
  >
    <template v-slot:item="{ props, item }">
      <v-list-item
        v-bind="props"
        :subtitle="item.raw.type"
        :title="item.raw.properties.name"
      ></v-list-item>
    </template>
  </v-autocomplete>
</template>

<script setup>
import { ref, shallowRef, watch } from "vue";
import { usePlaceSearch } from "../composables/usePlaceSearch.js";
import { objectTypes } from "../constants.js";
import {quickScore} from "quick-score";

/**
 * @typedef {Object} PlaceProperties
 * @property {string} name
 * @property {number} objectType
 * @property {string} [pg]
 * @property {string} [kg_nr]
 */

/**
 * @typedef {Object} PlaceItem
 * @property {PlaceProperties} properties
 * @property {Object} geometry
 * @property {string} [type]
 * @property {number} [score]
 * @property {string} id
 */

/**
 * @param {PlaceItem} a
 * @param {PlaceItem} b
 * @returns {number}
 */

const { result } = usePlaceSearch();
const emit = defineEmits(["result"]);

const model = ref(null);
const items = shallowRef([]);

/** @type {import("vue").Ref<AbortController>} */
const abortController = ref(null);
const search = ref("");

const clear = () => {
  model.value = null;
  items.value = [];
  search.value = "";
};

/**
 * @param {string} haystack
 * @param {string} needle
 * @returns {boolean|number}
 */
const filter = (haystack, needle) => {
  const index = haystack.toLowerCase().indexOf(needle.toLowerCase());
  return index === -1 ? true : index;
};

/**
 * @param {PlaceItem} a
 * @param {PlaceItem} b
 * @returns {number}
 */
const sort = (a, b) => b.score - a.score || a.properties.objectType - b.properties.objectType;

/**
 * @param {string} value input search string
 */
const getPlaces = async (value) => {
  if (value.length > 3) {
    if (abortController.value) {
      abortController.value.abort();
    }
    abortController.value = new AbortController();
    const { signal } = abortController.value;
    try {
      const response = await fetch(
        `https://kataster.bev.gv.at/api/search/?layers=pg-adr-gn-rn-gst-kg-bl&term=${encodeURIComponent(value)}`,
        { signal }
      );
      const { data } = await response.json();

      const itemValues = data?.features || [];
      itemValues.forEach(/** @param {PlaceItem} item */ (item) => {
        item.score = quickScore(item.properties.name, value);
        item.type = objectTypes[item.properties.objectType] + (item.properties.pg ? ` (${item.properties.pg})` : item.properties.kg_nr ? ` (${item.properties.kg_nr})` : "");
      });
      itemValues.sort(sort);
      items.value = itemValues;
      abortController.value = null;
    } catch (error) {
      // empty catch block
    }
  }
};

watch(search, (value) => {
  getPlaces(value);
});

watch(model, (value) => {
  if (value) {
    result.value = value;
    emit("result", value);
  }
});
</script>

<style scoped>
.searchContainer {
  position: absolute;
  right: 0px;
  top: 0px;
}
</style>
