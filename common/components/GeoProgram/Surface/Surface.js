// the base class for surfaces and computations:
import {Vector3,Vector2} from "../../../../3party/three/build/three.module.js";

import dState from "../Integrator/dState.js";
import Integrator from "../Integrator/Integrator.js";


let width = 5.5/2;
let length = 11.5/2;
let defaultDomain = {
    u: {
        min: -length,
        max: length
    },
    v: {
        min: -width,
        max: width
    }
};



class Surface{
    constructor(domain=defaultDomain){
        this.domain = domain;
        this.setParamData();
        this.initialize();
    }

    initialize(){
        this.setFunctionData();
        this.buildNumericalDerivatives();
        this.buildParameterization();
        this.buildAcceleration();
        this.buildIntegrator();
        this.buildSurfaceGeometry();
    }

    setParamData(){
        this.params = null;
        this.paramData = null;
    }

    //this will be written in each function individually:
    setFunctionData(){
        this.F=null;
        this.name = null;
        this.Ftxt = null;
        this.derivatives=null;
    }

    buildNumericalDerivatives(){
        let F = this.F;

        let derivatives = function( uv ){

            let eps = 0.0001;
            let u = uv.x;
            let v = uv.y;

            //useful computations so we dont repeat:
            const f00 = F(u,v);
            const fp0 = F(u+eps, v);
            const fn0 = F(u-eps,v);
            const f0p = F(u,v+eps);
            const f0n = F(u,v-eps);

            const fpp = F(u+eps,v+eps);
            const fpn = F(u+eps, v-eps);
            const fnp = F(u-eps, v+eps);
            const fnn = F(u-eps,v-eps);


            return {
                fu: (fp0 - fn0) / (2*eps),
                fv: (f0p - f0n) / (2*eps),
                fuu: (fp0 - 2*f00 + fn0) / (eps*eps),
                fvv: (f0p - 2*f00 + f0n) / (eps*eps),
                fuv: (fpp + fnn - fnp - fpn) / (4*eps*eps)
            }
        }

        this.derivatives = derivatives;

        this.nvec = function( uv ){
            let D = derivatives(uv);
            let du = D.fu;
            let dv = D.fv;
            let len = Math.sqrt(1+du*du+dv*dv);
            return {
                x: du/len,
                y: 1/len,
                z: -dv/len
            }
        }
    }

    buildParameterization(){
        let F = this.F;
        this.parameterization = function(uv){
            let u = uv.x;
            let v = uv.y;
            //switch order so z is up on screen
            return new Vector3(u,F(u,v),-v);
        }
    }

    buildAcceleration(){
        let derivatives = this.derivatives;
        let gravity = 0;
        if(this.params.gravity){
            gravity = this.params.gravity;
        }
        let acceleration = function(state){
            let uv = state.pos;
            let u = state.pos.x;
            let v = state.pos.y;
            let uP = state.vel.x;
            let vP = state.vel.y;

            let D = derivatives(uv);

            let num = uP*uP*D.fuu + 2*uP*vP*D.fuv + vP*vP*D.fvv+gravity;
            let denom = 1+ D.fu*D.fu + D.fv*D.fv;
            let coef = -num/denom;

            let acc = new Vector2(D.fu,D.fv).multiplyScalar(coef);
            return acc;
        }

        this.acceleration = acceleration;
       // console.log(this.acceleration({pos: {x:0.3,y:0.4},vel:{x:0,y:1}}));


        this.derive = function(state){
            let vel = state.vel;
            let acc = acceleration(state);
            return new dState(vel,acc);
        }


    }

    buildIntegrator(){

        let domain = this.domain;
        let derive = this.derive;
        let ep = 0.1;


        let stop = function(uv){
            let u = uv.x;
            let v = uv.y;
            if(u< domain.u.min || u> domain.u.max){
                return true;
            }
            if(v< domain.v.min || v> domain.v.max){
                return true;
            }
            return false;
        }

        this.integrator = new Integrator(derive,ep,stop);
    }

    update(params){
        for(const key in params){
            if(this.params.hasOwnProperty(key)){
                this.params[key] = params[key];
            }
        }
        this.initialize();
    }

    buildSurfaceGeometry(){
        let parameterization = this.parameterization;
        let uDom = this.domain.u;
        let vDom = this.domain.v;

        let rescaleU = function(u){
            return uDom.min + (uDom.max-uDom.min)*u;
        }

        let rescaleV = function(v){
            return vDom.min + (vDom.max-vDom.min)*v;
        }

        let rescale = function(uv){
            return new Vector2(rescaleU(uv.x),rescaleV(uv.y));
        }

        this.parametricSurface = function(u,v,result){
            let uv = new Vector2(u,v);
            let UV = rescale(uv);
            let res = parameterization(UV);
            result.set(res.x,res.y,res.z);
        }
    }

    printToString(){
        let str = ``;
        str += this.Ftxt;
        str += `\n`;
        str += `{ u: (${this.domain.u.min},${this.domain.u.max}), v:(${this.domain.v.min},${this.domain.v.max}) }`;
        str += `\n\n`;
        return str;
    }


    buildUIFolder(ui,resetScene){

        let folder = ui.addFolder('Surface');
        folder.close();

        let surf = this;
        for(const key in surf.paramData){
            folder.add(surf.params,key,surf.paramData[key].min,surf.paramData[key].max,surf.paramData[key].step).name(surf.paramData[key].name).onChange(
                function(value){
                    surf.params[key]=value;
                    surf.update({key:value});
                    resetScene();
                });
        }
    }
}




export default Surface;