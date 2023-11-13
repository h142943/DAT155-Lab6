import * as THREE from '../lib/three.module.js';
export class Smoke {
    // Constructor for the Smoke class
    constructor(camera, scene) {
        // Trenger camera
        this.camera = camera; // Store the camera reference

        this.delta = 0; // Initialize a time delta value

        // Initialize arrays to store shaders, mesh, textures, and materials
        this.vs = [];
        this.fs = [];
        this.mesh = [];
        this.tex = [];
        this.mat = [];

        // Create a TextureLoader and load two textures
        this.texture_loader = new THREE.TextureLoader();
        // Dette her er faktiske bilder, de er encoded som base64 strings
        this.tex["smoke"] = this.texture_loader.load("threejs-template-master/resources/textures/smoke.png");
        this.tex["fire"] = this.texture_loader.load("threejs-template-master/resources/textures/fire.png");
        // Define vertex shader for particles
        this.vs["sprite"] = `
            attribute vec3 offset;
            attribute vec2 scale;
            attribute vec4 quaternion;
            attribute float rotation;
            attribute vec4 color;
            attribute float blend;
            attribute float texture;
            uniform float time;
            varying vec2 vUv;
            varying vec4 vColor;
            varying float vBlend;
            varying float num;
            vec3 localUpVector=vec3(0.0,1.0,0.0);    
            
            void main(){
                float angle=time*rotation;
                vec3 vRotated=vec3(position.x*scale.x*cos(angle)-position.y*scale.y*sin(angle),position.y*scale.y*cos(angle)+position.x*scale.x*sin(angle),position.z);
                
                vUv=uv;
                vColor=color;
                vBlend=blend;
                num=texture;
                
                vec3 vPosition;
                
                /*
                vec3 vLook=normalize(offset-cameraPosition);
                vec3 vRight=normalize(cross(vLook,localUpVector));
                vec3 vUp=normalize(cross(vLook,vRight));
                vPosition=vRight*vRotated.x+vUp*vRotated.y+vLook*vRotated.z;
                */
                  
                vec3 vLook=offset-cameraPosition;
                vec3 vRight=normalize(cross(vLook,localUpVector));
                vPosition=vRotated.x*vRight+vRotated.y*localUpVector+vRotated.z;
                
                gl_Position=projectionMatrix*modelViewMatrix*vec4(vPosition+offset,1.0);
            
            }
        `;

        // Define fragment shader for particles
        this.fs["sprite"] = `
            const int count=3;
            uniform sampler2D map[count];
            varying vec2 vUv;
            varying vec4 vColor;
            varying float vBlend;
            varying float num;
            
            void main(){    
                if(num==0.0){ gl_FragColor=texture2D(map[0],vUv)*vColor; }
                else if(num==1.0){ gl_FragColor=texture2D(map[1],vUv)*vColor; }
                
                gl_FragColor.rgb*=gl_FragColor.a;
                gl_FragColor.a*=vBlend;
            }
        `;

        this.particles = []; // Initialize an array to store particle data

        // Alt annet enn funksjonene skulle være i kontruktøren
        // Set wind values for particles
        this.wind_x = 0.002;
        this.wind_y = 0;
        this.wind_z = 0;

        this.particles_smoke_a = [];

        this.particles_emitter = []; // Initialize an array for particles emitter settings

        // Add a particle emitter configuration to the array
        this.particles_emitter.push({
            position:{x:-1,y:65,z:-5.5},
            radius_1:0.5,
            radius_2:1.5,
            radius_height:5,
            add_time:0.001,
            elapsed:0,
            live_time_from:7,
            live_time_to:7.5,
            opacity_decrease:0.008,
            rotation_from:0.5,
            rotation_to:1,
            speed_from:0.005,
            speed_to:0.01,
            scale_from:0.2,
            scale_increase:0.004,
            color_from:[1,1,1],
            color_to:[0,0,0],
            color_speed_from:0.4,
            color_speed_to:0.4,
            brightness_from:1,
            brightness_to:1,
            opacity:1,
            blend:0.8,
            texture:1,
        });

        this.geometry = new THREE.InstancedBufferGeometry(); // Create an InstancedBufferGeometry to render particles
        // Define attributes for particles
        this.geometry.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array([-0.5, 0.5, 0, -0.5, -0.5, 0, 0.5, 0.5, 0, 0.5, -0.5, 0, 0.5, 0.5, 0, -0.5, -0.5, 0]), 3));
        this.geometry.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array([0, 1, 0, 0, 1, 1, 1, 0, 1, 1, 0, 0]), 2));
        this.geometry.setAttribute('offset', new THREE.InstancedBufferAttribute(new Float32Array(), 3));
        this.geometry.setAttribute('scale', new THREE.InstancedBufferAttribute(new Float32Array(), 2));
        this.geometry.setAttribute('quaternion', new THREE.InstancedBufferAttribute(new Float32Array(), 4));
        this.geometry.setAttribute('rotation', new THREE.InstancedBufferAttribute(new Float32Array(), 1));
        this.geometry.setAttribute('color', new THREE.InstancedBufferAttribute(new Float32Array(), 4));
        this.geometry.setAttribute('blend', new THREE.InstancedBufferAttribute(new Float32Array(), 1));
        this.geometry.setAttribute('texture', new THREE.InstancedBufferAttribute(new Float32Array(), 1));

        // Create a ShaderMaterial for rendering particles
        this.mat["sprite"] = new THREE.ShaderMaterial({
            uniforms: {
                map: {value: [this.tex["smoke"]]},
                time: {value: 0}
            },
            vertexShader: this.vs["sprite"],
            fragmentShader: this.fs["sprite"],
            //side:THREE.DoubleSide,
            transparent: true,
            depthWrite: false,
            blending: THREE.CustomBlending,
            blendEquation: THREE.AddEquation,
            blendSrc: THREE.OneFactor,
            blendDst: THREE.OneMinusSrcAlphaFactor
        });

        // Create a mesh using the geometry and material
        this.mesh["sprite"] = new THREE.Mesh(this.geometry, this.mat["sprite"]);
        this.mesh["sprite"].frustumCulled = false;
        this.mesh["sprite"].matrixAutoUpdate = false;
        this.mesh["sprite"].updateMatrixWorld = function () {
        };

        scene.add(this.mesh["sprite"]);
    }

    // ____________________ PARTICLES EMMITER EMMIT ____________________
    particleEmitterEmit(item) {
        const radius_1 = item.radius_1 * Math.sqrt(Math.random());
        let theta = 2 * Math.PI * Math.random();
        const x_1 = item.position.x + radius_1 * Math.cos(theta);
        const z_1 = item.position.z + radius_1 * Math.sin(theta);

        const radius_2 = item.radius_2 * Math.sqrt(Math.random());
        theta = 2 * Math.PI * Math.random();
        const x_2 = x_1 + radius_2 * Math.cos(theta);
        const z_2 = z_1 + radius_2 * Math.sin(theta);

        let direction_x = x_2 - x_1;
        let direction_y = item.radius_height;
        let direction_z = z_2 - z_1;

        const speed = Math.random() * (item.speed_to - item.speed_from) + item.speed_from;

        const divide = 1 / Math.sqrt(direction_x * direction_x + direction_y * direction_y + direction_z * direction_z) * speed;
        direction_x *= divide;
        direction_y *= divide;
        direction_z *= divide;

        const brightness = Math.random() * (item.brightness_to - item.brightness_from) + item.brightness_from;

        this.particles_smoke_a.push({
            offset: [x_1, item.position.y, z_1],
            scale: [item.scale_from, item.scale_from],
            quaternion: [direction_x, direction_y, direction_z, 3],
            rotation: Math.random() * (item.rotation_to - item.rotation_from) + item.rotation_from,
            color: [1, 1, 1, item.opacity],
            blend: item.blend,
            texture: item.texture,
            live: Math.random() * (item.live_time_to - item.live_time_from) + item.live_time_from,
            scale_increase: item.scale_increase,
            opacity_decrease: item.opacity_decrease,
            color_from: [item.color_from[0] * brightness, item.color_from[1] * brightness, item.color_from[2] * brightness],
            color_to: [item.color_to[0] * brightness, item.color_to[1] * brightness, item.color_to[2] * brightness],
            color_speed: Math.random() * (item.color_speed_to - item.color_speed_from) + item.color_speed_from,
            color_pr: 0
        });
    }

    // ____________________ PERTICLES EMMITER UPDATE ____________________
    particleEmitterUpdate() {
        let item;
        let max = this.particles_emitter.length;

        for (let n = 0; n < max; n++) {
            item = this.particles_emitter[n];

            let add = 0;

            item.elapsed += this.delta;
            add = Math.floor(item.elapsed / item.add_time);
            item.elapsed -= add * item.add_time;
            if (add > 0.016 / item.add_time * 60) {
                item.elapsed = 0;
                add = 0;
            }

            while (add--) {
                this.particleEmitterEmit(item);
            }
        }

        max = this.particles_smoke_a.length;
        const alive = new Array(max);
        let i = 0;

        for (let j = 0; j < max; j++) {
            item = this.particles_smoke_a[j];

            if (item.color_pr < 1) {
                const color_r = item.color_from[0] + (item.color_to[0] - item.color_from[0]) * item.color_pr;
                const color_g = item.color_from[1] + (item.color_to[0] - item.color_from[1]) * item.color_pr;
                const color_b = item.color_from[1] + (item.color_to[0] - item.color_from[2]) * item.color_pr;
                item.color_pr += this.delta * item.color_speed;
                item.color[0] = color_r;
                item.color[1] = color_g;
                item.color[2] = color_b;
            } else {
                item.color[0] = item.color_to[0];
                item.color[1] = item.color_to[1];
                item.color[2] = item.color_to[2];
            }

            item.offset[0] += item.quaternion[0] + this.wind_x;
            item.offset[1] += item.quaternion[1] + this.wind_y;
            item.offset[2] += item.quaternion[2] + this.wind_z;
            item.scale[0] += item.scale_increase;
            item.scale[1] += item.scale_increase;

            if (item.live > 0) {
                item.live -= this.delta;
            } else {
                item.color[3] -= item.opacity_decrease;
            }
            if (item.color[3] > 0) {
                alive[i] = item;
                i++;
            }
        }
        alive.length = i;
        this.particles_smoke_a = alive;
    }

    emitParticles(item) {
        // Implement the logic of your particles_emitter_emmit function here.
        // You can copy the code from your original function.
    }

    // ____________________ PARTICLES UPDATE ____________________
    particlesUpdate() {
        let n;
        this.particleEmitterUpdate();

        this.particles = [];

        const max_1 = this.particles_smoke_a.length;
        this.particles.length = max_1;
        for (n = 0; n < max_1; n++) {
            this.particles[n] = this.particles_smoke_a[n];
        }

        const count = this.particles.length;
        let item = this.camera.position;
        const x = item.x;
        const y = item.y;
        const z = item.z;

        for (n = 0; n < count; n++) {
            item = this.particles[n].offset;
            this.particles[n].d = Math.sqrt(Math.pow((x - item[0]), 2) + Math.pow((y - item[1]), 2) + Math.pow((z - item[2]), 2));
        }

        this.particles.sort((a, b) => b.d - a.d);

        const offset = new Float32Array(count * 3);
        const scale = new Float32Array(count * 2);
        const quaternion = new Float32Array(count * 4);
        const rotation = new Float32Array(count);
        const color = new Float32Array(count * 4);
        const blend = new Float32Array(count);
        const texture = new Float32Array(count);

        for (n = 0; n < count; n++) {
            // 1 VALUE
            item = this.particles[n];
            rotation[n] = item.rotation;
            texture[n] = item.texture;
            blend[n] = item.blend;

            // 2 VALUE
            let p = n * 2;
            let one = p + 1;
            const i_scale = item.scale;
            scale[p] = i_scale[0];
            scale[one] = i_scale[1];

            // 3 VALUE
            p = n * 3;
            one = p + 1;
            let two = p + 2;
            const i_offset = item.offset;
            offset[p] = i_offset[0];
            offset[one] = i_offset[1];
            offset[two] = i_offset[2];

            // 4 VALUE
            p = n * 4;
            one = p + 1;
            two = p + 2;
            const three = p + 3;
            const i_color = item.color;
            color[p] = i_color[0];
            color[one] = i_color[1];
            color[two] = i_color[2];
            color[three] = i_color[3];
            const i_quaternion = item.quaternion;
            quaternion[p] = i_quaternion[0];
            quaternion[one] = i_quaternion[1];
            quaternion[two] = i_quaternion[2];
            quaternion[three] = i_quaternion[3];
        }

        item = this.mesh["sprite"].geometry.attributes;
        item.offset = new THREE.InstancedBufferAttribute(offset, 3).setUsage(THREE.DynamicDrawUsage);
        item.scale = new THREE.InstancedBufferAttribute(scale, 2).setUsage(THREE.DynamicDrawUsage);
        item.quaternion = new THREE.InstancedBufferAttribute(quaternion, 4).setUsage(THREE.DynamicDrawUsage);
        item.rotation = new THREE.InstancedBufferAttribute(rotation, 1).setUsage(THREE.DynamicDrawUsage);
        item.color = new THREE.InstancedBufferAttribute(color, 4).setUsage(THREE.DynamicDrawUsage);
        item.blend = new THREE.InstancedBufferAttribute(blend, 1).setUsage(THREE.DynamicDrawUsage);
        item.texture = new THREE.InstancedBufferAttribute(texture, 1).setUsage(THREE.DynamicDrawUsage);

        this.mesh["sprite"].geometry._maxInstanceCount = count;
    }

    // Update function called on each frame
    tick(clock) {
        this.delta = clock.getDelta();

        this.particlesUpdate();

        this.mat["sprite"].uniforms.time.value = clock.elapsedTime;
    }
}