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
  import { PlaceSearch } from '@w3geo/vue-place-search';

  function showResult(result) {
    console.log(result); // Output will be a GeoJSON feature
  }
</script>
```

### `usePlaceSearch` composable for OpenLayers
```html
<script setup>
  import { usePlaceSearch } from '@w3geo/vue-place-search';
  // Your composable that provides an OpenLayers map:
  import { useMap } from './composables/useMap.js';

  const map = useMap();
  usePlaceSearch(map);
</script>
```
With this, the map view will automatically be centered on the result geometry.
