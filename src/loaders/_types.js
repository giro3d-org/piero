// @ts-nocheck
/*
This is a terrible workaround to define my SimpleGeoJSONFeature,
and making it work with eslint and typescript at the same time...
*/

/* eslint-disable jsdoc/valid-types */
/**
 * @typedef {import('ol/format/GeoJSON.js').GeoJSONObject} GeoJSONObject
 * @typedef {import('ol/format/GeoJSON.js').GeoJSONFeature} GeoJSONFeature
 * @typedef {import('ol/format/GeoJSON.js').GeoJSONLineString} GeoJSONLineString
 * @typedef {import('ol/format/GeoJSON.js').GeoJSONPolygon} GeoJSONPolygon
 * @typedef {GeoJSONFeature<GeoJSONLineString|GeoJSONPolygon>} SimpleGeoJSONFeature
 */
/* eslint-enable */

export default {};
