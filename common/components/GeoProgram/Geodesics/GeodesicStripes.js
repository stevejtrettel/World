import {Vector2} from "../../../../3party/three/build/three.module.js";
import Geodesic from "./Geodesic.js";
import State from "../Integrator/State.js";
import ParallelTransport from "../Parallel/ParallelTransport.js";


let defaultCurveOptions = {
    length:30,
    color: 0xffffff,
    radius: 0.02,
    res: 100,
};


let defaultParams = {
    N:11,
    time:0,
    angle:0,
    spread:1,
    pos:0,
}


//the params here should match those of GeodesicSpray
//so that they can use the same parameters in the UI
//can we just feed in the whole UI commands here?
class GeodesicStripes {
    constructor(surface, params=defaultParams) {

        this.maxN = 101;

        this.surface = surface;
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
        this.buildIniStates();

        this.stripes =  new Array(this.maxN);
        for(let i=0;i<this.maxN;i++){
            this.stripes[i] = new Geodesic(this.surface,this.iniStates[0], this.curveOptions);
        }
        this.buildGeodesics();
    }

    buildIniStates() {

        //set an initial vector direction with respect to the edge
        let vel = new Vector2(1,Math.sin(3.1415/2.*this.params.angle) ).normalize();

        //build a curve that goes along a portion of the boundary
        let uMin = this.surface.domain.u.min;
        let vMin = this.surface.domain.v.min;
        let vRange = this.surface.domain.v.max-vMin;
        let pos = this.params.pos;
        let spread = this.params.spread;

        let curve = function(t){
            let u = uMin;
            let v = pos + spread*vRange*(t-0.5);
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
            geodesic = new Geodesic(this.surface, this.iniStates[i], this.curveOptions);
            this.stripes[i]=geodesic;
        }
    }

    updateGeodesics() {
        for (let i = 0; i < this.maxN; i++) {
            if(i<this.params.N) {
                this.stripes[i].setVisibility(true);
                this.stripes[i].update(this.iniStates[i]);

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
        for(let i=0; i<this.maxN; i++){
            this.stripes[i].updateSurface();
        }
    }

    printToFile(fileName='stripes',numPts=500) {
        for (let i = 0; i < this.params.N; i++) {
            const name = fileName + i.toString();
            this.stripes[i].printToFile(name, numPts);
        }
    }

    printToString(numPts = 500){
        let str = ``;
        for(let i=0; i<this.params.N; i++){
            let next = this.stripes[i].printToString(numPts);
            str = str + next;
        }
        return str;
    }

    setVisibility(value) {
        for (let i = 0; i < this.params.N; i++) {
            this.stripes[i].setVisibility(value);
        }
    }

}


export default GeodesicStripes;