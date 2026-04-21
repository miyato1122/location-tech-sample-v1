<script setup lang="ts">
definePageMeta({ ssr: false })

const { map, isLoaded, initMap, destroyMap } = useMap()
const { getVisibleLayerFilter } = useShelters(map, isLoaded)
useHazardLayers(map, isLoaded)
useGeolocation(map, isLoaded, getVisibleLayerFilter)
useTerrain(map, isLoaded)

const mapContainer = ref<HTMLElement | null>(null)

onMounted(() => {
  if (mapContainer.value) initMap(mapContainer.value)
})

onUnmounted(() => {
  destroyMap()
})

useHead({
  meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }],
})
</script>

<template>
  <div ref="mapContainer" class="map-container" />
</template>

<style>
.map-container {
  width: 100%;
  height: 100vh;
}
</style>
