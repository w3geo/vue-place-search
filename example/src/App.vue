<template>
  <v-container class="d-flex justify-center align-center">
    <v-card>
      <v-card-title>OpenLayers Map</v-card-title>
      <v-toolbar class="pr-1" density="compact">
        <v-spacer /><place-search
      /></v-toolbar>
      <v-sheet class="fill-height">
        <div ref="mapContainer" class="map"></div>
      </v-sheet>
    </v-card>
  </v-container>
</template>

<script setup>
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { onMounted, ref } from 'vue';
import { PlaceSearch, usePlaceSearch } from '../../dist/vue-place-search.js';

const mapContainer = ref(null);

const map = new Map({
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
  ],
  view: new View({
    center: [0, 0],
    zoom: 2,
  }),
});

usePlaceSearch(map);

onMounted(() => {
  map.setTarget(mapContainer.value);
});
</script>

<style>
.map {
  width: 600px;
  height: 400px;
}
</style>
