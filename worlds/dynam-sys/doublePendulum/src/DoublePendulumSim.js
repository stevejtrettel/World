import {
    Mesh,
    MeshPhysicalMaterial,
    SphereGeometry, TorusGeometry,
    Vector2, Vector3
} from "../../../../3party/three/build/three.module.js";


import {dState, State} from "../../../../code/compute/cpu/components/State.js";
import {RungeKutta} from "../../../../code/compute/cpu/RungeKutta.js";
import SymplecticIntegrator from "../../../../code/compute/cpu/SymplecticIntegrator.js";


import DoublePendulum from "./DoublePendulum.js";



//renaming trig functions to make things less annoying
let sin=function(x){
    return Math.sin(x);
}
let cos = function(x){
    return Math.cos(x);
}

let sin2 = function(x){
    return sin(x)*sin(x);
}

let cos2 = function(x){
    return cos(x)*cos(x);
}







class DoublePendulumSim{
    constructor(N=10) {
        this.N = N;
        this.length = new Vector2(1,1);
        this.mass = new Vector2(1,1);
        this.origin = new Vector3(0,1,0);
        this.torusOffset = 3.;

        this.params = {
            center1: 1.75,
            center2: 0.5,
            spread1: 0.001,
            spread2: 0.001,
        };

        this.states =  new Array(this.N);
        this.pendula = new Array(this.N);

        for(let i=0; i<this.N; i++){
            this.pendula[i] = new DoublePendulum(this.length,this.mass, this.origin);
        }

        this.initialize();

        let mat = new MeshPhysicalMaterial({
            clearcoat:1,
            color:0xffffff,
        });
        let sphGeo = new SphereGeometry(0.15);
        this.vertex = new Mesh(sphGeo,mat);
        this.vertex.position.set(this.origin.x,this.origin.y,this.origin.z);


        let torusMat = new MeshPhysicalMaterial(
            {
                clearcoat:2,
                transparent:true,
                transmission:0.9,
                ior:1.,
                color:0xffffff
            }
        );
        let torusGeo = new TorusGeometry(2,1,32,64);

        this.torus = new Mesh(torusGeo,torusMat);
        this.torus.rotateX(Math.PI/2);
        this.torus.position.set(0,-this.torusOffset,0);


        this.createIntegrator();
        this.initialize();

    }

    initialize(){
        this.createIniStates();
        this.updatePendula();
    }

    updatePendula(){
        for( let i=0; i<this.N; i++){
            this.pendula[i].update(this.states[i]);
        }
    }

    createIniStates(){
        //states need two angles for position, two velociites for momentum
        for(let i=0; i<this.N; i++){

            let ang1 = this.params.spread1*(i/this.N-0.5);
            let pos1 = this.params.center1+ang1;

            let ang2 = this.params.spread2*(i/this.N-0.5);
            let pos2 = this.params.center2+ang2;

            let pos = new Vector2(pos1,pos2);
            let vel = new Vector2(0,0);

            this.states[i]= new State(pos,vel);
        }
    }

    createIntegrator(){

        let ep =0.001;
        let g = 5.;

        let length = this.length;
        let mass = this.mass;

        //diffeq from here! https://www.physics.umd.edu/hep/drew/pendulum2.html
        let accel = function(state){

            let pos = state.pos;
            let vel = state.vel;

            let L1 = length.x;
            let L2 = length.y;

            let a1 = pos.x;
            let a2 = pos.y;
            let da1 = vel.x;
            let da2 = vel.y;
            let deltA = a1-a2;

            let m1 = mass.x;
            let m2 = mass.y;
            let M = m1 + m2;

            let denom = m1+ m2*sin2(deltA);

            let term1 = m2*L1*cos(deltA)*da1*da1 + m2*L2*da2*da2;
            let term2 = M*sin(a1) - m2*sin(a2)*cos(deltA);
            let acc1 = -sin(deltA)*(term1)-g*(term2);
            acc1 = acc1/(L1*denom);

            let term3 = M*L1*da1*da1 + m2*L2*cos(deltA)*da2*da2;
            let term4 = M*sin(a1)*cos(deltA) - M*sin(a2);
            let acc2 = sin(deltA)*(term3)+g*(term4);
            acc2 = acc2/(L2*denom);

            let acc = new Vector2(acc1,acc2);
            return acc;
        }

        let derive = function(state){
            let vel = state.vel;
            let acc =accel(state);
            return new dState(vel,acc);
        }
        this.integrator = new SymplecticIntegrator(derive,ep);
    }

    stepForward(){
        for(let i=0; i<this.N; i++){
            for(let j=0;j<25; j++) {
                this.states[i] = this.integrator.step(this.states[i]);
            }
        }
        this.updatePendula();
    }

    addToScene(scene){
        scene.add(this.torus);
        scene.add(this.vertex);
        for(let i=0; i<this.N; i++){
            this.pendula[i].addToScene(scene);
        }
    }

    addToUI(ui){
        let sim = this;
        let params = this.params;
        ui.add(params,'center1',0,3.14,0.01).name('Angle1').onChange(function(value){
            params.center=value;
            sim.initialize();
        });
        ui.add(params,'center2',0,3.14,0.01).name('Angle2').onChange(function(value){
            params.center=value;
            sim.initialize();
        });
        ui.add(params,'spread1',0,1,0.001).name('Uncertainty').onChange(function(value){
            params.spread1=value;
            params.spread2=value;
            sim.initialize();
        });
    }

    tick(time,dTime){
        this.stepForward();
    }

}




export default DoublePendulumSim;
