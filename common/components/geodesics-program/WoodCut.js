import {Vector2} from "../../../3party/three/build/three.module.js";

import Surface from "./Surface/Surface.js";
import SurfaceGPU from "./Surface/SurfaceGPU.js";
import Geodesic from "./Geodesics/Geodesic.js";
import GeodesicSpray from "./Geodesics/GeodesicSpray.js";
import GeodesicStripes from "./Geodesics/GeodesicStripes.js";
import Compute from "./Compute.js";
import State from "./Integrator/State.js";

const defaultParams = {};

class WoodCut{
    constructor(params=defaultParams) {
        this.compute = new Compute();
        this.surface = new SurfaceGPU(this.compute);

        const iniState = new State(new Vector2(2,-1),new Vector2(-1,0));
        this.geodesic = new Geodesic(this.compute,iniState);
        this.stripes = new GeodesicStripes(this.compute);

    }

    addToScene(scene){
        this.surface.addToScene(scene);
        this.geodesic.addToScene(scene);
        this.stripes.addToScene(scene);
    }

    addToUI(ui){
    }

    tick(time,dTime){
        let iniState = new State(new Vector2(2,-1),new Vector2(-1,Math.cos(time)));
        this.geodesic.update({iniState:iniState});
        this.stripes.update({time:time});
    }

}


export default WoodCut;