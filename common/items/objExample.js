import {OBJLoader} from "../../3party/three/examples/jsm/loaders/OBJLoader.js";
import {MeshNormalMaterial, Mesh, DoubleSide, Vector3} from "../../3party/three/build/three.module.js";
import {CustomShaderMaterial} from "../../3party/three-csm.m.js";

import {projectR4} from "../shaders/geometry/projectR4.js";
import{rotateR4} from "../shaders/geometry/rotateR4.js";
import {rotateR3} from "../shaders/geometry/rotateR3.js";

//shader pieces to build up a custom shader material

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

const generateNewPos= `    
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








const newPos = `
    vec3 newPos = displace( position );
`;

const newNormal = `
    vec3 newNormal = normal;
`;

const varyingValues = `
    vUv = uv;
    vPosition = newPos;
    vNormal = newNormal;
`;







    const defines = constants + varyings + uniforms;
    const header = vertAuxFns+generateNewPos;
    let main = newPos + newNormal + varyingValues;







class objExample{
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
        this.vertex = {
            defines: defines,
            header: header,
            main: main
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

       // if(this.object){
       //     this.object.traverse( function ( child ) {
       //         if ( child instanceof Mesh ) {
       //             // ...and we replace the material with our custom one
       //             child.geometry.computeVertexNormals();
       //         }
       //     });
      // }
    }

}




let ex = new objExample('./3party/three/examples/models/walt/WaltHead.obj');

export default {ex};