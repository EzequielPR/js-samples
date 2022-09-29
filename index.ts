/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

let map: google.maps.Map;

const home = { lat: 18.9282, lng: -70.4149 };

function initMap(): void {
  const mapEl = document.getElementById("map")!;

  map = new google.maps.Map(mapEl, {
    center: home,
    zoom: 20
  });

  for (let y = -0.001; y <= 0.001; y += 0.0001) {
    for (let x = -0.001; x <= 0.001; x += 0.0001) {
      
      const marker = new google.maps.Marker({
        position: { lat: home.lat + y, lng: home.lng + x },
        map: map,
      });

    }
  }
}

declare global {
  interface Window {
    initMap: () => void;
  }
}
window.initMap = initMap;
export {};
