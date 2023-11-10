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
        this.tex["smoke"] = this.texture_loader.load("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAAF0WlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDUgNzkuMTYzNDk5LCAyMDE4LzA4LzEzLTE2OjQwOjIyICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOSAoV2luZG93cykiIHhtcDpDcmVhdGVEYXRlPSIyMDIwLTEwLTA2VDE3OjEwOjAzKzAzOjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAyMi0wMi0wNlQxMzozOTo0MSswMzowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAyMi0wMi0wNlQxMzozOTo0MSswMzowMCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MTA5NzNhNjYtNTFmMC1iMDRlLWE5NDMtNzVjZmFjNDYxZTc4IiB4bXBNTTpEb2N1bWVudElE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");
        this.tex["fire"] = this.texture_loader.load("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAACXBIWXMAAAsTAAALEwEAmpwYAAAF0WlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDUgNzkuMTYzNDk5LCAyMDE4LzA4LzEzLTE2OjQwOjIyICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOSAoV2luZG93cykiIHhtcDpDcmVhdGVEYXRlPSIyMDIyLTAxLTI2VDEyOjMzOjQyKzAzOjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAyMi0wMi0wNlQxNjoxMjoyOCswMzowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAyMi0wMi0wNlQxNjoxMjoyOCswMzowMCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6ZjliNDEzZTUtOTUyNy0yMjQxLTgwZjktMDBkYjM5Y2NjOGYyIiB4bXBNTTpEb2N1bWVudElE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");

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
            position:{x:0,y:66,z:-5.5},
            radius_1:3, //endret
            radius_2:2, //endret
            radius_height:9, //endret
            add_time:0.1,
            elapsed:0,
            live_time_from:20,
            live_time_to:20.5,
            opacity_decrease:0.008,
            rotation_from:0.5,
            rotation_to:1,
            speed_from:0.008, //endret
            speed_to:0.03, //endret
            scale_from:3, // endret
            scale_increase:0.005,
            color_from:[2,2,2],
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