import {Vector2} from "../../../../3party/three/build/three.module.js";
import Geodesic from "./Geodesic.js";
import State from "../Integrator/State.js";

let defaultParams = {
    N: 20,
    length:10,
    color: 0xffffff,
    radius: 0.02,
    res: 100,
};


//the params here should match those of GeodesicSpray
//so that they can use the same parameters in the UI
class GeodesicStripes{
    constructor(compute, seedState, params=defaultParams){
        console.log(compute);
        this.compute = compute;
        this.params = params;

        this.iniStates=[];
        this.buildIniStates(seedState);

        this.stripes=[];
        this.buildGeodesics();
    }

    buildIniStates(state){
        //given one initial state, build the whole set
        //RIGHT NOW JUST A TEST CASE: evenly distributed along U direction.
        let vel = new Vector2(0,1).normalize();
        let uMin = this.compute.domain.u.min;
        let uMax = this.compute.domain.u.max;
        let vMin = this.compute.domain.v.min;
        let uRange = uMax - uMin;
        for(let i=0; i<this.params.N; i++){
            let pos = new Vector2(uMin + i * uRange / this.params.N, vMin);
            let st = new State(pos, vel);
            this.iniStates.push(st);
        }
    }

    buildGeodesics(){
        let geodesic;
        for(let i=0; i<this.params.N; i++){
            geodesic = new Geodesic(this.compute,this.iniStates[i],this.params);
            this.stripes.push(geodesic);
        }
    }

    addToScene(scene){
        for(let i=0; i<this.params.N; i++){
            this.stripes[i].addToScene(scene);
        }
    }

    update(){

    }
}


export default GeodesicStripes;