import {Matrix3,Vector2,Vector3} from "../../../../3party/three/build/three.module.js";

import SymplecticIntegrator from "./Integrators/Symplectic.js";
import EulerIntegrator from "./Integrators/Euler.js";
import dState from "./Integrators/States/dState.js";


let width = 6.;
let length = 9.66;
let defaultDomain = {
    u: {
        min: -length/2.,
        max: length/2.
    },
    v: {
        min: -width/2.,
        max: width/2.
    }
};


class Surface{
    constructor(domain=defaultDomain) {
        this.setDomain(domain);
        this.setParamData();
        this.initialize();

    }


    //this will be written in each function individually:
    setFunctionData(){
        this.F=null;
        this.name = null;
        this.Ftxt = null;
        this.derivatives=null;
    }

    setParamData(){
        this.params = null;
        this.paramData = null;
    }




    setDomain(domain){
        this.domain=domain;
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

            //return it in case we need it:
            return newPos;
        }

    }

    initialize(){
        this.setFunctionData();
        this.buildParameterization();
        this.buildDerivatives();
        this.buildIntegrators();
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

        let domainParameterization = function(uv){
            let u = uv.x;
            let v = uv.y;
            //switch order so z is up on screen
            return new Vector3(u,-4,-v);
        }
        this.domainParameterization = domainParameterization;


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


        this.parametricDomain = function(u,v,result){
            let uv = new Vector2(u,v);
            let UV = rescale(uv);
            let res = domainParameterization(UV);
            result.set(res.x,res.y,res.z);
        }

    }



    buildDerivatives(){
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


        let gradient = function(uv){
            let eps = 0.0001;
            let u = uv.x;
            let v = uv.y;

            const fp0 = F(u+eps, v);
            const fn0 = F(u-eps,v);
            const f0p = F(u,v+eps);
            const f0n = F(u,v-eps);

            const fu = (fp0 - fn0) / (2*eps);
            const fv = (f0p - f0n) / (2*eps);

            return new Vector2(fu,fv);
        }

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

        let geomNormalize = function(p,v){
            let D = derivatives(p);
            let g = new Matrix3().set(
                D.fu*D.fu+1, D.fu*D.fv,0,
                D.fu*D.fv, D.fv*D.fv+1,0,
                0,0,1
            );
            let V = new Vector3(v.x,v.y,0);
            let mag =  Math.sqrt(V.dot(V.applyMatrix3(g)));

            return v.clone().multiplyScalar(1./mag);

        }


        let nVec = function( uv ){
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

        let reflectGivenTangent = function(p){
            return function(v,tang){
                let tangNorm = geomDot(p)(tang,tang);
                let unitTang = tang.clone().multiplyScalar(1/tangNorm);
                let scalarProj = geomDot(p)(v,unitTang)
                let tangProj = unitTang.clone().multiplyScalar(scalarProj);
                let reflection = v.clone().multiplyScalar(-1).add(tangProj.multiplyScalar(2));
                return reflection;
            }
        }


        let boundaryReflect = function(state){

            if(this.stop(state.pos)) {

                //if on the boundary of constant u
                if (Math.abs(state.pos.x - this.domain.u.min) < 0.1 || Math.abs(state.pos.x - this.domain.u.max) < 0.1) {
                    //console.log(Math.min(Math.abs(state.pos.x-this.domain.u.min),Math.abs(state.pos.x-this.domain.u.max)));
                    state.vel = reflectGivenTangent(state.pos)(state.vel, new Vector2(0, 1));
                }
                //if on the boundary of constant v
                if (Math.abs(state.pos.y - this.domain.v.min) < 0.1 || Math.abs(state.pos.y - this.domain.v.max) < 0.1) {
                    state.vel = reflectGivenTangent(state.pos)(state.vel, new Vector2(1, 0));
                }

            }
            return state;
        }

        //set the things we can use
        this.derivatives = derivatives;
        this.gradient = gradient;
        this.nVec = nVec;
        this.geomNormalize = geomNormalize;
        this.boundaryReflect = boundaryReflect;
    }


    buildIntegrators(){

        let ep = 0.01;
        let gravForce  = 5.;
        let derivatives = this.derivatives;
        let gradient = this.gradient;

        let geodesicAcceleration = function(state){
            let uv = state.pos;
            let uP = state.vel.x;
            let vP = state.vel.y;

            let D = derivatives(uv);

            let num = uP*uP*D.fuu + 2*uP*vP*D.fuv + vP*vP*D.fvv;
            let denom = 1+ D.fu*D.fu + D.fv*D.fv;
            let coef = -num/denom;

            let acc = new Vector2(D.fu,D.fv).multiplyScalar(coef);

            return new dState(state.vel, acc);
        }

        let gravityAcceleration = function(state){
            let uv = state.pos;
            let uP = state.vel.x;
            let vP = state.vel.y;

            let D = derivatives(uv);

            let num = uP*uP*D.fuu + 2*uP*vP*D.fuv + vP*vP*D.fvv + gravForce;
            let denom = 1+ D.fu*D.fu + D.fv*D.fv;
            let coef = -num/denom;

            let acc = new Vector2(D.fu,D.fv).multiplyScalar(coef);

            return new dState(state.vel, acc);
        }

        let gradientVF = function(state){
            let grad = gradient(state.pos);

            let vel = grad.multiplyScalar(-1);
            let acc = new Vector2(0,0);
            return new dState(vel, acc);
        }

        let gradientMomentumVF = function(state){
            const gamma = 1.;
            let grad = gradient(state.pos);

            let vel = grad.clone().multiplyScalar(-1);
            let acc = new Vector2(0,0);
            return new dState(vel, acc);
        }

        //four different integrators we can use, depending on what we want to do
        let geodesicIntegrator = new SymplecticIntegrator(geodesicAcceleration,ep,this.stop);
        let gravityIntegrator = new SymplecticIntegrator(gravityAcceleration, ep, this.stop);
        let gradientIntegrator = new EulerIntegrator(gradientVF,ep, this.stop);
        let gradientMomentumIntegrator = new EulerIntegrator(gradientMomentumVF, ep, this.stop);

        //ordered list to choose from
        this.integrator = [
            geodesicIntegrator,
            gravityIntegrator,
            gradientIntegrator,
            gradientMomentumIntegrator
        ];
    }


    update(params){
        for(const key in params){
            if(this.params.hasOwnProperty(key)){
                this.params[key] = params[key];
            }
        }
        this.initialize();
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
