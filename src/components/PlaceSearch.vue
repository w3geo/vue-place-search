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
  />
</template>

<script setup>
import { ref, watch } from 'vue';
import { usePlaceSearch } from '../composables/usePlaceSearch.js';

const { result } = usePlaceSearch();
const emit = defineEmits(['result']);

const model = ref(null);
const items = ref([]);
/** @type {import("vue").Ref<AbortController>} */
const abortController = ref(null);
const search = ref('');

const clear = () => {
  model.value = null;
  items.value = [];
  search.value = '';
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
 * @param {string} value
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
        `https://kataster.bev.gv.at/api/all/?term=${encodeURIComponent(value)}`,
        { signal },
      );
      const { data } = await response.json();
      items.value = data?.features || [];
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
    emit('result', value);
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
