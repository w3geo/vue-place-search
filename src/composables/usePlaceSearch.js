import { onUnmounted, shallowRef, watch } from 'vue';
import { GeoJSON } from 'ol/format.js';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Style from 'ol/style/Style';
import { Feature } from 'ol';
import Stroke from 'ol/style/Stroke';
import { getUserProjection } from 'ol/proj';

/** @type {import('vue').ShallowRef<import('../components/PlaceSearch.vue').PlaceItem | null>} */
const result = shallowRef(null);

const geojsonFormat = new GeoJSON();

const resultLayer = new VectorLayer({
  source: new VectorSource({
    features: [],
  }),
  style: new Style({
    stroke: new Stroke({
      color: 'rgba(229, 34, 34, 0.6)',
      width: 4,
      lineCap: 'round',
      lineDash: [0.1, 10],
    }),
  }),
});

/**
 * @param {import('ol/Map.js').default} [map] OpenLayers map instance.
 * If provided, the map's view will be centered on the search result geometry.
 * @returns {{result: import('vue').ShallowRef<import('../components/PlaceSearch.vue').PlaceItem | null>}}
 */
export function usePlaceSearch(map) {
  if (map) {
    watch(result, value => {
      resultLayer.getSource().clear();
      if (!value) {
        resultLayer.getSource().clear();
        resultLayer.setMap(null);
        return;
      }
      const userProjection =
        getUserProjection() || map.getView().getProjection();
      const resultGeometry = geojsonFormat.readGeometry(value.geometry, {
        featureProjection: userProjection,
      });
      map.getView().fit(resultGeometry.getExtent(), {
        maxZoom: 19,
        duration: 500,
        padding: [20, 20, 20, 20],
      });

      const feature = new Feature({
        geometry: resultGeometry,
      });
      resultLayer.getSource().addFeature(feature);
      resultLayer.setMap(map);
    });
  }

  onUnmounted(() => {
    resultLayer.getSource().clear();
    resultLayer.setMap(null);
  });
  return { result };
}
