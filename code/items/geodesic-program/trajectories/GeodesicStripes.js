
// class Geodesic{
//     constructor(surface, iniState,  curveOptions=defaultOptions) {

import State from "../Integrators/States/State.js";
import {Vector2} from "../../../../3party/three/build/three.module.js";
import Geodesic from "./Geodesic.js";
import ParallelTransport from "../parallel-transport/ParallelTransport.js";



let defaultCurveOptions = {
    length:60,
    segments: 256,
    radius: 0.02,
    tubeRes: 8,
    color: 0x000000,
    roughness:0,
};


let defaultParams = {
    N:10,
    angle:-0.2,
    spread:0.69,
    pos:0,
}


//the params here should match those of GeodesicSpray
//so that they can use the same parameters in the UI
//can we just feed in the whole UI commands here?
class GeodesicStripes {
    constructor(surface, iniState, integratorChoice, params=defaultParams) {

        this.maxN = 10;

        this.surface = surface;
        this.iniState = iniState;

        this.params = params;

        //CHANGE THIS: but for now have the curve parameters all just given by default:
        this.curveOptions = defaultCurveOptions

        this.initialize();
    }


    initialize(){
        this.iniStates = new Array(this.maxN);
        for(let i=0;i<this.maxN;i++){
            this.iniStates[i]=new State(new Vector2(0,0),new Vector2(0,0));
        }
        this.buildIniStates(this.iniState);

        this.stripes =  new Array(this.maxN);
        for(let i=0;i<this.maxN;i++){
            this.stripes[i] = new Geodesic(this.surface,this.iniStates[i], 0, this.curveOptions);
        }
        this.buildGeodesics();
    }

    buildIniStates(iniState) {

        //set an initial vector direction with respect to the edge
        let vel = this.iniState.vel;

        //build a curve that goes along a portion of the boundary
        let uMin = this.iniState.pos.x;
        let vMin = this.iniState.pos.y;
        let vRange = this.surface.domain.v.max-this.surface.domain.v.min;

        let pos = this.params.pos;
        let spread = this.params.spread;

        let curve = function(t){
            let u = uMin;
            let v = vMin + spread*vRange*(t-0.5);
            return new Vector2(u,v);
        }

        this.parallelTransport = new ParallelTransport(vel,curve,this.surface);

        for (let i = 0; i < this.params.N; i++) {
            let state = this.parallelTransport.getVector(i/this.params.N);
            // console.log(state.vel);
            this.iniStates[i] = state;
        }
    }


    buildGeodesics() {
        let geodesic;
        for (let i = 0; i < this.params.N; i++) {
            geodesic = new Geodesic(this.surface, this.iniStates[i],0, this.curveOptions);
            this.stripes[i]=geodesic;
        }
    }

    updateGeodesics() {
        for (let i = 0; i < this.maxN; i++) {
            if(i<this.params.N) {
                this.stripes[i].setVisibility(true);
                this.stripes[i].updateState(this.iniStates[i]);

            }
            else{
                this.stripes[i].setVisibility(false);
            }
        }
    }

    addToScene(scene){
        for(let i=0; i<this.maxN; i++){
            this.stripes[i].addToScene(scene);
            let show = (i<this.params.N);
            this.stripes[i].setVisibility(show);
        }
    }



    update(params) {
        for(const key in params){
            if(this.params.hasOwnProperty(key)){
                this.params[key] = params[key];
            }
        }
        this.buildIniStates();
        this.updateGeodesics();
    }

    updateSurface(){
        this.buildIniStates();
        for(let i=0; i<this.maxN; i++){
            this.stripes[i].updateSurface();
            this.stripes[i].updateState(this.iniStates[i]);
        }
    }

    setVisibility(value) {
        for (let i = 0; i < this.params.N; i++) {
            this.stripes[i].setVisibility(value);
        }
    }

}


export default GeodesicStripes;
