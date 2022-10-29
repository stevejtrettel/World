
import {
    Mesh,
    MeshPhysicalMaterial,
    Color
} from "../../../../3party/three/build/three.module.js";

import { hslToHex } from "../Computation/random.js";
import { Comet } from "./Comet.js";


//the annoying thing I need to learn how to fix:
//am importing a GLOBAL ambient space into the files defining my classes
// :-(
import { ambientSpace } from "../setup.js";









//take in a simulation and render to the screen a collection of balls:
//also takes in the ambient space, so that it can get the projection
//and model geometries that are required:

class RenderSim{
    constructor(simulation, radii) {

        this.N = simulation.states.length;
        this.cometLength = 200.;
        this.simulation = simulation;
        this.radii = radii;

        let obstacleMat = new MeshPhysicalMaterial({
            clearcoat:0.3,
            transmission:0.99,
            ior:1.,
        });
        this.obstacle = new Mesh(ambientSpace.obstacle.geometry, obstacleMat);

        //make a default ball for each
        this.balls = [];
        for(let i=0; i<this.N; i++){

            let coords = this.simulation.states[i].pos.clone();
            let posR3 = ambientSpace.toR3(coords);

            let hue = Math.random();
            let color =  new Color().setHSL(hue, 0.4, 0.6);
            
            let scaling = ambientSpace.model.relativeScaling(posR3);
            let radius = this.radii[i] * scaling;

            let comet = new Comet(posR3, radius, color, this.cometLength);
            this.balls.push(comet);
        }


    }


    updateBalls(){
        for(let i=0; i<this.N; i++){

            let coords = this.simulation.states[i].pos.clone();
            let posR3 = ambientSpace.toR3(coords);

            let scaling = ambientSpace.model.relativeScaling(posR3);
            let radius = this.radii[i]*scaling;

            this.balls[i].resize(radius);
            this.balls[i].updatePos(posR3);
            this.balls[i].redrawTail();
        }
    }


    //add all the balls to the scene
    //also add the geometry of any obstacle described by
    //the distance function!
    addToScene(scene){
        for(let i=0; i<this.N; i++){
            this.balls[i].addToScene(scene);
        }
        scene.add(this.obstacle);
    }

    //if we wanted to add any sliders to the UI, changing masses or tail
    //lengths or whatever
    addToUI(ui){}

    tick(time,dTime){

        for(let i=0; i<5; i++) {
            this.simulation.step();
        }
        this.updateBalls();
    }

}



export { RenderSim };