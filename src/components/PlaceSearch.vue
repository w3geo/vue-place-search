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
    @focus="handleInfoVisibility(true)"
    @blur="handleInfoVisibility(false)"
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
  <v-expand-transition>
    <v-card v-show="showInfo">
      <v-card-title>
        <v-icon size="small"> mdi-information-outline </v-icon>
        Ortssuche
      </v-card-title>
      <v-card-subtitle>
        Die Suche des
        <a target="_blank" href="https://kataster.bev.gv.at"
          >Österreichischen Katasters</a
        ><br />
        Suche nach Orten, Adressen, und mehr
      </v-card-subtitle>
      <v-card-text>
        <v-timeline density="compact" align="start" line-thickness="0">
          <v-timeline-item
            v-for="(helpItem, key) in helpItems"
            :key="key"
            density="compact"
            dot-color="success"
            icon="mdi-text-search-variant"
          >
            <div>
              <div class="font-weight-normal">
                <strong> {{ helpItem.name }}</strong>
              </div>
              {{ helpItem.example }}
            </div>
          </v-timeline-item>
        </v-timeline>
      </v-card-text>
    </v-card>
  </v-expand-transition>
</template>

<script setup>
import { ref, shallowRef, watch } from 'vue';
import { usePlaceSearch } from '../composables/usePlaceSearch.js';
import { objectTypes } from '../constants.js';
import { quickScore } from 'quick-score';

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

const { result } = usePlaceSearch();
const emit = defineEmits(['result']);

const model = shallowRef(null);
const showInfo = ref(false);
const items = shallowRef([]);

const helpItems = [
  {
    name: 'Orte, Dörfer, Gemeinden',
    example: 'Salzburg, Bad Aussee, Praunfalk',
  },
  {
    name: 'Adressen, Straßen, Hausnummern',
    example: 'Johannes Filzer Straße 5 Salzburg',
  },
  {
    name: 'KG-Nummer + Grundstücksnummer',
    example: '49203-4',
  },
  {
    name: 'Flurnamen, Riednamen, Einzelhäuser',
    example: 'Niederrain, Teichgarten, Ziegenreith',
  },
  {
    name: 'Sonstige geographische Gebiete',
    example: 'Wörthersee, Sulm, Pötschenpass',
  },
];

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
 * @param {PlaceItem} a
 * @param {PlaceItem} b
 * @returns {number}
 */
const sort = (a, b) =>
  b.score - a.score || a.properties.objectType - b.properties.objectType;

/**
 * @param {string} value input search string
 */
const getPlaces = async value => {
  if (value.length >= 2) {
    if (abortController.value) {
      abortController.value.abort();
    }
    abortController.value = new AbortController();
    const { signal } = abortController.value;
    try {
      const response = await fetch(
        `https://kataster.bev.gv.at/api/search/?layers=pg-adr-gn-rn-gst-kg-bl&term=${encodeURIComponent(value)}`,
        { signal },
      );
      const { data } = await response.json();

      const itemValues = data?.features || [];
      itemValues.forEach(
        /** @param {PlaceItem} item */ item => {
          item.score = quickScore(item.properties.name, value);
          item.type =
            objectTypes[item.properties.objectType] +
            (item.properties.objectType !== 3 && item.properties.pg
              ? ` (${item.properties.pg})`
              : item.properties.kg_nr
                ? ` (${item.properties.kg_nr})`
                : '');
        },
      );
      itemValues.sort(sort);
      items.value = itemValues;
      abortController.value = null;
      showInfo.value = false;
    } catch {
      // empty catch block
    }
  }
};

watch(search, value => {
  getPlaces(value);
});

watch(model, value => {
  result.value = value;
  emit('result', value);
});

/**
 * shows the info, if no items are to show
 * clears the search results if blurred and
 * @param {boolean} visible
 */
function handleInfoVisibility(visible) {
  if (!model.value) {
    showInfo.value = visible;
    if (!visible) {
      clear();
    }
  }
}
</script>

<style scoped>
.searchContainer {
  position: absolute;
  right: 0px;
  top: 0px;
}
</style>
