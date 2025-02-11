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
 * @property {import("geojson").Polygon|import("geojson").Point} geometry
 * @property {string} [type]
 * @property {number} [score]
 * @property {string} id
 */

import PlaceSearch from './components/PlaceSearch.vue';
export { PlaceSearch };
export { usePlaceSearch } from './composables/usePlaceSearch.js';
