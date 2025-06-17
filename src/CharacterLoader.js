import { ColladaLoader } from "three/examples/jsm/Addons.js"
import * as THREE from 'three'
const colladaLoader = new ColladaLoader()
const types = ['collada', 'mtlobj', 'fbx']

export const loadCharacter = (type, path, scene, onLoad) => {
  if(type === 'collada') {
      colladaLoader.load(path, (collada) => {
  scene.add(collada.scene)
  collada.scene.rotation.x = -Math.PI * 2

  const bowser = collada.scene
  const height = new THREE.Box3().setFromObject(collada.scene).getSize(new THREE.Vector3()).y;
  const width = new THREE.Box3().setFromObject(collada.scene).getSize(new THREE.Vector3()).x;
  collada.scene.scale.set(0.5, 0.5, 0.5)
  collada.scene.position.set(50, 30, 0)
  onLoad(bowser, width, height)
  }
)}}

