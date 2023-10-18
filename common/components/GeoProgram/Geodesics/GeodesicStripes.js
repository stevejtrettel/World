import {Vector2} from "../../../../3party/three/build/three.module.js";
import Geodesic from "./Geodesic.js";
import State from "../Integrator/State.js";

let defaultCurveOptions = {
    length:20,
    color: 0xffffff,
    radius: 0.02,
    res: 100,
};


let defaultParams = {
    N:50,
    time:0,
}


//the params here should match those of GeodesicSpray
//so that they can use the same parameters in the UI
//can we just feed in the whole UI commands here?
class GeodesicStripes {
    constructor(surface, params=defaultParams) {

        this.surface = surface;
        this.params = params;

        //CHANGE THIS: but for now have the curve parameters all just given by default:
        this.curveOptions = defaultCurveOptions

        this.iniStates = new Array(this.params.N);
        this.buildIniStates( 0);

        this.stripes =  new Array(this.params.N);
        this.buildGeodesics();


    }

    buildIniStates(time = 0) {
        //given one initial state, (and a time, if animated) build the whole set
        //RIGHT NOW JUST A TEST CASE: evenly distributed along U direction.
        let vel = new Vector2(Math.cos(time)/5, 1).normalize();
        let uMin = this.surface.domain.u.min;
        let uMax = this.surface.domain.u.max;
        let vMin = this.surface.domain.v.min;
        let uRange = uMax - uMin;

        for (let i = 0; i < this.params.N; i++) {
            let pos = new Vector2(0.01+uMin + i * 0.99* uRange / this.params.N, vMin );
            this.iniStates[i]=new State(pos, vel);
        }
    }

    buildGeodesics() {
        let geodesic;
        for (let i = 0; i < this.params.N; i++) {
            console.log(this.iniStates[i]);
            geodesic = new Geodesic(this.surface, this.iniStates[i], this.curveOptions);
            this.stripes[i]=geodesic;
        }
    }

    updateGeodesics() {
        for (let i = 0; i < this.params.N; i++) {
            this.stripes[i].update(this.iniStates[i]);
        }
    }

    addToScene(scene){
        for(let i=0; i<this.params.N; i++){
            this.stripes[i].addToScene(scene);
        }
    }


    update(params) {
        //do the update for parameters:

        //build the initial states, and rebuild geodesics!
        this.buildIniStates(params.time);
        this.updateGeodesics();
    }

}


export default GeodesicStripes;