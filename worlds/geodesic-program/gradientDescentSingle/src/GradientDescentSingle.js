import {Vector2} from "../../../../3party/three/build/three.module.js";

import State from "../../../../code/items/geodesic-program/Integrators/States/State.js";
import Graph from "../../../../code/items/geodesic-program/plot/Graph.js";
import GraphingCalc from "../../../../code/items/geodesic-program/surface/Examples/GraphingCalc.js";
import Geodesic from "../../../../code/items/geodesic-program/trajectories/Geodesic.js";
import GradientVF from "../../../../code/items/geodesic-program/plot/GradientVF.js";
import GlassDomain from "../../../../code/items/geodesic-program/plot/GlassDomain.js";




const curveOptions = {
    length:20,
    segments: 512,
    radius: 0.05,
    tubeRes: 8,
    color: 0x1b1b1b,
    roughness:0,
};


class GradientDescentSingle{
    constructor() {

        this.surface = new GraphingCalc();
        this.plot = new Graph(this.surface);
        this.glass = new GlassDomain(this.surface);
        this.grad = new GradientVF(this.surface);

        this.params = {
            posx: 0.83,
            posy: 0,
            ang:0,
        };

        this.buildIniState();
        this.geodesic = new Geodesic(this.surface, this.iniState, 2, curveOptions);

    }

    buildIniState(){
        let pos = new Vector2(this.params.posx, this.params.posy);
        let vel = new Vector2(Math.cos(this.params.ang),Math.sin(this.params.ang));
        this.iniState = new State(pos,vel);
    }

    addToScene(scene){
        this.plot.addToScene(scene);
        this.geodesic.addToScene(scene);
        this.grad.addToScene(scene);
        this.glass.addToScene(scene);
    }

    addToUI(ui){

        let test = this;

        let resetScene = function(){
            test.plot.updateSurface();
            test.geodesic.updateSurface();
            test.grad.updateSurface();
        };

        this.surface.buildUIFolder(ui,resetScene);

        ui.add(test.params, 'posx',-5,5,0.01).name('Starting-x').onChange(function(value){
            test.buildIniState();
            test.geodesic.updateState(test.iniState);
        })

        ui.add(test.params, 'posy',-4,4,0.01).name('Starting-y').onChange(function(value){
            test.buildIniState();
            test.geodesic.updateState(test.iniState);
        })

        ui.add(test.params, 'ang',0,3.14,0.01).name('Starting-angle').onChange(function(value){
            test.buildIniState();
            test.geodesic.updateState(test.iniState);
        })

    }

    tick(time,dTime){
    }


}


export default GradientDescentSingle;
