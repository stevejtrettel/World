// the base class for surfaces and computations:
import {Vector2,Vector3, Matrix3} from "../../../../../../3party/three/build/three.module.js";

import dState from "../../../Integrator/dState.js";
import Integrator from "../../../Integrator/Integrator.js";



class Surface{
    constructor(){
        //build the domain from parameters:
        this.domainParams = {
            length: 12,
            width: 6,
            centerU: 0,
            centerV: 0,
            edge:0.125,
            rebuild: function(){},
        }

        this.setParamData();
        this.setDomain();
        this.initialize();
    }

    setDomain(){
        let domain={
            u:{
               min: this.domainParams.centerU - this.domainParams.length/2.-this.domainParams.edge,
               max: this.domainParams.centerU + this.domainParams.length/2.+this.domainParams.edge
            },
            v:{
                min: this.domainParams.centerV - this.domainParams.width/2.-this.domainParams.edge,
                max: this.domainParams.centerV + this.domainParams.width/2.+this.domainParams.edge
            },
        };

        this.domain = domain;

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
        this.stop=stop;

        this.findBoundary = function(state) {
            //the state is just outside the region, but last step was inside:
            let dist = 0.;
            let testDist = 0.25;
            let pos = state.pos.clone();
            //need to go backwards, so negate velocity
            let vel = state.vel.clone().normalize().multiplyScalar(-1);
            let temp;

            for (let i = 0; i < 10; i++) {
                //divide the step size in half
                testDist = testDist / 2.;
                //test flow by that amount:
                temp = pos.clone().add(vel.clone().multiplyScalar(dist + testDist));
                //if you are still outside, add the dist
                if (stop(temp)) {
                    dist += testDist;
                }
                //if not, then don't add: divide in half and try again
            }

            //now, dist stores how far we should travel.
            // do this to pos directly
            let newPos = pos.clone().add(vel.clone().multiplyScalar(dist));

            //update the boundary of the state
            state.pos=newPos;

            //return it incase we need it:
            return newPos;
        }

    }

    initialize(){
        // this.setDomain();
        this.setFunctionData();
        this.buildNumericalDerivatives();
        this.buildParameterization();
        this.buildAcceleration();
        this.buildIntegrator();
    }

    setParamData(){
        this.gravity=undefined;
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

       let geomDot = function(p){
            return function(v,w){
                let D = derivatives(p);
                let g = new Matrix3().set(
                    D.fu*D.fu+1, D.fu*D.fv,0,
                    D.fu*D.fv, D.fv*D.fv+1,0,
                    0,0,1
                );
                let V = new Vector3(v.x,v.y,0);
                let W = new Vector3(w.x,w.y,0);
                return V.dot(W.applyMatrix3(g));
            }
        }

        this.geomDot=geomDot;

        this.reflectGivenTangent = function(p){
            return function(v,tang){
                let tangNorm = geomDot(p)(tang,tang);
                let unitTang = tang.clone().multiplyScalar(1/tangNorm);
                let scalarProj = geomDot(p)(v,unitTang)
                let tangProj = unitTang.clone().multiplyScalar(scalarProj);
                let reflection = v.clone().multiplyScalar(-1).add(tangProj.multiplyScalar(2));
                return reflection;
            }
        }

        this.nvec = function( uv ){
            let D = derivatives(uv);
            let du = D.fu;
            let dv = D.fv;
            let len = Math.sqrt(1+du*du+dv*dv);
            let n = {
                x: -du/len,
                y: -dv/len,
                z: 1,
            }
            return {
                x: n.x,
                y: n.z,
                z: -n.y
            }
        }
    }

    buildParameterization(){
        let F = this.F;
        let parameterization = function(uv){
            let u = uv.x;
            let v = uv.y;
            //switch order so z is up on screen
            return new Vector3(u,F(u,v),-v);
        }
        this.parameterization = parameterization;


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

    buildAcceleration(){
        let derivatives = this.derivatives;
        let gravity = 0;
        if(this.gravity){
            gravity = this.gravity;
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


            // equation for a constant curvature
            //acc = acc.sub(new Vector2(-vP, uP).multiplyScalar(3));

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
        let ep = 0.01;

        this.integrator = new Integrator(derive,ep,this.stop);
    }

    update(params){
        for(const key in params){
            if(this.params.hasOwnProperty(key)){
                this.params[key] = params[key];
            }
        }
        this.initialize();
    }


    // boundaryReflect(state){
    //
    //     if(this.stop(state.pos)) {
    //
    //         //if on the boundary of constant u
    //         if (Math.abs(state.pos.x - this.domain.u.min) < 0.1 || Math.abs(state.pos.x - this.domain.u.max) < 0.1) {
    //             //console.log(Math.min(Math.abs(state.pos.x-this.domain.u.min),Math.abs(state.pos.x-this.domain.u.max)));
    //             state.vel = this.reflectGivenTangent(state.pos)(state.vel, new Vector2(0, 1));
    //         }
    //         //if on the boundary of constant v
    //         if (Math.abs(state.pos.y - this.domain.v.min) < 0.1 || Math.abs(state.pos.y - this.domain.v.max) < 0.1) {
    //             state.vel = this.reflectGivenTangent(state.pos)(state.vel, new Vector2(1, 0));
    //         }
    //
    //     }
    //     return state;
    // }

    printToString(){
        let str = ``;
        str += this.Ftxt;
        str += `\n`;
        str += `{ u: (${this.domain.u.min},${this.domain.u.max}), v:(${this.domain.v.min},${this.domain.v.max}) }`;
        str += `\n\n`;
        return str;
    }


    buildUIFolder(ui,resetScene){

        let surf = this;

        let resetParam={
            reset:resetScene,
        }
        //
        // let woodFolder = ui.addFolder('Wood Block');
        // woodFolder.close();
        //
        // woodFolder.add(surf.domainParams,'length').onFinishChange(function(value){
        //     surf.domainParams.length = value;
        //     surf.initialize();
        //     //resetScene();
        // });
        //
        // woodFolder.add(surf.domainParams,'width').onFinishChange(function(value){
        //     surf.domainParams.width = value;
        //     surf.initialize();
        //     //resetScene();
        // });
        //
        // woodFolder.add(resetParam,'reset');
        //
        let folder = ui.addFolder('Surface');
        folder.close();


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