import { getBearing, getDistance } from "./utils";

const getZone = (p: google.maps.LatLngLiteral, d: number) => p.lat.toFixed(d) + ',' + p.lng.toFixed(d);

/** Salta la ubicacion si al redondear las coords es igual a la anterior */
export function algoPreviousZone(
    positions: google.maps.LatLngLiteral[], 
    decimals = 4,
): google.maps.LatLngLiteral[] {
    
    const optimizedPositions: google.maps.LatLngLiteral[] = [positions[0]];

    let previousZone = getZone(positions[0], decimals);

    for (let i = 1; i < positions.length; i++) {

        const zone = getZone(positions[i], decimals);

        if (zone !== previousZone) {
            optimizedPositions.push(positions[i]);
            previousZone = zone;
        }
    }

    return optimizedPositions;
}

/** 
 * Salta la ubicacion si no se ha recorrido 
 * la distancia minima acumulada 
 * y cambiado de direccion lo suficiente
 **/
export function algoDistanceThreshold(
    positions: google.maps.LatLngLiteral[], 
    threshold = 20,
    degrees = 10,
): google.maps.LatLngLiteral[] {
    
    const optimizedPositions: google.maps.LatLngLiteral[] = [positions[0]];

    let accumulatedDistance = 0;
    let previousHeading = 0;

    for (let i = 1; i < positions.length; i++) {

      const [ c1, c2 ] = positions.slice(i - 1, i + 1);

      const distance = getDistance([c1.lat, c1.lng], [c2.lat, c2.lng]);
      const heading = getBearing([c1.lat, c1.lng], [c2.lat, c2.lng]);
      const diff = Math.abs(heading - previousHeading);

      accumulatedDistance += distance;

      if (accumulatedDistance >= threshold && diff >= degrees) {
        optimizedPositions.push(c2);
        previousHeading = heading;
        accumulatedDistance = 0;
      }
    }

    if (optimizedPositions.at(-1) !== positions.at(-1)) {
      optimizedPositions.push(positions.at(-1)!);
    }

    return optimizedPositions;
}

/** Salta la ubicacion si no se ha cambiado de direccion lo suficiente */
export function algoHeadingDifference(
    positions: google.maps.LatLngLiteral[], 
    degrees = 10,
): google.maps.LatLngLiteral[] {
    
    const optimizedPositions: google.maps.LatLngLiteral[] = [positions[0]];

    let previousHeading = 0;

    for (let i = 1; i < positions.length; i++) {

      const [ c1, c2 ] = positions.slice(i - 1, i + 1);

      const heading = getBearing([c1.lat, c1.lng], [c2.lat, c2.lng]);
      const diff = Math.abs(heading - previousHeading);

      console.log(c2.lat + ', ' + c2.lng, diff);

      if (diff >= degrees) {
        optimizedPositions.push(c2);
        previousHeading = heading;
      }
    }

    if (optimizedPositions.at(-1) !== positions.at(-1)) {
      optimizedPositions.push(positions.at(-1)!);
    }

    return optimizedPositions;
}

/** 
 * Salta la ubicacion si no se ha recorrido 
 * la distancia minima desde la ultima posicion guardada 
 * y cambiado de direccion lo suficiente 
 **/
export function algoDistancePreviousPosition(
    positions: google.maps.LatLngLiteral[], 
    threshold = 20,
    degrees = 10,
): google.maps.LatLngLiteral[] {
    
    const optimizedPositions: google.maps.LatLngLiteral[] = [positions[0]];

    let previousHeading = 0;
    let prevPosition: [number, number] = [positions[0].lat, positions[0].lng];

    for (let i = 1; i < positions.length; i++) {

      const [ c1, c2 ] = positions.slice(i - 1, i + 1);

      const distance = getDistance([c1.lat, c1.lng], prevPosition);
      const heading = getBearing([c1.lat, c1.lng], [c2.lat, c2.lng]);
      const diff = Math.abs(heading - previousHeading);

      if (distance >= threshold && diff >= degrees) {
        optimizedPositions.push(c2);
        prevPosition = [c2.lat, c2.lng];
        previousHeading = heading;
      }
    }

    if (optimizedPositions.at(-1) !== positions.at(-1)) {
      optimizedPositions.push(positions.at(-1)!);
    }

    return optimizedPositions;
}