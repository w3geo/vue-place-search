<template>
  <v-autocomplete
    ref="autocompleteRef"
    v-model="model"
    v-model:search="search"
    auto-select-first
    class="rounded"
    clearable
    :custom-filter="filter"
    density="compact"
    hide-details
    hide-no-data
    item-title="properties.name"
    :items="items"
    label="Ort, Adresse, Flurname,..."
    :loading="!!abortController"
    min-width="280"
    :prepend-inner-icon="mdiMagnify"
    return-object
    single-line
    variant="outlined"
    @click:clear="clear"
    @focus="handleInfoVisibility(true)"
  >
    <template #item="{ props, item }">
      <v-list-item
        v-bind="props"
        :id="item.raw.id"
        :key="item.raw.id"
        :subtitle="item.raw.type"
        :title="item.raw.properties.name"
        :value="item.raw.id"
      ></v-list-item>
    </template>
  </v-autocomplete>

  <v-menu v-model="showInfo" :target="autocompleteRef">
    <v-card>
      <v-card-title>
        <v-icon :icon="mdiInformationOutline" size="small" />
        Ortssuche
      </v-card-title>
      <v-card-subtitle>
        Die Suche des
        <a href="https://kataster.bev.gv.at" target="_blank"
          >Österreichischen Katasters</a
        ><br />
        Suche nach Orten, Adressen, und mehr
      </v-card-subtitle>
      <v-card-text>
        <v-timeline align="start" density="compact" line-thickness="0">
          <v-timeline-item
            v-for="(helpItem, key) in helpItems"
            :key="key"
            density="compact"
            dot-color="success"
            :icon="mdiTextSearchVariant"
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
  </v-menu>
</template>

<script setup>
import { ref, shallowRef, watch } from 'vue';
import { usePlaceSearch } from '../composables/usePlaceSearch.js';
import { objectTypes } from '../constants.js';
import { quickScore } from 'quick-score';
import {
  mdiInformationOutline,
  mdiMagnify,
  mdiTextSearchVariant,
} from '@mdi/js';

const autocompleteRef = ref(null);
const { result } = usePlaceSearch();
//@ts-expect-error
/** @type {ReturnType<typeof defineEmits<{(eventType: 'result', placeItem: PlaceItem): void}>>} */
const emit = defineEmits(['result']);

/** @type {import("vue").ShallowRef<import('../index.js').PlaceItem>} */
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
 * @param {import('../index.js').PlaceItem} a
 * @param {import('../index.js').PlaceItem} b
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

      /** @type {Array<import('../index.js').PlaceItem>} */
      const itemValues = data?.features || [];
      itemValues.forEach(item => {
        item.score = quickScore(item.properties.name, value);
        item.type =
          objectTypes[item.properties.objectType] +
          (item.properties.objectType !== 3 && item.properties.pg
            ? ` (${item.properties.pg})`
            : item.properties.kg_nr
              ? ` (${item.properties.kg_nr})`
              : '');
      });
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
