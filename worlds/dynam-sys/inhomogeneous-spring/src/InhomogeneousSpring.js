import {RungeKutta} from "../../../../code/compute/cpu/RungeKutta.js";
import {
    CatmullRomCurve3, CylinderGeometry,
    Mesh,
    MeshPhysicalMaterial,
    SphereGeometry,
    Vector3
} from "../../../../3party/three/build/three.module.js";


import Helix from "../../../../code/items/basic-shapes/Helix.js";

class InhomogeneousSpring {
    constructor() {

        this.res = 1000;

        this.k = 5.;
        this.m =1;
        this.len = 1;
        this.vel = 1;


        //build in FITTED CURVES TO THE SOLUTION
        //not going to write the integrator tonight.

        this.h = function(time){
            let t = 25*time-10;
            return t;
        }
        this.l = function(time){
            //time is in 0 to 1: shift to -1,1
            let t = 25*time-10;

            let gauss = 3.*Math.exp(-5*(t-0.7)*(t-0.7));
            let sin = 0.5*Math.sin(6*t)*Math.tanh(6*t);
            if(t<0){
                return 1+gauss;
            }
            return 1+gauss+sin;
        }

        let sph = new SphereGeometry(0.5);
        let springMat = new MeshPhysicalMaterial();
        this.springTop = new Mesh(sph, springMat );
        this.springBottom = new Mesh(sph, springMat);
        this.spring = new Helix(0.25,0.05,);

    }


    reposition(percent){

        let h = this.h(percent);
        let l = this.l(percent);
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


export default InhomogeneousSpring;
