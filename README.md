# Vue Place Search

Vue3 place search for Austria, using the [BEV Kataster](https://kataster.bev.gv.at/) API.

## Usage

    npm install @w3geo/vue-place-search

### `result` event

```html
<template>
  <PlaceSearch @result="showResult" />
</template>
<script setup>
  import '@w3geo/vue-place-search/dist/style.css';
  import { PlaceSearch } from '@w3geo/vue-place-search';

  function showResult(result) {
    console.log(result); // Output will be a GeoJSON feature
  }
</script>
```

### `usePlaceSearch` composable for OpenLayers

Instead of the `@result` event, the `usePlaceSearch()` composable can be used to pass the search result location directly to the provided OpenLayers map instance, or to watch for new search results.

```html
<script setup>
  import { usePlaceSearch } from '@w3geo/vue-place-search';
  // Your composable that provides an OpenLayers map:
  import { useMap } from './composables/useMap.js';

  const map = useMap();

  const { result } = usePlaceSearch(map);

  watch(result, value => {
    console.log(value);
  });
</script>
```

With this, the map view will automatically be centered on the result geometry, and the bounding box of the selected search result will be displayed on the map, if available.

## Developing

To develop this plugin, an example has been set up in `example/`. To run the example with dynamically built plugin, run

    npm run dev:example
