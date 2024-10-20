import {Vector2} from "../../../../3party/three/build/three.module.js";

import State from "../../../../code/items/geodesic-program/Integrators/States/State.js";
import Graph from "../../../../code/items/geodesic-program/plot/Graph.js";
import GlassDomain from "../../../../code/items/geodesic-program/plot/GlassDomain.js";
import GradientVF from "../../../../code/items/geodesic-program/plot/GradientVF.js";

import GraphingCalc from "../../../../code/items/geodesic-program/surface/Examples/GraphingCalc.js";
import ParticleGrid from "../../../../code/items/geodesic-program/trajectories/ParticleGrid.js";


class GradientDescentComparison{
    constructor() {
        this.surface = new GraphingCalc();
        this.surface.setFunction('0.35*a*(sin(3*b*u)+sin(3*b*v))/(1+u*u+v*v)+(u*u+2*v*v)/20')

        this.dom = new GlassDomain(this.surface);

        this.plot = new Graph(this.surface);
        this.grad = new GradientVF(this.surface);


        //set integrator options:
        let standardIntegratorOptions = {
            choice: 2, //gradient descent
            rows: 50,
            cols: 50,
            stopAtEdge: true,
        }

        //set particle options:
        let standardParticleOptions = {
            color: 0xbf5443,
            radius: 0.045,
            flatten:true,
        }

        this.standardParticles = new ParticleGrid(this.surface, standardIntegratorOptions, standardParticleOptions);

        //set integrator options:
        let heavyIntegratorOptions = {
            choice: 3, //gradient descent
            rows: 50,
            cols: 50,
            stopAtEdge: true,
        }

        //set particle options:
        let heavyParticleOptions = {
            color: 0x54ab54,
            radius: 0.055,
            flatten:true,
        }

        this.heavyParticles = new ParticleGrid(this.surface, heavyIntegratorOptions, heavyParticleOptions);

    }

    addToScene(scene){
        this.plot.addToScene(scene);
        this.dom.addToScene(scene);
        this.grad.addToScene(scene);
        this.standardParticles.addToScene(scene);
        this.heavyParticles.addToScene(scene);
    }

    addToUI(ui){

        let test = this;

        let resetScene = function(){
            test.plot.updateSurface();
            test.standardParticles.updateSurface();
            test.heavyParticles.updateSurface();
            test.grad.updateSurface();
        };

        this.surface.buildUIFolder(ui,resetScene);

    }

    tick(time,dTime){
        this.standardParticles.stepForward();
        this.heavyParticles.stepForward();
    }
}


export default GradientDescentComparison;
