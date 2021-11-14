import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import * as dat from 'dat.gui'
import gsap from 'gsap'

let playedPositions = []
let winner = -1
let recheckPosition = 1
const objToTest = []
let dartCount = 0
let importedFont

/**
 * Dat GUI
 */
const gui = new dat.GUI()

/**
 * Raycaster
 */
const raycaster = new THREE.Raycaster()

/**
 * Dart Object
 */
const dartObject = {}
const symbols = {}

const keys = {
    1: {},
    2: {},
    3: {},
    4: {},
    5: {},
    6: {},
    7: {},
    8: {},
    9: {}
}

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Loaders
const loadingManager = new THREE.LoadingManager(
    () => {
        loaded = true
        loadCrossRing()
    }
)

const dracoLoader = new DRACOLoader(loadingManager)
dracoLoader.setDecoderPath('/draco/')

const gltfLoader = new GLTFLoader(loadingManager)
gltfLoader.setDRACOLoader(dracoLoader)

const fontLoader = new THREE.FontLoader(loadingManager)


/**
 * Models
 */
fontLoader.load(
    '/fonts/helvetiker_regular.typeface.json',
    ( font ) => {
        importedFont = font
        const nameGeometry = new THREE.TextGeometry(
            'T I C - T A C - T O E',
            {
                font: font,
                size: 0.7,
                height: 0.1,
                curveSegments: 8,
                bevelEnabled: true,
                bevelThickness: 0.04,
                bevelSize: 0.02,
                bevelOffset: 0,
                bevelSegment: 5
            }
        )
        nameGeometry.center()
        const nameMaterial = new THREE.MeshBasicMaterial({color: 0xaffc41})
        const name = new THREE.Mesh(nameGeometry, nameMaterial)
        name.position.set(0, 3.5, -7)
        name.lookAt(camera.position)
        name.name = 'name'
        scene.add(name)
    }
)

let loaded = false
gltfLoader.load(
    '/models/tic-tac-toe3.glb',
    (gltf) => {
        for(let i = 1; i <= 9; i++){
            keys[i].mesh = gltf.scene.children.find((child) => child.name === i.toString())
            keys[i].mesh.material = new THREE.MeshBasicMaterial({color: 0xe9d8a6})
            keys[i].value = (Math.random() - 0.5) * 20
            objToTest.push(keys[i].mesh)
        }
        gltf.scene.children.find((child) => child.name === 'grid')
            .material = new THREE.MeshBasicMaterial({color: 0x001219})
        scene.add(gltf.scene)
    }
)


gltfLoader.load(
    '/models/CrossDart.glb',
    (gltf) => {
        dartObject.crossMesh = gltf.scene.children[0]
        dartObject.crossMesh.material = new THREE.MeshBasicMaterial({color: 0x1e6091})
    }
)
gltfLoader.load(
    '/models/RingDart.glb',
    (gltf) => {
        dartObject.circleMesh = gltf.scene.children[0]
        dartObject.circleMesh.material = new THREE.MeshBasicMaterial({color: 0xca6702})
    }
)

gltfLoader.load(
    '/models/cross.glb',
    (gltf) => {
        symbols.cross = gltf.scene.children[0]
        symbols.cross.material = new THREE.MeshBasicMaterial({color: 0xa4133c})
    }
)

gltfLoader.load(
    '/models/ring.glb',
    (gltf) => {
        symbols.ring = gltf.scene.children[0]
        symbols.ring.material = new THREE.MeshBasicMaterial({color: 0x006d77})
    }
)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

const createCrossDart = () => {
    let dart = new THREE.Mesh()
    dart = dartObject.crossMesh.clone()
    dart.position.set(0.7, -0.6, 0)
    dart.position.x += (Math.random() - 0.5) * 5
    dart.position.y += (Math.random() - 0.5) * 5
    scene.add(dart)
    dartCount++
    return dart
}

const createCircleDart = () => {
    let dart = new THREE.Mesh()
    dart = dartObject.circleMesh.clone()
    dart.position.set(0.7, -0.6, 0)
    dart.position.y += (Math.random() - 0.5) * 5
    dart.position.x += (Math.random() - 0.5) * 5
    scene.add(dart)
    dartCount++
    return dart
}

const createText = (txtToDisplay, position) => {
    const textGeometry = new THREE.TextGeometry(
        txtToDisplay,
        {
            font: importedFont,
            size: 0.7,
            height: 0.05,
            curveSegments: 8,
            bevelEnabled: true,
            bevelThickness: 0.04,
            bevelSize: 0.02,
            bevelOffset: 0,
            bevelSegment: 5
        }
    )
    textGeometry.center()
    const textMaterial = new THREE.MeshBasicMaterial({color: 0xae2012})
    const text = new THREE.Mesh(textGeometry, textMaterial)
    text.position.set(position.x, position.y, position.z)
    text.lookAt(camera.position)
    text.name = 'text'
    scene.add(text)
}

const random = () => {
    return (Math.random() - 0.5)
}

const loadCrossRing = () => {

    for(let i = 0; i < 4; i++){
        let cross = symbols.cross.clone()
        let ring = symbols.ring.clone()
        cross.name='cross'
        ring.name='ring'

        ring.scale.set(0.15, 0.15, 0.15)

        // x
        ring.position.x =  7 + random()
        cross.position.x = 7 + random() * 4
        ring.rotation.x = Math.random() * Math.PI
        cross.rotation.x = Math.random() * Math.PI

        // y
        ring.position.y = random() * 8
        cross.position.y = random() * 8
        ring.rotation.y = Math.random() * Math.PI
        cross.rotation.y = Math.random() * Math.PI

        // z
        ring.position.z = -12 + random()
        cross.position.z = -12 + random() * 2
        ring.rotation.z = Math.random() * Math.PI
        cross.rotation.z = Math.random() * Math.PI

        scene.add(cross)
        scene.add(ring)
    }

}

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 0
camera.position.y = 0
camera.position.z = 1
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
scene.add(ambientLight)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setClearColor(0x005f73)
renderer.outputEncoding = THREE.sRGBEncoding

/**
 * Hovering mouse
 */
const mouse = new THREE.Vector2()
window.addEventListener('mousemove', function (_event){
    mouse.x = _event.clientX / sizes.width * 2 - 1
    mouse.y = - (_event.clientY / sizes.height * 2 - 1)
})

window.addEventListener('click', function (){
    if(currentIntersect){
        if(!scene.children.find((child) => child.name === 'text')){
            recheckPosition = 1
            updatePlayerPosition(parseInt(currentIntersect.object.name))
            currentIntersect = []
            if (!checkWinner()) {
                setTimeout(() => {
                    updatePcPosition()
                }, 800)
            }
        }
    }
})

const reset = () => {
    while(scene.getObjectByName('crossdart')){
        scene.remove(scene.getObjectByName('crossdart'))
    }
    while(scene.getObjectByName('ringDart')){
        scene.remove(scene.getObjectByName('ringDart'))
    }
    while(scene.getObjectByName('text')){
        scene.remove(scene.getObjectByName('text'))
    }

    for(let i = 1; i <= 9; i++){
        keys[i].value = (Math.random() - 0.5) * 20
    }
    winner = -1
    playedPositions = []
    dartCount = 0
}

const updatePlayerPosition = (position) => {
    if(playedPositions.includes(position)) {
        let positionToDisplay = keys[position].mesh.position.clone()
        positionToDisplay.z += 5
        createText('Position\nPlayed', positionToDisplay)

        setTimeout(() => {
            scene.remove(scene.getObjectByName('text'))
        }, 1200)
        recheckPosition = 0
    }
    else
    {
        const dart = createCrossDart()
        gsap.to(dart.position, {
            duration: 1.3,
            x: keys[position].mesh.position.x,
            y: keys[position].mesh.position.y,
            z: keys[position].mesh.position.z,
            ease: 'power4.out'
        })
        playedPositions.push(position)
        keys[position].value = 10
    }
}

const updatePcPosition = () => {
    if(recheckPosition){
        let pcPosition

        do {
            pcPosition = Math.floor(Math.random() * 9) + 1
        } while (playedPositions.includes(pcPosition))

        const dart = createCircleDart()
        gsap.to(dart.position, {
            duration: 1.3,
            x: keys[pcPosition].mesh.position.x,
            y: keys[pcPosition].mesh.position.y,
            z: keys[pcPosition].mesh.position.z,
            ease: 'power4.out'
        })
        playedPositions.push(pcPosition)
        keys[pcPosition].value = 20
        checkWinner()
    }
}


const checkWinner = () => {
    if(keys[1].value === keys[2].value && keys[2].value === keys[3].value){
        if(keys[1].value === 10) // check if player of pc
            winner = 1
        else if(keys[1].value === 20)
            winner = 2
    }
    else if(keys[4].value === keys[5].value && keys[5].value === keys[6].value){
        if (keys[4].value === 10)
            winner = 1
        else if (keys[4].value === 20)
            winner = 2
    }
    else if(keys[7].value === keys[8].value && keys[8].value === keys[9].value){
        if (keys[7].value === 10)
            winner = 1
        else if (keys[7].value === 20)
            winner = 2
    }
    else if(keys[1].value === keys[4].value && keys[4].value === keys[7].value) {
        if (keys[1].value === 10)
            winner = 1
        else if(keys[1].value === 20)
            winner = 2
    }
    else if(keys[2].value === keys[5].value && keys[5].value === keys[8].value) {
        if (keys[2].value === 10)
            winner = 1
        if (keys[2].value === 20)
            winner = 2
    }
    else if(keys[3].value === keys[6].value && keys[6].value === keys[9].value){
        if (keys[3].value === 10)
            winner = 1
        else if (keys[3].value === 20)
            winner = 2
    }
    else if(keys[1].value === keys[5].value && keys[5].value === keys[9].value) {
        if (keys[1].value === 10)
            winner = 1
        else if(keys[1].value === 20)
            winner = 2
    }
    else if(keys[3].value === keys[5].value && keys[5].value === keys[7].value) {
        if (keys[3].value === 10)
            winner = 1
        else if (keys[3].value === 20)
            winner = 2
    }else if(playedPositions.length === 9){
        winner = 0
    }
    else {
        return false
    }
    let p = camera.position.clone()
    if(winner === 1){
        createText('Y o u\nW i n !', new THREE.Vector3(p.x, p.y, p.z - 2))
        setTimeout(() => {
            reset()
        }, 2000)
        return true
    }
    else if(winner === 2){
        createText('    P C\nW i n s !', new THREE.Vector3(p.x, p.y, p.z - 2))
        setTimeout(() => {
            reset()
        }, 2000)
        return true
    }
    else if(winner === 0){
        createText('D r a w !', new THREE.Vector3(p.x, p.y, p.z - 2))
        setTimeout(() => {
            reset()
        }, 2000)
        return true
    }
}

/**
 * Animate
 */
const clock = new THREE.Clock()
let currentIntersect

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Raycaster
    raycaster.setFromCamera(mouse, camera)

    if(loaded){
        const intersects = raycaster.intersectObjects(objToTest)
        for (const intersect of intersects) {
            currentIntersect = intersects[0]
        }
        scene.children.find((child) => child.name === 'name').position.y += Math.sin(elapsedTime * 2) * 0.005
        scene.children.find((child) => child.name === 'name').scale.x += Math.sin(elapsedTime * 2) * 0.001
        scene.children.find((child) => child.name === 'name').scale.y += Math.sin(elapsedTime * 2) * 0.001
        scene.children.find((child) => child.name === 'name').scale.z += Math.sin(elapsedTime * 2) * 0.001
    }
    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()