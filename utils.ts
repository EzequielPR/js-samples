export function getBearing([lat1, lon1], [lat2, lon2]): number {
    const y = Math.sin(lon2 - lon1) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) -
        Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);
    const θ = Math.atan2(y, x);
    const brng = (θ * 180 / Math.PI + 360) % 360; // in degrees

    return brng;
}


export function getAngle([lat1, lon1], [lat2, lon2]): number {
    const dLon = lon2 - lon1;
    const cosLon2 = Math.cos(lat2);

    const y = Math.sin(dLon) * cosLon2;
    const x = Math.cos(lat1) * Math.sin(lat2)
        - Math.sin(lat1) * cosLon2 * Math.cos(dLon);

    const brng = Math.atan2(y, x) * 180 / Math.PI;

    return (brng + 360) % 360;
}

const R = 6371e3; // metres
export function getDistance([lat1, lon1], [lat2, lon2]): number {
    const φ1 = lat1 * Math.PI / 180; // φ, λ in radians
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const d = R * c; // in metres

    return d;
}

export function getDistanceSimple([lat1, lon1], [lat2, lon2]): number {
    return Math.hypot(lat2 - lat1, lon2 - lon1) * 111321;
}