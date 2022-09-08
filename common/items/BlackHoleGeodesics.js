import { Vector3 } from "../../3party/three/build/three.module.js";

import {BlackHole} from "../components/BlackHole.js";
import {IntegralCurve} from "../objects/IntegralCurve.js";
import { State } from "../cpu/components/State.js";

class BlackHoleGeodesic {
    constructor(blackHole, iniState) {

        this.iniState = iniState;
        this.blackHole = blackHole;

        let identity = function(pos){return pos};
        this.geodesic = new IntegralCurve(this.blackHole.nullIntegrator, identity, this.iniState, 20);
        this.geodesic.integrate(this.iniState);

    }


    reset(state) {
        this.iniState = state;
        this.geodesic.integrate(this.iniState);
        this.geodesic.resetCurve(this.geodesic.curve);
    }


    addToScene(scene) {
        this.blackHole.addToScene(scene);
        this.geodesic.addToScene(scene);
    }

    addToUI(ui) {

    }

    tick(time, dTime){

    }

}




let bh = new BlackHole(1);
let state = new State(new Vector3(4,0,0),new Vector3(-1,-1,0));

let example = new BlackHoleGeodesic(bh,state);

export default { example };