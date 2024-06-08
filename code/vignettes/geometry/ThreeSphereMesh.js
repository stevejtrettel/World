import {OBJLoader} from "../../../3party/three/examples/jsm/loaders/OBJLoader.js";
import {DoubleSide, Mesh} from "../../../3party/three/build/three.module.js";
import {CustomShaderMaterial} from "../../../3party/three-csm.m.js";



import {projectR4} from "../../shaders/geometry/projectR4.js";
import {rotateR4} from "../../shaders/geometry/rotateR4.js";
import {rotateR3} from "../../shaders/geometry/rotateR3.js";



//-------------------------------------------------------------------
// SHADERS FOR THE CUSTOM MATERIAL
//-------------------------------------------------------------------


const constants = ` float PI = 3.14159; \n`

const varyings = `
    varying vec2 vUv;
    varying vec3 vPosition;
    //for some reason varying vNormal is already defined for us
`;

const uniforms = `
uniform float time;
uniform float ang;
`;

const vertAuxFns = projectR4 + rotateR4 + rotateR3;

const displace= `    
vec3 displace(vec3 pos){

       // pos = vec3(pos.y,-pos.z,pos.x);
        vec3 axis = vec3(1,0,0);
        float angle = 0.1*time;
        mat4 rot = rotationMatrix(axis, angle);
        pos = (rot*vec4(pos,1)).xyz;
        
        
        vec4 sphPos = invStereographicProj(0.01*pos+vec3(0.,0.5,0));
        sphPos = rotateR4(sphPos,0., ang, 0.);
        vec3 newPos = stereographicProj(sphPos);
        return newPos;
    }
    `;






//-------------------------------------------------------------------
// THE CLASS ITSELF
//-------------------------------------------------------------------

class ThreeSphereMesh{
    constructor(model){

        this.model=model;
        this.loader  = new OBJLoader();

        //object will be defined when we add to scene
        this.object = undefined;

        this.uniforms= {
            time:{value:0},
            ang:{value:0},
        };

        this.params={ang:0};


        //the vertex shader
        const newPos = `vec3 newPos = displace( position );`;
        const newNormal = `vec3 newNormal = normal;`;
        const varyingValues = `
                    vUv = uv;
                    vPosition = newPos;
                    vNormal = newNormal;
                `;

        this.vertex = {
            defines:  constants + varyings + uniforms,
            header: vertAuxFns+displace,
            main: newPos + newNormal + varyingValues
        };

        this.material=undefined;

    }

    addToScene(scene){
        this.loader.load(
            this.model,
            (object) => {

                //make the custom material with the vertex shader, and using the fragment shader
                let customMatParameters = {
                    baseMaterial: "MeshPhysicalMaterial",
                    vShader: this.vertex,
                    uniforms: this.uniforms,
                    passthrough: {
                        color: 0x398046,
                        side: DoubleSide,
                    },
                };

                let mat = new CustomShaderMaterial( customMatParameters );


                object.traverse( function ( child ) {
                    if ( child instanceof Mesh ) {
                        // ...and we replace the material with our custom one
                        child.material = mat;
                    }
                });


                this.material = mat;
                this.object = object;
                scene.add(this.object);

            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
            },
            (error) => {
                console.log(error)
            }
        );


    }

    addToUI(ui){
        ui.add(this.params,'ang',0,6.29,0.01).onChange(value=>this.uniforms.ang.value=value);
    }

    tick(time, dTime){
        this.uniforms.time.value=time;

        // // AN ATTEMPT TO RECOMPUTE VERTEX NORMALS: BUT LEAVES US WITH FLAT SHADING
        // if(this.object){
        //     this.object.traverse( function ( child ) {
        //         if ( child instanceof Mesh ) {
        //             // ...get the new normal vector
        //             child.geometry.computeVertexNormals();
        //         }
        //     });
        // }
    }

}

export default ThreeSphereMesh;