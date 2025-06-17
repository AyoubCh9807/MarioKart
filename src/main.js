// MAKE SURE TO KNOW THIS IS A PROTOTYPE, THIS IS JUST THE FIRST VERSION OF MY FAN-MADE SOLO PROJECT

import * as THREE from 'three'
import { loadCharacter } from './characterLoader';
import { loadArena } from './ArenaLoader';
import { loadKart } from './KartLoader';
import { checkOnRoad } from './utils'

const scene = new THREE.Scene()
const winW = window.innerWidth
const winH = window.innerHeight
const cameraOffsetBehind = new THREE.Vector3(0, 20, -12.5)

const skyGeo = new THREE.SphereGeometry(2500, 64, 64);
const skyMat = new THREE.MeshBasicMaterial({ color: 0x87CEEB}); // Sky blue
const sky = new THREE.Mesh(skyGeo, skyMat);
scene.add(sky);

// let mkRainbowRoad (maybe next update)
let donutPlains
let laps

const camera = new THREE.PerspectiveCamera(110, winW / winH)
const renderer = new THREE.WebGLRenderer()
renderer.setSize(winW, winH)
// renderer.setClearColor(0x87CEEB)
document.body.appendChild(renderer.domElement)



class Game {

  constructor(friction, drift, driftSmoothing, roadMeshes) {
    this.friction = friction
    this.drift = drift
    this.driftSmoothing = driftSmoothing
    this.roadMeshes = roadMeshes
  }
}

const game = new Game(
  0.95, // friction
  0.1,  // drift
  10,   // drift smoothing
  { 'donutPlains': [] }) // roadMeshes (will implement more arenas soon...)

class Arena {

  constructor(model, width, height, roadMeshes, arenaName) {
    this.model = model
    this.width = width
    this.height = height
    this.roadMeshes = roadMeshes
    this.arenaName = arenaName
    game.roadMeshes[arenaName] = roadMeshes
  }
}


loadArena('donutPlains', '/models/maps/DonutPlains3/SNES Donut Plains.obj',
  '/models/maps/DonutPlains3/SNES Donut Plains.mtl',
  scene, (model, height, width, meshes) => {
    donutPlains = new Arena(model, width, height, meshes, 'donutPlains')
  }
)

const rayCaster = new THREE.Raycaster()
const clock = new THREE.Clock()



class Kart {

  constructor(model, width, height) {
    this.drift = 0
    this.model = model
    this.width = width
    this.height = height
    this.velocity = new THREE.Vector3(0, 0, 0)
    // this.acceleration = new THREE.Vector3(0, 0, 0) might implement in the future
    this.isGrounded = true;
    this.gravity = 9.8
    this.driftDirection = null;
    this.targetDrift = 0
    this.onRoad = null
    this.heightOffset = 2
    this.turnYaw = 0
  }

  update(deltaTime) {
    if (!this.isGrounded) {
      this.velocity.y -= this.gravity * deltaTime
    }
    this.model.position.add(this.velocity.clone().multiplyScalar(deltaTime))
  }
  applyForward(force) {
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.model.quaternion)
    this.velocity.add(forward.multiplyScalar(force))
  }
  applyFriction(factor) {
    this.velocity.multiplyScalar(factor)
  }
}

class PlayerController {

  constructor(kart, model, width, height) {
    this.kart = kart
    this.keys = {};
    this.speed = 100
    this.turnSpeed = 4
    this.model = model
    this.width = width
    this.height = height
    this.vSpeed = 0

    window.addEventListener('keydown', (e) => this.keys[e.key] = true)
    window.addEventListener('keyup', (e) => this.keys[e.key] = false)

  }

  update(deltaTime) {
    if (this.kart && donutPlains) {

      if (this.keys['w']) {
        this.kart.applyForward(-this.speed * deltaTime)

      }
      if (this.keys['s']) {
        this.kart.applyForward(this.speed * deltaTime)
      }
      if (!this.keys['w'] && !this.keys['s']) {
        this.kart.applyFriction(game.friction)
      }
      if (this.keys['d']) {
        // gradual drift
        this.kart.driftDirection = -1
        this.kart.targetDrift = game.drift
        this.kart.turnYaw -= this.turnSpeed * deltaTime
      }
      if (this.keys['a']) {
        // gradual drift
        this.kart.driftDirection = 1
        this.kart.targetDrift = game.drift
        this.kart.turnYaw += this.turnSpeed * deltaTime;
      }
      if (!this.keys['a'] && !this.keys['d']) {
        this.kart.targetDrift = 0
        this.kart.driftDirection = null
      }

      if (this.kart && this.kart.velocity) {
        this.vSpeed = this.kart.velocity.length()
      }

      if (this.vSpeed > 0.1) {
        if (this.kart.driftDirection !== null) {
          const driftDirV = new THREE.Vector3(this.kart.driftDirection, 0, 0).applyEuler(this.kart.model.rotation)
          this.kart.velocity.add(driftDirV.multiplyScalar(this.kart.drift))
        }
      } else {
        this.kart.drift += (0 - this.kart.drift) * game.driftSmoothing * deltaTime
      }

      if (this.kart) {

        rayCaster.set(this.kart.model.position.clone().add(new THREE.Vector3(0, 5, 0)), new THREE.Vector3(0, -1, 0));

        this.kart.onRoad = checkOnRoad(rayCaster, this.kart.model.position, donutPlains.model.children)
        if (this.kart.onRoad && this.kart.onRoad.onRoad) {

          const hit = this.kart.onRoad.intersection
          const intersectedMesh = hit.object
          const material = intersectedMesh.material

          this.kart.model.position.y = hit.point.y + this.kart.heightOffset

          const normal = hit.face.normal.clone().applyMatrix3(new THREE.Matrix3().getNormalMatrix(hit.object.matrixWorld)).normalize()
          const up = new THREE.Vector3(0, 1, 0)

          const userRotation = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.kart.turnYaw);
          const groundAlignQuat = new THREE.Quaternion().setFromUnitVectors(up, normal);

          const combinedQuat = new THREE.Quaternion();
          combinedQuat.multiplyQuaternions(groundAlignQuat, userRotation);

          this.kart.model.quaternion.slerp(combinedQuat, 0.1);


          // use this to log the MATERIAL INFO
          // console.log(`Hit mesh: ${intersectedMesh.name}`)
          // console.log('→ Material:', 'Name:', material.name)
          switch(material.name) {
            case 'atWater': {
              this.kart.applyFriction(game.friction + 0.01); break;
            }
            case 'dp3_grass_nuki': {
              this.kart.applyFriction(game.friction - 0.01); break;
            }
            case 'dp3_StartParts': {
              // console.log("one lap lul"); break; enable for DEBUGGING
            }
          }  
        }
        if (!this.kart.onRoad|| !this.kart.onRoad.onRoad) {
          this.kart.model.position.set(0, 25, -80)
        }
        const kartPosition = this.kart.model.position.clone();
        const kartQuaternion = this.kart.model.quaternion;

        const cameraOffset = cameraOffsetBehind.clone().applyQuaternion(kartQuaternion);
        const desiredPosition = kartPosition.clone().add(cameraOffset);

        camera.position.lerp(desiredPosition, 0.1);
        camera.lookAt(kartPosition.clone().add(new THREE.Vector3(0, 2, 0)));

      }
      if(this.model.position != this.kart.model.position) {
        this.model.position.copy(this.kart.model.position).add(new THREE.Vector3(0, -1, 0));
      }
      this.model.quaternion.copy(this.kart.model.quaternion)
      this.model.rotateX(-Math.PI / 2)
    }
    this.kart.update(deltaTime)
  }
}

let tanookiKart;
let bowser;

// const scales = { 'tanookiKart': 0.005, 'bowser': 0.25, 'mkRainbowRoad': 5, 'donutPlains': 5 } -> NOT USED FOR NOW

camera.position.set(0, 5, 0)
camera.lookAt(0, 0, 0)


const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const light = new THREE.DirectionalLight(0xffffff, 2)
scene.add(light)


loadKart('fbx', '/models/vehicles/TanookiKart/Tanooki Kart/BodyK_Tnk.fbx', scene, (model, width, height) => {
  tanookiKart = new Kart(model, width, height)
})
loadCharacter('collada', '/models/characters/Bowser/Bowser/bowser.dae', scene, (model, width, height) => {
  bowser = new PlayerController(tanookiKart, model, width, height)
})


camera.position.set(0, 15, -20)

function animate() {
  requestAnimationFrame(animate)
  let deltaTime = clock.getDelta()
  if (bowser) {
    bowser.update(deltaTime)
  }
  renderer.render(scene, camera)
}
animate()


