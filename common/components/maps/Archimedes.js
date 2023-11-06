import {
    DoubleSide,
    Matrix3,
    Mesh,
    PlaneGeometry,
    TextureLoader,
    Vector3
} from "../../../3party/three/build/three.module.js";
import {ParametricGeometry} from "../../../3party/three/examples/jsm/geometries/ParametricGeometry.js";
import {postprocess} from "../../shaders/colors/postprocess.js";
import {CustomShaderMaterial} from "../../../3party/three-csm.m.js";
import {createFragmentCSM,createVertexCSM} from "./createCSM.js";


const getTexCoord = `

vec3 toSphere(vec2 uv){
    //uv is in [-0.5,0.5]^2
    float theta = 2.*3.1415*uv.x;
    float phi = 2.*3.1415/2.*(uv.y+0.5);
    float x = cos(theta)*sin(phi);
    float y = sin(theta)*sin(phi);
    float z = cos(phi);
    return vec3(x,-z,-y);
}

vec3 rotXY(vec3 v, float t){
    float x=v.x*cos(t)-v.z*sin(t);
    float z=v.x*sin(t)+v.z*cos(t);

    return vec3(x,v.y,z);
}

vec3 toSphCoordsNoSeam(vec3 v){
    float theta=atan(v.y,v.x);
    float theta2=atan(v.y,abs(v.x));
    float phi=acos(v.z);
    return vec3(theta,phi,theta2);
}

vec3 getTexOnSph(vec3 v){
    vec3 angles=toSphCoordsNoSeam(normalize(v.xzy));
    //theta coordinates (x=real, y=to trick the derivative so there's no seam)
    float x=(angles.x+3.1415)/(2.*3.1415);
    float z=(angles.z+3.1415)/(2.*3.1415);
    float y=1.-angles.y/3.1415;
    vec2 uv=vec2(x,y);
    vec2 uv2=vec2(z,y);//grab the other arctan piece;
    vec3 color= textureGrad(tex,uv,dFdx(uv2), dFdy(uv2)).rgb;
    return color;
}
`;



class Archimedes{
    constructor() {
        this.position = new Vector3(0,0,0);
        this.orientation = new Matrix3();
        this.tex = new TextureLoader().load('./earth.jpeg');
        this.geometry = new PlaneGeometry(1,1,100,100);
        this.buildMaterial();
        this.map = new Mesh(this.geometry,this.material);
        this.map.position.set(this.position.x,this.position.y,this.position.z);
    }

    buildMaterial(){

        //build the vertex shader functions:
        this.uniforms = {
            tex: {value: this.tex},
            time:{value:0},
            toCyl:{value:0.},
            toPlane:{value:0.},
            orientation:{value: new Matrix3()},
            animate:{value:false},
            rotate:{value:0.5},
        };
        let uniforms = `uniform sampler2D tex;
                        uniform float time;
                        uniform float toCyl;
                        uniform float toPlane;
                        uniform mat3 orientation;
                        uniform bool animate;
                        uniform float rotate;
                        `;

        let vertAuxFns='';
        let displace = `
        vec3 displace(vec2 uv){
            float size =2.;
            float theta = -6.28*(uv.x);
            float h = sin(3.14*uv.y);
            float R = 1./(1.-toPlane);
            float r = sqrt(1.-toCyl*h*h);
            float x;
            float z;
            
            if(toPlane<1.){
            x = R*r*sin(theta/R);
            z = R*r*cos(theta/R)-R;
            }
            else{
            x = theta;
            z = 0.;
            }
            
            float y = h;
            return size*vec3(x,y,z);
            }
        `;
        let vertex = createVertexCSM(uniforms, vertAuxFns, displace);

        let options = {};


        const colorFn =  getTexCoord + `
        vec3 colorFn(vec2 uv, vec3 xyz){
            vec3 s = toSphere(uv);
            s=orientation*s; 
            s=rotXY(s,-time/5.*rotate);
            return getTexOnSph(s);
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

}


export default Archimedes;