import {
    PerspectiveCamera,
    WebGLRenderer,
    PCFSoftShadowMap,
    Scene,
    Mesh,
    TextureLoader,
    RepeatWrapping,
    DirectionalLight,
    Vector3,
    AxesHelper,
    CubeTextureLoader,
    PlaneGeometry,
    MeshBasicMaterial,
    Group,
    Clock,
    PlaneBufferGeometry,
    BufferAttribute,
    MeshStandardMaterial,
    Color,
    Raycaster
} from './js/lib/three.module.js';

import Utilities from './js/lib/Utilities.js';
import MouseLookController from './js/controls/MouseLookController.js';
import TextureSplattingMaterial from './js/materials/TextureSplattingMaterial.js';
import TerrainBufferGeometry from './js/terrain/TerrainBufferGeometry.js';
import { GLTFLoader } from './js/loaders/GLTFLoader.js';
import { SimplexNoise } from './js/lib/SimplexNoise.js';
import {Water} from "./js/objects/water/water2.js";
import {VRButton} from "./js/lib/VRButton.js";
import {Smoke} from "./js/objects/Smoke.js";

async function main() {
    const loc = window.location.pathname;
    const main_url = loc.substring(0, loc.lastIndexOf('/'))+ "/threejs-template-master/";
    //const scene = new Scene();
    const scene = new Scene();
    {
        console.log(main_url);
        const loader = new CubeTextureLoader();
        scene.background = loader.load([
            main_url + 'resources/skybox/Daylight_Box_Right.bmp',
            main_url + 'resources/skybox/Daylight_Box_Left.bmp',
            main_url + 'resources/skybox/Daylight_Box_Top.bmp',
            main_url + 'resources/skybox/Daylight_Box_Bottom.bmp',
            main_url + 'resources/skybox/Daylight_Box_Front.bmp',
            main_url + 'resources/skybox/Daylight_Box_Back.bmp'
        ]);
    }

    const axesHelper = new AxesHelper(15);
    scene.add(axesHelper);

    const user = new Group(); //made a group

    const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);

    user.add(camera);
    scene.add(user);

    const canvas = document.createElement("canvas");

    canvas.addEventListener('click', () => {
        canvas.requestPointerLock();
    });

    const context = canvas.getContext("webgl2") //adding because vr rendering won't work without webgl2
    const renderer = new WebGLRenderer({ antialias: true, context, canvas });
    renderer.setClearColor(0xffffff);
    renderer.setSize(window.innerWidth, window.innerHeight);

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFSoftShadowMap;

    /**
     * Handle window resize:
     *  - update aspect ratio.
     *  - update projection matrix
     *  - update renderer size
     */
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);
    }, false);

    /**
     * Add canvas element to DOM.
     */
    document.body.appendChild(renderer.domElement);
    document.body.appendChild(VRButton.createButton(renderer));
    renderer.xr.enabled = true;

    /**
     * Add light
     */

    const directionalLight = new DirectionalLight(0xffffff);
    directionalLight.position.set(300, 400, 0);

    directionalLight.castShadow = true;

    //Set up shadow properties for the light
    directionalLight.shadow.mapSize.width = 512;
    directionalLight.shadow.mapSize.height = 512;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 2000;

    scene.add(directionalLight);

    // Set direction
    directionalLight.target.position.set(0, 15, 0);
    scene.add(directionalLight.target);


    //Camera

    user.position.z = 60;
    user.position.y =70;
    camera.rotation.x -= Math.PI * 0.25;

    function UpdateCamera(moveSpeed, velocity) {

        const cameraPosition = user.position;

        velocity.applyQuaternion(camera.quaternion);
        cameraPosition.add(velocity);

        // Test for vannet
        if (cameraPosition.y <= water.position.y + 1){
            cameraPosition.y = water.position.y + 1;
        }

        // Test for terreng:

        const rayDirection = new Vector3(0, -1, 0);
        const ray = new Raycaster(cameraPosition, rayDirection, 0, 2);

        const intersects = ray.intersectObject(terrain);
        const intersects2 = ray.intersectObject(lavaMesh);

        if (intersects.length > 0) {
            // Camera is below the terrain, adjust its position
            cameraPosition.copy(intersects[0].point);
            cameraPosition.y += 2;
        }
        if (intersects2.length > 0) {
            // Camera is below the terrain, adjust its position
            cameraPosition.copy(intersects2[0].point);
            cameraPosition.y += 2;
        }

        user.position.y = cameraPosition.y;
    }


    /**
     * Add terrain:
     *
     * We have to wait for the image file to be loaded by the browser.
     * There are many ways to handle asynchronous flow in your application.
     * We are using the async/await language constructs of Javascript:
     *  - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function
     */

    const heightmapImage = await Utilities.loadImage(main_url+'/resources/images/vulkanmodell3.png');
    const width = 372;

    const simplex = new SimplexNoise();
    const terrainGeometry = new TerrainBufferGeometry({
        width,
        heightmapImage,
        // noiseFn: simplex.noise.bind(simplex),
        numberOfSubdivisions: 600,
        height: 126
    });

    const grassTexture = new TextureLoader().load(main_url+'resources/textures/grass_02.png');
    grassTexture.wrapS = RepeatWrapping;
    grassTexture.wrapT = RepeatWrapping;
    grassTexture.repeat.set(5000 / width, 5000 / width);

    const snowyRockTexture = new TextureLoader().load(main_url+'resources/textures/snowy_rock_01.png');
    snowyRockTexture.wrapS = RepeatWrapping;
    snowyRockTexture.wrapT = RepeatWrapping;
    snowyRockTexture.repeat.set(1500 / width, 1500 / width);


    const splatMap = new TextureLoader().load(main_url+'resources/images/vulkanmodell3.png');

    const terrainMaterial = new TextureSplattingMaterial({
        color: 0xffffff,
        shininess: 0,
        textures: [grassTexture, snowyRockTexture],
        splatMaps: [splatMap]
    });

    const terrain = new Mesh(terrainGeometry, terrainMaterial);

    terrain.castShadow = true;
    terrain.receiveShadow = true;

    terrain.position.y = -2;

    scene.add(terrain);


// Water
    //if we add more water segments, we have more detail for the depth buffer, solving the weird coastline
    const waterGeometry = new PlaneGeometry( 10000, 10000, 100);

    let water = new Water(
        waterGeometry,
        {
            textureWidth: 512,
            textureHeight: 512,
            waterNormals: new TextureLoader().load(main_url+'resources/images/waternormals.jpg', function ( texture ) {
                texture.wrapS = texture.wrapT = RepeatWrapping;
            } ),
            sunDirection: new Vector3(),
            sunColor: 0xffffff,
            waterColor: 0x001e0f,
            distortionScale: 3.7,
            fog: scene.fog !== undefined
        }
    );

    water.position.y = 0;
    water.rotation.x = - Math.PI / 2;

    scene.add( water );


    /**
     * Create the Lava geometry:
     */

    // Load lava texture, emissive map and displacement map
    const lavaTexture = new TextureLoader().load(main_url+'/resources/textures/lavaTexture.jpg');
    const emissiveMap = new TextureLoader().load(main_url+'/resources/textures/emissivelava.jpg');
    const displacementMap = new TextureLoader().load(main_url+'/resources/textures/displacedmentlava.png');

    // Create a lava geometry
    const lavaGeometry = new PlaneBufferGeometry(20, 20, 256, 256);

    // Modify UV coordinates to make the entire texture wave
    lavaGeometry.setAttribute('uv2', new BufferAttribute(lavaGeometry.attributes.uv.array, 2));

    // Create a lava material with emissive properties
    const lavaMaterial = new MeshStandardMaterial({
        map: lavaTexture,
        emissive: new Color(0xff0000), // Emissive color (red)
        emissiveMap:emissiveMap,
        emissiveIntensity: 1.0, // Emission strength
        displacementMap: displacementMap,
        displacementScale: 1.0, // Adjust the scale to control the wave height
        roughness: 0.7, // Adjust this based on the surface properties
        metalness: 0.0, // Adjust this based on the surface properties
    });

    // Create a lava mesh using the lava material and geometry
    const lavaMesh = new Mesh(lavaGeometry, lavaMaterial);

    // Position the lava mesh
    lavaMesh.rotation.x = - Math.PI / 2;
    lavaMesh.position.set(0, 64, -5.5);
    lavaMesh.scale.set(0.7, 0.7, 0.7);

    // Add the lava mesh to the scene
    scene.add(lavaMesh);

    /**
     * Add trees
     */

    function generatePoints(centerX, centerY, radius, numPoints) {
        const points = [];

        for (let i = 0; i < numPoints; i++) {
            const angle = Math.random() * 2 * Math.PI;
            const radiusMultiplier = Math.sqrt(-2 * Math.log(Math.random()));

            const x = centerX + radius * radiusMultiplier * Math.cos(angle);
            const y = centerY + radius * radiusMultiplier * Math.sin(angle);

            points.push({ x, y });
        }

        return points;
    }

    // instantiate a GLTFLoader for loading the trees:
    const loader = new GLTFLoader();

    loader.load(
        'threejs-template-master/resources/models/trees/lowpolyfree.glb',
        (object) => {
            const points = generatePoints(0, 0, 100, 1000);

            // Place trees based on points
            for (const point of points) {
                const px = point.x;
                const pz = point.y;

                const height = terrainGeometry.getHeightAt(px, pz);

                // Only place trees within the specified height
                if (height < 20 && height > 6) {
                    const tree = object.scene.children[0].clone();

                    // Add light and shadow
                    tree.traverse((child) => {
                        if (child.isMesh) {
                            const treeMaterial = child.material;
                            treeMaterial.emissive.set('#aaff00'); // Add light green to the model (to brighten it)
                            treeMaterial.emissiveIntensity = 0.1;
                            child.castShadow = true;
                            child.receiveShadow = true;
                        }
                    });

                    tree.position.x = px;
                    tree.position.y = height - 2;
                    tree.position.z = pz;

                    tree.scale.multiplyScalar(4 + Math.random() * 1);

                    scene.add(tree);
                }
            }
        },
        // Progress callback
        (xhr) => {
            console.log(((xhr.loaded / xhr.total) * 100) + '% loaded');
        },
        // Error callback
        (error) => {
            console.error('Error loading model.', error);
        }
    );


    /**
     * Set up camera controller:
     */

    const mouseLookController = new MouseLookController(camera);

    // We attach a click lister to the canvas-element so that we can request a pointer lock.
    // https://developer.mozilla.org/en-US/docs/Web/API/Pointer_Lock_API

    let yaw = 0;
    let pitch = 0;
    const mouseSensitivity = 0.001;

    function updateCamRotation(event) {
        yaw += event.movementX * mouseSensitivity;
        pitch += event.movementY * mouseSensitivity;
    }

    document.addEventListener('pointerlockchange', () => {
        if (document.pointerLockElement === canvas) {
            canvas.addEventListener('mousemove', updateCamRotation, false);
        } else {
            canvas.removeEventListener('mousemove', updateCamRotation, false);
        }
    });

    let move = {
        forward: false,
        backward: false,
        left: false,
        right: false,
        speed: 0.01
    };

    window.addEventListener('keydown', (e) => {
        if (e.code === 'KeyW') {
            move.forward = true;
            e.preventDefault();
        } else if (e.code === 'KeyS') {
            move.backward = true;
            e.preventDefault();
        } else if (e.code === 'KeyA') {
            move.left = true;
            e.preventDefault();
        } else if (e.code === 'KeyD') {
            move.right = true;
            e.preventDefault();
        }
    });

    window.addEventListener('keyup', (e) => {
        if (e.code === 'KeyW') {
            move.forward = false;
            e.preventDefault();
        } else if (e.code === 'KeyS') {
            move.backward = false;
            e.preventDefault();
        } else if (e.code === 'KeyA') {
            move.left = false;
            e.preventDefault();
        } else if (e.code === 'KeyD') {
            move.right = false;
            e.preventDefault();
        }
    });

    const velocity = new Vector3(0.0, 0.0, 0.0);

    const clock = new Clock();

    function VRMovement(){
        const session = renderer.xr.getSession();
        const speed = 0.2;
        if(session && session.inputSources[0]) {
            const gamepad = session.inputSources[0].gamepad;
            if(gamepad) {
                const x = gamepad.axes[2];
                const y = gamepad.axes[3];
                //*speed so that the position depends on player speed
                var movement = new Vector3(x*speed, 0, y*speed);

                //same idea with speed here
                if(gamepad.buttons[4].pressed){
                    movement.y += 1*speed;
                }
                else if(gamepad.buttons[5].pressed){
                    movement.y += -1*speed;
                }
                return movement;
            }
        }
        return new Vector3();
    }

    /**Smoke*/
    const smoke = new Smoke(camera,scene);

    // Animation loop to make the smoke rise
    function animateSmoke(){
        smoke.tick(clock);
    }

    // Create an animate function to render the scene
    function animateLava() {

        const time = clock.getElapsedTime();
        const displacementScale = 1.0 + Math.sin(time * 2.0) * 1;

        // Update the displacementScale property in the material
        lavaMaterial.displacementScale = displacementScale;
    }
    function loop() {
        //switching to clock because we can no longer use performance due to switching to animation loop (does the same thing)
        const delta = clock.getDelta();

        const moveSpeed = move.speed * delta;

        velocity.set(0.0, 0.0, 0.0);

        if (move.left) {
            velocity.add(new Vector3(-1,0,0));
        }

        if (move.right) {
            velocity.add(new Vector3(1,0,0));
        }

        if (move.forward) {
            velocity.add(new Vector3(0,0,-1));
        }

        if (move.backward) {
            velocity.add(new Vector3(0,0,1));
        }

        //UpdateCamera(moveSpeed, velocity); // user
        velocity.add(VRMovement())

        // update controller rotation.
        mouseLookController.update(pitch, yaw);
        yaw = 0;
        pitch = 0;

        //UpdateCamera(moveSpeed, velocity); // user

        // apply rotation to velocity vector, and translate moveNode with it.

                velocity.applyQuaternion(camera.quaternion);
                user.position.add(velocity);
                const minHight = terrainGeometry.getHeightAt(user.position.x, user.position.z) + terrain.position.y+1;
                user.position.y = Math.max(user.position.y, minHight);


        // user

        // Call the animateSmoke function to update the smoke particles
        animateSmoke();

        // Call the animate function to start rendering
        animateLava();

        const time = performance.now() * 0.001;

        water.material.uniforms[ 'time' ].value += 1.0 / 60.0;
        UpdateCamera(moveSpeed, velocity);
        // render scene:
        renderer.render(scene, camera);
    }

    //vr rendering requires us to use this
    renderer.setAnimationLoop(loop);
}

main(); // Start application