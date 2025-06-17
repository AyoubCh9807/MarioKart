import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
import { createManualWaterMaterial } from "./utils";
import * as THREE from 'three';

const objLoader = new OBJLoader();
const mtlLoader = new MTLLoader();

export const loadArena = (arenaName, objPath, mtlPath, scene, onLoad) => {
  const roadMats = {
    mkAnimalCrossing: [
      "ac_road2",
      "ac_road1",
      "ac_sandroad",
      "ac_bridge1",
      "ac_bridge2",
      "ac_StartParts",
      "ef_dashboard",
      "ef_glideboard",
      "ac_concrete1",
      "ac_brick2",
      "ef_Water03",
      "ac_nooklingjunction",
      "ac_cmn_wood02",
    ],
    mkRainbowRoad: ["rainbowroad_g01_b00_f00", "rainbowroad_g01_b01_f00"],
    donutPlains: ["dp3_road", "dp3_road2", "dp3_StartParts"],
  };

  // dp3_StartParts: FINISH LINE

  const waterMaterialNames = ["ef_waterB", "ef_waterF", "ef_waterline"];
  const waterMaterial = createManualWaterMaterial();

  let roadMeshes = [];

  mtlLoader.load(mtlPath, mats => {
    mats.preload();
    objLoader.setMaterials(mats);

    objLoader.load(objPath, obj => {
      const height = new THREE.Box3().setFromObject(obj).getSize(new THREE.Vector3()).y;
      const width = new THREE.Box3().setFromObject(obj).getSize(new THREE.Vector3()).x;
      scene.add(obj);
      obj.scale.set(10, 10, 10);
      obj.position.set(0, -height, 0);


      obj.traverse((child) => {
        if (child.isMesh && child.material) {
          if (waterMaterialNames.includes(child.material.name) && arenaName === "donutPlains") {
            // Replace with manual water material
            child.material = waterMaterial;
            child.material.needsUpdate = true;
            child.position.y += 0.01;
            child.material.name = 'atWater'
          } else {
            if (roadMats[arenaName]?.includes(child.material.name)) {
              if (['dp3_RoadTunagi_tuchi', 'dp3_road2'].includes(child.material.name)) {
                if(mats.materials['dp3_road']) {
                  child.material = mats.materials['dp3_road']
                }
                child.material.name = 'dp3_road'
              }
              roadMeshes.push(child);
              child.material.transparent = true;
              child.material.opacity = 1.0;
              child.material.alphaTest = 0.1;
              child.material.depthWrite = true;
              // child.position.y -= 0.01;
            } else {
              child.material.transparent = false;
              child.material.opacity = 1.0;
              child.material.alphaTest = 0;
            }
            child.material.needsUpdate = true;
          }
        }
      })

      onLoad(obj, width, height, roadMeshes, roadMats[arenaName])
    });
  });
};
