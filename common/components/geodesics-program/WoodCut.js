import {Vector2} from "../../../3party/three/build/three.module.js";

import Surface from "./Items/Surface.js";
import Geodesic from "./Items/Geodesic.js";
import GeodesicSpray from "./Items/GeodesicSpray.js";
import Compute from "./Compute.js";
import State from "./Integrator/State.js";

const defaultParams = {};

class WoodCut{
    constructor(params=defaultParams) {
        this.compute = new Compute();
        this.surface = new Surface(this.compute);

        const iniState = new State(new Vector2(0,0),new Vector2(1,1));
        this.geodesic = new Geodesic(this.compute,iniState);
       // this.spray = new GeodesicSpray();

    }

    addToScene(scene){
        this.surface.addToScene(scene);
        this.geodesic.addToScene(scene);
       // this.spray.addToScene(scene);
    }

    addToUI(ui){
    }

    tick(time,dTime){
    }

}


export default WoodCut;