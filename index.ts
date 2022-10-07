import { algoDistanceThreshold, algoHeadingDifference, algoDistancePreviousPosition, algoPreviousZone, algoPreviousHeadingDifference } from "./algorithms";
import { getBearing, getDistance, getDistanceSimple } from "./utils";

const mapEl = document.getElementById("map")!;
const inputEl = document.querySelector('input')!;

/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
let map: google.maps.Map;
let prevLine: google.maps.Polyline;
let position = (() => {
  const position = localStorage.getItem('HMR_position');
  if (position) return JSON.parse(position);
  return { lat: 18.9282, lng: -70.4149, zoom: 20 };  
})();

function initMap(): void {
  map = new google.maps.Map(mapEl, {
    center: position,
    zoom: position.zoom
  });

  map.addListener('center_changed', () => {
    position = { ...position, ...map.getCenter()!.toJSON() };
    localStorage.setItem('HMR_position', JSON.stringify(position));
  });
  map.addListener('zoom_changed', () => {
    position = { ...position, zoom: map.getZoom()! };
    localStorage.setItem('HMR_position', JSON.stringify(position));
  });

  const positionsJSON = localStorage.getItem('HMR_positions');
  if (positionsJSON) {
    const positions = JSON.parse(positionsJSON);
    addLine(positions);
  }
}

function addLine(positions: google.maps.LatLngLiteral[], optimize = false): void {

  prevLine?.setMap(null);

  const line = new google.maps.Polyline({
    path: positions,
    geodesic: true,
    strokeColor: "#FF0000",
    strokeOpacity: 1.0,
    strokeWeight: 2,
  });
  line.setMap(map);

  prevLine = line;

  if (optimize) {

    const preOp = algoPreviousZone(positions);

    const ops: [string, google.maps.LatLngLiteral[]][] = [
      ['algoPreviousZone', preOp],
      ['algoDistanceThreshold', algoDistanceThreshold(positions)],
      ['algoHeadingDifference', algoHeadingDifference(positions)],
      ['algoPreviousHeadingDifference', algoPreviousHeadingDifference(positions)],
      ['algoPreviousDistance', algoDistancePreviousPosition(positions)],
      ['preOP-algoDistanceThreshold', algoDistanceThreshold(preOp)],
      ['preOP-algoHeadingDifference', algoHeadingDifference(preOp)],
      ['preOP-algoPreviousHeadingDifference', algoPreviousHeadingDifference(preOp)],
      ['preOP-algoPreviousDistance', algoDistancePreviousPosition(preOp)],
    ];

    ops.sort((a, b) => a[1].length - b[1].length);
    
    ops.forEach(([name, op]) => {
      const percentage = (op.length / positions.length * 100).toFixed(2);
      console.log(`${name}:\n${op.length} / ${positions.length} = ${percentage}%`);
    });

    const optimizedPositions = ops[ops.length - 2][1];

    const optimizedLine = new google.maps.Polyline({
      path: optimizedPositions,
      geodesic: true,
      strokeColor: "#00FF00",
      strokeOpacity: 1.0,
      strokeWeight: 2,
    });
    optimizedLine.setMap(map);

    localStorage.setItem(
      'HMR_positions', 
      JSON.stringify(positions),
    );
    localStorage.setItem(
      'HMR_optimizedPositions', 
      JSON.stringify(optimizedPositions),
    );
  }
  else {
    const optimizedPositions = JSON.parse(
      localStorage.getItem('HMR_optimizedPositions')!
    );

    const optimizedLine = new google.maps.Polyline({
      path: optimizedPositions,
      geodesic: true,
      strokeColor: "#00FF00",
      strokeOpacity: 1.0,
      strokeWeight: 2,
    });
    optimizedLine.setMap(map);

    const initial = new google.maps.Marker({ 
      position: optimizedPositions[0], map, 
      title: optimizedPositions[0].lat + ', ' + optimizedPositions[0].lng 
    }); 
    let previous = 0;
    for (let i = 1; i < optimizedPositions.length; i++) {

      const [ c1, c2 ] = optimizedPositions.slice(i - 1, i + 1);
      const heading = getBearing([c1.lat, c1.lng], [c2.lat, c2.lng]);
      
      const marker = new google.maps.Marker({ 
        position: c2, map, 
        title: c2.lat + ', ' + c2.lng + '\n' + Math.round(heading) + ' ' + Math.abs(heading - previous)
      }); 

      previous = heading;
    }
  }
}

inputEl.onchange = (e) => {
  const file = (e.currentTarget as any).files[0];
  const reader = new FileReader();

  reader.onload = () => {
    const data = JSON.parse(reader.result!.toString());

    const positions = (
      data.positions ? data.positions : data
    ).map(p => ({ lat: p[0], lng: p[1] }));

    addLine(positions, true);
  };

  reader.readAsText(file);

  // for (const file of (e.currentTarget as any).files) {
  //   const reader = new FileReader();

  //   reader.onload = () => {
  //     const data = JSON.parse(reader.result!.toString());
  
  //     const positions = (
  //       data.positions ? data.positions : data
  //     ).map(p => ({ lat: p[0], lng: p[1] }));

  //     const preOp = algoPreviousZone(positions);

  //     const ops: [string, google.maps.LatLngLiteral[]][] = [
  //       ['algoPreviousZone', preOp],
  //       ['algoDistanceThreshold', algoDistanceThreshold(positions)],
  //       ['algoHeadingDifference', algoHeadingDifference(positions)],
  //       ['algoPreviousDistance', algoDistancePreviousPosition(positions)],
  //       ['preOP-algoDistanceThreshold', algoDistanceThreshold(preOp)],
  //       ['preOP-algoHeadingDifference', algoHeadingDifference(preOp)],
  //       ['preOP-algoPreviousDistance', algoDistancePreviousPosition(preOp)],
  //     ];

  //     ops.sort((a, b) => a[1].length - b[1].length);
      
  //     ops.forEach(([name, op]) => {
  //       const percentage = (op.length / positions.length * 100).toFixed(2);
  //       console.log(`${name}:\n${op.length} / ${positions.length} = ${percentage}%`);
  //     });

  //     console.log();
  //   }
    
  //   reader.readAsText(file);
  // }
}

declare global {
  interface Window {
    initMap: () => void;
  }
}
window.initMap = initMap;
export {};
