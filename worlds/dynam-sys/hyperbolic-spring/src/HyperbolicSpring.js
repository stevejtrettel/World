import {RungeKutta} from "../../../../code/compute/cpu/RungeKutta.js";
import {
    CatmullRomCurve3, CylinderGeometry,
    Mesh,
    MeshPhysicalMaterial,
    SphereGeometry,
    Vector3
} from "../../../../3party/three/build/three.module.js";

import Helix from "../../../../code/items/basic-shapes/Helix.js";

class HyperbolicSpring{
    constructor() {

        this.res = 1000;

        this.k = 5.;
        this.m =1;
        this.len = 0.5;
        this.vel = 1;

        this.buildIntegrator();
        this.buildPaths();


        let sph = new SphereGeometry(0.5);
        let springMat = new MeshPhysicalMaterial();
        this.springTop = new Mesh(sph, springMat );
        this.springBottom = new Mesh(sph, springMat);
        this.spring = new Helix();

    }

    buildIntegrator(){
        let k = this.k;
        let len = this.len;
        let vel = this.vel;
        let m = this.m;

        //set l , lP and h
        this.iniCond = new Vector3(this.len, 0, 0);

        //each state is a vec3 containing l, l' and h
        //each dState is l', l'' and h'
        let derive =  function(state){

            let H = vel*Math.cosh(len);

            let l = state.x;
            let lP = state.y;
            let h = state.z;

            let lPP = H*H*Math.tanh(l)/Math.pow(Math.cosh(l),2)- 2.*(l-len);
            let hP = H/Math.pow(Math.cosh(l),2);

            return new Vector3(lP,lPP,hP);
        }

        this.derive = derive;
        this.integrator = new RungeKutta(this.derive, 0.05);

    }

    buildPaths(){
        this.hVals = [];
        this.lVals = [];
        let state = this.iniCond;
        for(let i=0;i<this.res;i++){
            this.lVals.push(state.x);
            this.hVals.push(state.z);
            state = this.integrator.step(state);
        }
    }


    reposition(percent){
        let index = Math.floor(percent * this.res);
        //time is in 0,1, the domain of the curves.
        let h = this.hVals[index];
        let l = this.lVals[index];
        this.springTop.position.set(h,l,0);
        this.springBottom.position.set(h,-l,0);

        this.spring.setLength(l);
        this.spring.setPosition(h,0,0);
    }


    addToScene(scene){
        scene.add(this.springTop);
        scene.add(this.springBottom);
        this.spring.addToScene(scene);
    }


    addToUI(ui){

    }

    tick(time,dTime){
        time = time/10.;
        let t = time - Math.floor(time);
        this.reposition(t);
    }
}


export default HyperbolicSpring;
