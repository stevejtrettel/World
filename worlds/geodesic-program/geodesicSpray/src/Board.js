import {Vector2} from "../../../../3party/three/build/three.module.js";

import State from "../../../../code/items/geodesic-program/Integrators/States/State.js";
import Graph from "../../../../code/items/geodesic-program/plot/Graph.js";
import GraphingCalc from "../../../../code/items/geodesic-program/surface/Examples/GraphingCalc.js";
import GeodesicSpray from "../../../../code/items/geodesic-program/trajectories/GeodesicSpray.js";


let defaultCurveOptions = {
    length:60,
    segments: 256,
    radius: 0.02,
    tubeRes: 8,
    color: 0x000000,
    roughness:0,
};


class Board {
    constructor() {

        this.surface = new GraphingCalc();
        this.plot = new Graph(this.surface);

        let iniState = new State(new Vector2(0,0), new Vector2(0,1));
        this.spray = new GeodesicSpray(this.surface,iniState,10,defaultCurveOptions);
    }


    addToScene(scene){
        this.plot.addToScene(scene);
        this.spray.addToScene(scene);
    }

    addToUI(ui){

        let test = this;

        let resetScene = function(){
            test.plot.updateSurface();
            test.spray.updateSurface();
        };

        this.surface.buildUIFolder(ui,resetScene);
        this.spray.buildUIFolder(ui,resetScene);

    }

    tick(time,dTime){
    }


}


export default Board;
