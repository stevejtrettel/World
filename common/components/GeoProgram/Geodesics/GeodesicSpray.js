import {Vector2, Mesh, SphereGeometry,} from "../../../../3party/three/build/three.module.js";

import Geodesic from "./Geodesic.js";
import State from "../Integrator/State.js";

let defaultCurveOptions = {
    length:15,
    color: 0xffffff,
    radius: 0.02,
    res: 100,
};

let defaultParams = {
    N:50,
    time:0,
    pos: new Vector2(-2,0),
    angle:0,
    spread:1
};

//the params here should match those of GeodesicSpray
//so that they can use the same parameters in the UI
//can we just feed in the whole UI commands here?
class GeodesicSpray {
    constructor(surface, params=defaultParams) {
        this.maxN = 100;
        this.surface = surface;
        this.params = params;

        //CHANGE THIS: but for now have the curve parameters all just given by default:
        this.curveOptions = defaultCurveOptions

        this.iniStates = new Array(this.maxN);
        for(let i=0;i<this.maxN;i++){
            this.iniStates[i]=new State(new Vector2(0,0),new Vector2(0,0));
        }
        this.buildIniStates();

        this.spray =  new Array(this.maxN);
        for(let i=0;i<this.maxN;i++){
            this.spray[i] = new Geodesic(this.surface,this.iniStates[0], this.curveOptions);
        }
        this.buildGeodesics();

    }

    buildIniStates() {
        //RIGHT NOW JUST A TEST CASE:
        // all based at one point, angles at that point spread around default angle:
        let iniAngle = Math.sin(3.1415/2*this.params.angle);
        for (let i = 0; i < this.params.N; i++) {
            let angle = iniAngle + 3.14/2*this.params.spread* (i/this.params.N-0.5);
            let vel = new Vector2(Math.cos(angle),Math.sin(angle));
            this.iniStates[i]=new State(this.params.pos, vel);
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
        for (let i = 0; i < this.maxN; i++) {
            if(i<this.params.N) {
                this.spray[i].update(this.iniStates[i]);
                this.spray[i].setVisibility(true)
            }
            else{
                this.spray[i].setVisibility(false);
            }
        }
    }

    addToScene(scene){
        for(let i=0; i<this.maxN; i++){
            this.spray[i].addToScene(scene);
            let show = (i<this.params.N);
            this.spray[i].setVisibility(show);
        }
    }

    update(params) {
        for(const key in params){
            if(this.params.hasOwnProperty(key)){
                this.params[key] = params[key];
            }
        }
            //build the initial states, and rebuild geodesics!
            this.buildIniStates();
            this.updateGeodesics();
    }

    updateSurface(){
        for(let i=0; i<this.maxN; i++){
            this.spray[i].updateSurface();
        }
    }

    printToString(numPts = 500){
        let str = ``;
        for(let i=0; i<this.params.N; i++){
            let next = this.spray[i].printToString(numPts);
            str = str + next;
        }
        return str;
    }

    printToFile(fileName='spray',numPts=500){
        for(let i=0; i<this.params.N; i++){
            const name = fileName + i.toString();
            this.spray[i].printToFile(name,numPts);
        }
    }

    setVisibility(value){
        for(let i=0; i<this.params.N; i++){
            this.spray[i].setVisibility(value);
        }
    }

}


export default GeodesicSpray;