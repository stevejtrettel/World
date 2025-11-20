
//a blackhole is given by the properties mass, position

import {MeshPhysicalMaterial, SphereGeometry,Mesh,Vector3} from "../../../3party/three/build/three.module.js";
import {RungeKutta} from "../../compute/cpu/RungeKutta.js";
import {dState} from "../../compute/cpu/components/State.js";



let default1 = {
    mass:1,
    center: new Vector3(0,0,0)
};

let default2 = {
    mass:1,
    center: new Vector3(5,0,0)
};

let default3 = {
    mass:1,
    center: new Vector3(0,5,0)
};

class ExtremalBHs{
    constructor(bh1=default1,bh2=default2,bh3=default3) {

        this.alpha = 1.5;

        this.params1 = bh1;
        this.params2 = bh2;
        this.params3 = bh3;

        this.buildIntegrator();


        let sph = new SphereGeometry(0.1);
        let mat = new MeshPhysicalMaterial({
            color: 0x000000,
            clearcoat:1,
        });

        this.eh1 = new Mesh(sph,mat);
        this.eh1.scale.set(1,1,1);
        this.eh1.position.set(this.params1.center.x,this.params1.center.y,this.params1.center.z);

        this.eh2 = new Mesh(sph,mat);
        this.eh2.scale.set(1,1,1);
        this.eh2.position.set(this.params2.center.x,this.params2.center.y,this.params2.center.z);

        this.eh3 = new Mesh(sph,mat);
        this.eh3.scale.set(1,1,1);
        this.eh3.position.set(this.params3.center.x,this.params3.center.y,this.params3.center.z);


    }

    normalize(state){
        //take in a state, normalize so H= 1/2;

        let alpha = this.alpha;
        let c1 = this.params1.center;
        let c2 = this.params2.center;
        let c3 = this.params3.center;
        let m1 = 4/alpha * this.params1.mass;
        let m2 = 4/alpha * this.params2.mass;
        let m3 = 4/alpha * this.params3.mass;
        let r1 = state.pos.clone().sub(c1).length();
        let r2 = state.pos.clone().sub(c2).length();
        let r3 = state.pos.clone().sub(c3).length();

        let U = 1 + m1/r1 + m2/r2 + m3/r3;
        U = Math.pow(U, alpha);
        let sqrtU = Math.sqrt(U);

        state.vel.multiplyScalar(1/state.vel.length());
        state.vel.multiplyScalar(sqrtU);

        return state;

    }



    buildIntegrator(){

        let alpha = this.alpha;
        let c1 = this.params1.center;
        let c2 = this.params2.center;
        let c3 = this.params3.center;
        let m1 = 4/alpha * this.params1.mass;
        let m2 = 4/alpha * this.params2.mass;
        let m3 = 4/alpha * this.params3.mass;


        let derive = function(state){
            let pos = state.pos.clone();
            let x = state.pos.x;
            let y = state.pos.y;
            let z = state.pos.z;
            let vel = state.vel;

            let r1 = pos.clone().sub(c1).length();
            let r2 = pos.clone().sub(c2).length();
            let r3 = pos.clone().sub(c3).length();

            let dU = 1 + m1/r1 + m2/r2 + m3/r3;
            dU = alpha*Math.pow(dU, alpha-1);

            let tx = m1/(r1*r1*r1)*(x-c1.x)+ m2/(r2*r2*r2)*(x-c2.x)+ m3/(r3*r3*r3)*(x-c3.x);
            let ty = m1/(r1*r1*r1)*(y-c1.y)+ m2/(r2*r2*r2)*(y-c2.y)+ m3/(r3*r3*r3)*(y-c3.y);
            let tz = m1/(r1*r1*r1)*(z-c1.z)+ m2/(r2*r2*r2)*(z-c2.z)+ m3/(r3*r3*r3)*(z-c3.z);

            let ax = - dU*tx;
            let ay = - dU*ty;
            let az = - dU*tz;

            let acc = new Vector3(ax,ay,az);

            return new dState(vel, acc);
        };

        let ep = 0.001;
        this.integrator = new RungeKutta(derive,ep);
    }


    addToScene(scene){
        scene.add(this.eh1);
        scene.add(this.eh2);
        scene.add(this.eh3);
    }

    update(){

    }

}


export default ExtremalBHs;
