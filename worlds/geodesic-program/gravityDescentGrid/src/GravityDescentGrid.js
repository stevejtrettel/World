import {Vector2} from "../../../../3party/three/build/three.module.js";

import State from "../../../../code/items/geodesic-program/Integrators/States/State.js";
import Graph from "../../../../code/items/geodesic-program/plot/Graph.js";
import GlassDomain from "../../../../code/items/geodesic-program/plot/GlassDomain.js";
import GradientVF from "../../../../code/items/geodesic-program/plot/GradientVF.js";

import GraphingCalc from "../../../../code/items/geodesic-program/surface/Examples/GraphingCalc.js";
import ParticleGrid from "../../../../code/items/geodesic-program/trajectories/ParticleGrid.js";


class GravityDescentGrid {
    constructor() {
        this.surface = new GraphingCalc();
        this.surface.setFunction('0.5*a*(sin(2*b*u)+sin(2*b*v))/(1+u*u+v*v)+(u*u+2*v*v)/30')

        this.dom = new GlassDomain(this.surface);

        this.plot = new Graph(this.surface);
        this.grad = new GradientVF(this.surface);


        //set integrator options:
        let integratorOptions = {
            choice: 1, //gradient descent
            rows: 30,
            cols: 30,
            stopAtEdge: false,
        }

        //set particle options:
        let particleOptions = {
            color: 0x22156b,
                //0x782545,
                //0x54ab54,
            radius: 0.07,
            flatten:false,
        }

        this.particles = new ParticleGrid(this.surface, integratorOptions, particleOptions);

    }

    addToScene(scene){
        this.plot.addToScene(scene);
        this.dom.addToScene(scene);
        //this.grad.addToScene(scene);
        this.particles.addToScene(scene)
    }

    addToUI(ui){

        let test = this;

        let resetScene = function(){
            test.plot.updateSurface();
            test.particles.updateSurface();
            test.grad.updateSurface();
        };

        this.surface.buildUIFolder(ui,resetScene);

    }

    tick(time,dTime){
        this.particles.stepForward();
    }
}


export default GravityDescentGrid;
