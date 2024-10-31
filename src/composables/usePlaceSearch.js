import { ref, watch } from 'vue';
import { GeoJSON } from 'ol/format.js';

const result = ref(null);
const geojsonFormat = new GeoJSON();

/**
 * @param {import('ol/Map.js').default} [map] OpenLayers map instance.
 * If provided, the map's view will be centered on the search result geometry.
 * @returns {{result: import('vue').Ref<import('geojson').Feature>}}
 */
export function usePlaceSearch(map) {
  if (map) {
    watch(result, value => {
      if (value) {
        map
          .getView()
          .fit(geojsonFormat.readGeometry(value.geometry).getExtent(), {
            maxZoom: 19,
            duration: 500,
          });
      }
    });
  }
  return { result };
}
