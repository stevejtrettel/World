import {
    MeshPhysicalMaterial,
    SphereGeometry,
    Vector2,
    Vector3,
    Mesh, TubeGeometry, LineCurve3
} from "../../../../3party/three/build/three.module.js";

import {State, dState} from "../../../../code/compute/cpu/components/State.js";
import {RungeKutta} from "../../../../code/compute/cpu/RungeKutta.js";


import Pendulum from "./Pendulum.js";



class PendulumSim{
    constructor(N=10) {
        this.N = N;
        this.length =2;
        this.origin = new Vector3(0,1,0);

        this.params = {
            center: 1,
            spread: 0.01,
        };

        this.states =  new Array(this.N);
        this.pendula = new Array(this.N);

        for(let i=0; i<this.N; i++){
            this.pendula[i] = new Pendulum(this.length,this.origin);
        }

        this.initialize();

        let mat = new MeshPhysicalMaterial({
            clearcoat:1,
            color:0xffffff,
        });
        let sphGeo = new SphereGeometry(0.15);
        this.vertex = new Mesh(sphGeo,mat);
        this.vertex.position.set(this.origin.x,this.origin.y,this.origin.z);


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
        //states have a single number for position and velocity: (angles)
        for(let i=0; i<this.N; i++){
            let ang = this.params.spread*(i/this.N-0.5);
            let pos = new Vector2(this.params.center+ang,0);
            let vel = new Vector2(0,0);
            this.states[i]= new State(pos,vel);
        }
    }

    createIntegrator(){
        let ep =0.001;
        let g = 5.;
        let len = this.length;
        let accel = function(pos){
            //diffeq is y'' = -sin(y)
            return new Vector2(-g/len * Math.sin(pos.x),0);
        }

        let derive = function(state){
            let pos = state.pos;
            let vel = state.vel;
            let acc =accel(state.pos);
            return new dState(vel,acc);
        }
        this.integrator = new RungeKutta(derive,ep);
    }

    stepForward(){
        for(let i=0; i<this.N; i++){
            for(let j=0;j<10; j++) {
                this.states[i] = this.integrator.step(this.states[i]);
            }
        }
        this.updatePendula();
    }

    addToScene(scene){
        scene.add(this.vertex);
        for(let i=0; i<this.N; i++){
           this.pendula[i].addToScene(scene);
        }
    }

    addToUI(ui){
        let sim = this;
        let params = this.params;
        ui.add(params,'center',0,3.14,0.01).name('StartPos').onChange(function(value){
            params.center=value;
            sim.initialize();
        });
        ui.add(params,'spread',0,3.14,0.01).name('Spread').onChange(function(value){
            params.spread=value;
            sim.initialize();
        });
    }

    tick(time,dTime){
        this.stepForward();
    }

}


export default PendulumSim;
