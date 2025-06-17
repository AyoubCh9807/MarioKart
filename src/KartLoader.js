import { FBXLoader } from "three/examples/jsm/Addons.js"
import * as THREE from 'three'

const fbxLoader = new FBXLoader()

export const loadKart = (type, path, scene, onLoad) => {
  if (!type) {console.log('NO TYPE SPECIFIED!'); return;}
  if (type === 'fbx') {
    fbxLoader.load(path, (fbx) => {
      scene.add(fbx)
      fbx.scale.set(0.01, 0.01, 0.01)
      const height = new THREE.Box3().setFromObject(fbx).getSize(new THREE.Vector3()).y;
      const width = new THREE.Box3().setFromObject(fbx).getSize(new THREE.Vector3()).x;
      fbx.position.set(50, 30, 0)
      onLoad(fbx, width, height)
    }
    )
  }
}
