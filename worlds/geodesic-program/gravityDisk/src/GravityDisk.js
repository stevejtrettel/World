import {Vector2} from "../../../../3party/three/build/three.module.js";

import State from "../../../../code/items/geodesic-program/surface/Integrators/States/State.js";
import Graph from "../../../../code/items/geodesic-program/plot/Graph.js";
import GlassDomain from "../../../../code/items/geodesic-program/plot/GlassDomain.js";
import GraphingCalc from "../../../../code/items/geodesic-program/surface/Examples/GraphingCalc.js";
import ParticleDisk from "../../../../code/items/geodesic-program/trajectories/ParticleDisk.js";
import GradientVF from "../../../../code/items/geodesic-program/plot/GradientVF.js";



class GravityDisk{
    constructor() {
        this.surface = new GraphingCalc();
        this.plot = new Graph(this.surface);
        this.dom = new GlassDomain(this.surface);
        this.grad = new GradientVF(this.surface);

        //set integrator options:
        let integratorOptions = {
            choice: 1, //gravitational
            numBalls: 1000,
            error: 0.1,
            stopAtEdge: false,
        }

        //set particle options:
        let particleOptions = {
            color: 0xffffff,
            radius: 0.075,
            flatten:false,
        }

        this.setIniState();
        this.particles = new ParticleDisk(this.surface, this.iniState, integratorOptions, particleOptions);
    }

    setIniState(){
        let pos = new Vector2(0,0);
        let vel = this.surface.geomNormalize(pos, new Vector2(0.5,0.3));
        let iniState = new State( pos,vel);
        this.iniState = iniState;
    }

    addToScene(scene){
        this.dom.addToScene(scene);
        this.plot.addToScene(scene);
        this.particles.addToScene(scene);
        this.grad.addToScene(scene);
    }

    addToUI(ui){

        let test = this;

        let resetScene = function(){
            test.plot.updateSurface();
            test.setIniState();
            test.particles.updateState(test.iniState);
            test.grad.updateSurface();
        };

        this.surface.buildUIFolder(ui,resetScene);

    }

    tick(time,dTime){
        this.particles.stepForward();
    }
}


export default GravityDisk;
