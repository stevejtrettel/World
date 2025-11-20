import {
    DoubleSide,
    Matrix3,
    Mesh,
    PlaneGeometry,
    TextureLoader,
    Vector3
} from "../../../../3party/three/build/three.module.js";

import {CustomShaderMaterial} from "../../../../3party/three-csm.m.js";
import {createFragmentCSM,createVertexCSM} from "../../../../code/items/maps/createCSM.js";


const getTexCoord = `
//extra stuff for getting texture coordinates:

vec2 rescale( vec2 uv ){
    float scale = 1.;
    uv = vec2(uv.y,uv.x);
    return fract(scale*uv);
}

vec2 applyMCG( vec2 uv ){
    uv = rescale(uv);
    mat2 mcg = mat2(a,c,b,d);
    vec2 res = mcg*uv;
    return fract(res); 
}



vec3 colorFnGrid(vec2 uv){

       uv = fract(20.*uv);
       float x = uv.x;
       float y = uv.y;
       
       vec3 col=vec3(1);
       if(abs(uv.x-0.5)<0.4 && abs(uv.y-0.5)<0.4){
        col= vec3(0.5,0,0);
        }
        if(abs(uv.x-0.5)<0.15 && abs(uv.y-0.5)<0.15){
        col= vec3(1);
        }
       return col;
}


vec3 colorFnGen(vec2 uv){
    vec3 col = vec3(1);
    if(abs(uv.x)<0.07){
         col = vec3(0.5,0,0);
    }
    if(abs(uv.y)<0.07){
       col = vec3(0,0,0.5);
    }
   
    return col;
  
}


`;



class TorusMCG {
    constructor(mapTexAddress) {
        this.position = new Vector3(0,0,0);
        this.orientation = new Matrix3();
        this.tex = new TextureLoader().load(mapTexAddress);
        this.geometry = new PlaneGeometry(1,1,100,100);
        this.buildMaterial();
        this.map = new Mesh(this.geometry,this.material);
        this.map.position.set(this.position.x,this.position.y,this.position.z);
    }

    buildMaterial(){

        //build the vertex shader functions:
        this.uniforms = {
            tex: {value: this.tex},
            chooseTex: {value:1},
            a:{value:1},
            b:{value:0},
            c:{value:0},
            d:{value:1},
        };
        let uniforms = `
        uniform sampler2D tex;
        uniform int chooseTex;
        uniform int a;
        uniform int b;
        uniform int c;
        uniform int d;
        `;

        let vertAuxFns='';
        let displace = `
        vec3 displace(vec2 uv){
            float size =2.;
            float A = 1.;
            float B = 2.;
            
            float theta = 6.29*(uv.x);
            float phi = 6.29*(uv.y);
            float r = A*cos(theta)+B;
            
            float x = r*cos(phi);
            float y = r*sin(phi);
            float z = A*sin(theta);
            
            return size*vec3(x,y,z);
            }
        `;
        let vertex = createVertexCSM(uniforms, vertAuxFns, displace);

        let options = {};


        const colorFn =  getTexCoord + `
        vec3 colorFn(vec2 uv, vec3 xyz){
                vec2 coords = applyMCG(uv);
                vec3 color = vec3(0);
                if(chooseTex==1){
                    color = colorFnGen(coords);
                }
                else if(chooseTex==2){
                 color = colorFnGrid(coords);
                }
                return color;
        }`;

        let fragMain = `vec3 fragColor(){
                vec3 col = colorFn(vUv, vPosition);
                return col;
            }`;


        let fragment = createFragmentCSM(uniforms, colorFn, fragMain);

        //make the custom material with the vertex shader, and using the fragment shader
        let customMatParameters = {
            baseMaterial: "MeshPhysicalMaterial",
            vShader: vertex,
            fShader: fragment,
            uniforms: this.uniforms,
            passthrough: {
                side: DoubleSide,
                clearcoat:1,
                ... options
            },
        };

        //use Farazz's CustomShaderMaterial class
        this.material = new CustomShaderMaterial( customMatParameters );
    }


    addToScene(scene){
        scene.add(this.map);
    }

    addToUI(ui){
        let params = {
            a: 1,
            b:0,
            c:0,
            d:1,
        }
        let uniforms = this.uniforms;
        let mat = this.material;
        ui.add(params, 'a').onChange(function(value){
            mat.uniforms.a.value = value;
        });
        ui.add(params, 'b').onChange(function(value){
            mat.uniforms.b.value = value;
        });
        ui.add(params, 'c').onChange(function(value){
            mat.uniforms.c.value = value;
        });
        ui.add(params, 'd').onChange(function(value){
            mat.uniforms.d.value = value;
        });
        ui.add(uniforms, 'chooseTex', {generators: 1, grid: 2 }).onChange(function(value){
            mat.uniforms.chooseTex.value = value;
        });

    }

    tick(time,dTime){

    }

}


export default TorusMCG;
