
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
        this.trailLength = 200.;
        this.simulation = simulation;
        this.radii = radii;

        this.projection = ambientSpace.model.toR3;
        this.boundaryGeom = ambientSpace.obstacle.geometry;

        let physMat = new MeshPhysicalMaterial({
            clearcoat:0.3,
            transmission:0.99,
            ior:1.,
        });
        this.boundary = new Mesh(this.boundaryGeom, physMat);

        //make a default ball for each
        this.balls = [];
        for(let i=0; i<this.N; i++){

            let pos = this.simulation.states[i].pos.clone();
            let center = this.projection(pos);

            let hue = Math.random();
            let color =  new Color().setHSL(hue, 0.4, 0.6);
            let comet = new Comet(center, this.radii[i], color, this.trailLength);

            this.balls.push(comet);
        }


    }


    updateBalls(){
        for(let i=0; i<this.N; i++){

            let pos = this.simulation.states[i].pos.clone();
            let center = this.projection(pos);

            this.balls[i].updatePos(center);
            this.balls[i].redrawTrail();
        }
    }


    //add all the balls to the scene
    //also add the geometry of any obstacle described by
    //the distance function!
    addToScene(scene){
        for(let i=0; i<this.N; i++){
            this.balls[i].addToScene(scene);
        }
        scene.add(this.boundary);
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