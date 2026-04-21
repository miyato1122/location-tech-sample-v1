const OSM_ATTRIBUTION =
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const GSI_ATTRIBUTION =
    '<a href="https://maps.gsi.go.jp/development/ichiran.html">地理院タイル</a>';

export const BASEMAP_CATALOG = [
    {
        id: 'osm',
        label: 'OpenStreetMap',
        sourceId: 'osm',
        layerId: 'osm-layer',
        source: {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            maxzoom: 19,
            tileSize: 256,
            attribution: OSM_ATTRIBUTION,
        },
        layer: {
            id: 'osm-layer',
            source: 'osm',
            type: 'raster',
            layout: { visibility: 'visible' },
        },
        attributionText: OSM_ATTRIBUTION,
    },
    {
        id: 'gsiStd',
        label: '地理院地図',
        sourceId: 'gsi_std',
        layerId: 'gsi-std-layer',
        source: {
            type: 'raster',
            tiles: ['https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png'],
            minzoom: 2,
            maxzoom: 18,
            tileSize: 256,
            attribution: GSI_ATTRIBUTION,
        },
        layer: {
            id: 'gsi-std-layer',
            source: 'gsi_std',
            type: 'raster',
            layout: { visibility: 'none' },
        },
        attributionText: GSI_ATTRIBUTION,
    },
    {
        id: 'gsiPhoto',
        label: '航空写真',
        sourceId: 'gsi_photo',
        layerId: 'gsi-photo-layer',
        source: {
            type: 'raster',
            tiles: ['https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg'],
            minzoom: 2,
            maxzoom: 18,
            tileSize: 256,
            attribution: GSI_ATTRIBUTION,
        },
        layer: {
            id: 'gsi-photo-layer',
            source: 'gsi_photo',
            type: 'raster',
            layout: { visibility: 'none' },
        },
        attributionText: GSI_ATTRIBUTION,
    },
];

export const BASEMAP_BY_ID = Object.fromEntries(
    BASEMAP_CATALOG.map((item) => [item.id, item]),
);
