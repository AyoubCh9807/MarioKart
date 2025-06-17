import * as THREE from 'three'
export const checkOnRoad = (rayCaster, playerPosition, roadMeshes) => {
  const downVector = new THREE.Vector3(0, -1, 0)
  let allMeshes = [];
  for(const key in roadMeshes) {
    allMeshes = allMeshes.concat(roadMeshes[key])
  }
  rayCaster.set(playerPosition, downVector)
  const intersection = rayCaster.intersectObjects(allMeshes, true)

  if(intersection.length > 0) {
    const closestIntersection = intersection[0]
  return {
    onRoad: true,
    intersection: closestIntersection
    }
  } else {
    return {
      onRoad: false
    }
  }
}

export function isColliding(playerPos, playerSize, platformPos, platformSize) {
  const pxMin = playerPos.x - playerSize.x / 2;
  const pxMax = playerPos.x + playerSize.x / 2;
  const pyMin = playerPos.y - playerSize.y / 2;
  const pyMax = playerPos.y + playerSize.y / 2;
  const pzMin = playerPos.z - playerSize.z / 2;
  const pzMax = playerPos.z + playerSize.z / 2;

  const bxMin = platformPos.x - platformSize.x / 2;
  const bxMax = platformPos.x + platformSize.x / 2;
  const byMin = platformPos.y - platformSize.y / 2;
  const byMax = platformPos.y + platformSize.y / 2;
  const bzMin = platformPos.z - platformSize.z / 2;
  const bzMax = platformPos.z + platformSize.z / 2;

  const overlapX = pxMax >= bxMin && pxMin <= bxMax;
  const overlapY = pyMax >= byMin && pyMin <= byMax;
  const overlapZ = pzMax >= bzMin && pzMin <= bzMax;

  return overlapX && overlapY && overlapZ;
}

export function sameRange(playerPos, platformPos, platformSize) {
  return (
    Math.abs(playerPos.x - platformPos.x) <= platformSize.x / 2 &&
    Math.abs(playerPos.z - platformPos.z) <= platformSize.z / 2
  )
}

export function createManualWaterMaterial() {
  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0x1ca3ec),
    transparent: true,
    opacity: 0.5,                  // Slightly lower to soften
    roughness: 0.05,               // Make smoother
    metalness: 0,
    clearcoat: 1.0,                // More clear surface
    clearcoatRoughness: 0,
    reflectivity: 1.0,
    side: THREE.DoubleSide,
    depthWrite: false,            // Prevents depth-fighting
    depthTest: true,              // Keep this enabled
    envMapIntensity: 1.0,         // Optional, enhances reflectivity
  });
}
