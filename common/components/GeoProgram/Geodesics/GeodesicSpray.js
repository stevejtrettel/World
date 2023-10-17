import {Vector2} from "../../../../3party/three/build/three.module.js";
import Geodesic from "./Geodesic.js";
import State from "../Integrator/State.js";


let defaultCurveOptions = {
    length:5,
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
class GeodesicSpray {
    constructor(surface, params=defaultParams) {

        this.surface = surface;
        this.params = params;

        //CHANGE THIS: but for now have the curve parameters all just given by default:
        this.curveOptions = defaultCurveOptions

        this.iniStates = new Array(this.params.N);
        this.buildIniStates( 0);

        this.spray =  new Array(this.params.N);
        this.buildGeodesics();


    }

    buildIniStates(time = 0) {
        //RIGHT NOW JUST A TEST CASE:
        // all based at one point, angles at that point spread around default angle:
        let pos = new Vector2(3,0);
        let iniAngle = 3.14+0.5*Math.sin(time);
        let spread = 3.;
        for (let i = 0; i < this.params.N; i++) {
            let angle = iniAngle + 3.14/spread * (i/this.params.N-0.5);
            let vel = new Vector2(Math.cos(angle),Math.sin(angle));
            this.iniStates[i]=new State(pos, vel);
        }
    }

    buildGeodesics() {
        let geodesic;
        for (let i = 0; i < this.params.N; i++) {
            geodesic = new Geodesic(this.surface, this.iniStates[i],  this.curveOptions);
            this.spray[i]=geodesic;
        }
    }

    updateGeodesics() {
        for (let i = 0; i < this.params.N; i++) {
            this.spray[i].update({iniState:this.iniStates[i]});
        }
    }

    addToScene(scene){
        for(let i=0; i<this.params.N; i++){
            this.spray[i].addToScene(scene);
        }
    }


    update(params) {
        //do the update for parameters:

        //build the initial states, and rebuild geodesics!
        this.buildIniStates(params.time);
        this.updateGeodesics();
    }

}


export default GeodesicSpray;