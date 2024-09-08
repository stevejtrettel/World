
import ParametricSurface from "../../../code/compute/parametric/ParametricSurface.js";
import {DoubleSide} from "../../../3party/three/build/three.module.js";
import {complex} from "../../../code/shaders/math/complex.js";

let defaultParams = {};


class ModulusPlot{
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

        this.eqn=complex+`
        vec3 eqn(vec2 uv){
        
            if(eqnType==1){
                float u = 3.*uv.x;
                float v = uv.y/1.5;
                float re = sin(u)*cosh(v);
                float im = cos(u)*sinh(v);
                float mag = sqrt(re*re+im*im);
                return vec3(v,mag-3.,u);
            }
            else if(eqnType==2){
                float u =2.*uv.x;
                float v = 2.*uv.y;
                vec2 ans = ctan(uv);
                float mag = length(ans);
                return vec3(v,mag-3.,u);
            }
            else if(eqnType==3){
                float u =2.*uv.x;
                float v = 2.*uv.y;
                float mag = exp(u);
                return vec3(u,mag-3.,v);
            }
            else if(eqnType==4){
                 float u = uv.x;
                float v = uv.y;
                float x1 = 1.+u;
                float x2 = 1.-u;
                float mag1 = x1*x1+v*v;
                float mag2 = x2*x2+v*v;
                float mag = 1./(mag1*mag2);
                return vec3(u,mag-3.,v);
            }

            return vec3(0,0,0);
        }`;
        this.domain={u:{min:-4,max:4},v:{min:-4,max:4}};
        this.uniforms={
            eqnType:{type:'int',value:1}
        };
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
            { 'sin(z)':1, 'tan(z)':2,  'exp(z)':3,'1/(z^2-1)':4 }).onChange(function(value){
                thisObj.surface.update(thisObj.params);
        });
    }

    tick(time,dTime){

    }
}

export default ModulusPlot;
