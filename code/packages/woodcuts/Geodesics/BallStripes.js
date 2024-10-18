import {Vector2} from "../../../../3party/three/build/three.module.js";
import Ball from "./Ball.js";
import State from "../Integrator/State.js";

let defaultCurveOptions = {
    length:1,
    color: 0xffffff,
    radius: 0.05,
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
class BallStripes {
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
            this.stripes[i] = new Ball(this.surface,this.iniStates[0], this.curveOptions);
        }
        this.buildBalls();
    }

    buildIniStates() {
        //given one initial state, (and a time, if animated) build the whole set
        //RIGHT NOW JUST A TEST CASE: evenly distributed along U direction.
        let vel = new Vector2(1,Math.sin(3.1415/2.*this.params.angle) ).normalize();
        let uMin = this.surface.domain.u.min;
        let uMax = this.surface.domain.u.max;
        let vMin = this.surface.domain.v.min;
        let vMax = this.surface.domain.v.max;
        let uRange = uMax - uMin;
        let vRange = vMax - vMin;

        for (let i = 0; i < this.params.N; i++) {
            let width = vRange / this.params.N;
            let pos = new Vector2(uMin , this.params.pos + this.params.spread*(vMin + (i+0.5) * width) );
            this.iniStates[i]=new State(pos, vel);
        }
    }

    buildBalls() {
        let geodesic;
        for (let i = 0; i < this.params.N; i++) {
            geodesic = new Ball(this.surface, this.iniStates[i], this.curveOptions);
            this.stripes[i]=geodesic;
        }
    }

    updateBalls() {
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
        this.updateBalls();
    }

    updateSurface(){
        for(let i=0; i<this.maxN; i++){
            this.stripes[i].updateSurface();
        }
    }

    setVisibility(value) {
        for (let i = 0; i < this.params.N; i++) {
            this.stripes[i].setVisibility(value);
        }
    }

    stepForward(){
        for(let i=0;i<this.maxN; i++){
            if(this.stripes[i].visible){
                this.stripes[i].stepForward();
            }
        }
    }

}


export default BallStripes;