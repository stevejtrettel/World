import {Vector2, Vector3} from "../../../3party/three/build/three.module.js";
import State from "./Integrator/State.js";
import dState from "./Integrator/dState.js";

import Gaussian from "./Surfaces/Gaussian.js";
import Paraboloid from "./Surfaces/Paraboloid.js";
import Geodesic from "./Geodesics/Geodesic.js";
import GeodesicSpray from "./Geodesics/GeodesicSpray.js";
import GeodesicStripes from "./Geodesics/GeodesicStripes.js";

let dom = {u:{min:-3,max:3},v:{min:-3,max:3}};
let gauss = new Gaussian(dom);
let parabola = new Paraboloid(dom);

const iniState = new State( new Vector2(2,1), new Vector2(1,1) );

const geo = new Geodesic(gauss,iniState);
geo.addToUI=function(ui){};
geo.tick = function(time,dTime){
    let iniState = new State(new Vector2(-2,2),new Vector2(Math.cos(time),Math.sin(time)));
    geo.update(iniState);
}

const spray= new GeodesicSpray(gauss);
spray.addToUI=function(ui){};
spray.tick = function(time,dTime){
    spray.update({time:time});
}


const stripes= new GeodesicStripes(gauss);
stripes.addToUI=function(ui){};
stripes.tick = function(time,dTime){
    stripes.update({time:time});
}


export default stripes;