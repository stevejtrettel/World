
import ParametricSurface from "../../components/parametric/ParametricSurface.js";
import {DoubleSide} from "../../../3party/three/build/three.module.js";

let defaultParams = {};


class ModulusFunction{
    constructor(params=defaultParams){

        this.params = {
            eqnType:1
        }

        this.surfaceColor = `
            vec3 colorFn(vec2 uv, vec3 xyz){
             
             //draw gridlines on the domain
             float grid1 = (1.-pow(abs(sin(10.*3.14*uv.x)*sin(10.*3.14*uv.y)),0.1))/10.;
             float grid2 = (1.-pow(abs(sin(50.*3.14*uv.x)*sin(50.*3.14*uv.y)),0.1))/25.;
             float grid3 = (1.-pow(abs(sin(100.*3.14*uv.x)*sin(100.*3.14*uv.y)),0.1))/50.;
             float grid = grid1+grid2+grid3;
             
             //draw height lines for the magnitude
             float height = (1.-pow(abs(sin(10.*3.14*xyz.y)),0.1))/10.;
             vec3 col = hsb2rgb(vec3(xyz.y/3.,0.5+height,0.5))-3.*vec3(height);
             return col+vec3(grid);

            }
        `;

        this.eqn=`
        vec3 eqn(vec2 uv){
            float u = 3.*uv.x;
            float v = uv.y/1.5;
            float re = sin(u)*cosh(v);
            float im = cos(u)*sinh(v);
            float mag = sqrt(re*re+im*im);
            return vec3(v,mag-3.,u);
        }`;
        this.domain={u:{min:-4,max:4},v:{min:-4,max:4}};
        this.uniforms={};
        let surfaceOptions = {
            clearcoat:1,
            side:DoubleSide,
            envMapIntensity:2,
        }
        this.surface = new ParametricSurface(this.eqn,this.domain,this.uniforms,this.surfaceColor,surfaceOptions);
    }

    addToScene(scene){
        this.surface.addToScene(scene);
    }

    addToUI(ui){
        let thisObj = this;
        ui.add(thisObj.params,"eqnType",
            { '1/(1-z^2)':1, 'B':2,  'C':3 });
    }

    tick(time,dTime){

    }
}

export default ModulusFunction;