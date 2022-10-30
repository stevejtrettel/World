
import { randomVector3 } from "./Computation/random.js";
import {State} from "./Computation/State.js";
import {DataList} from "./Computation/DataList.js";

import {ConfigurationSpace} from "./ConfigurationSpace/ConfigurationSpace.js";
import {RenderSim} from "./Visualization/RenderSim.js";
import {Simulation} from "./ConfigurationSpace/Simulation.js";

import {euclidean} from "./AmbientSpace/ExampleSpaces/Euclidean.js";
import { hyperbolic } from "./AmbientSpace/ExampleSpaces/Hyperbolic.js";
import { spherical } from "./AmbientSpace/ExampleSpaces/Spherical.js";






//set the ambient space for the project
let ambientSpace = euclidean;

//build a configuration space:
let NumBalls = 70;
let MaxRad = 0.05;

let radii = [];
let masses = [];
for(let i=0; i<NumBalls; i++){
    // let r=0.1;
    // let m =0.0001;
    let r = MaxRad * Math.random()+0.05;
    let m = r;
    radii.push(r);
    masses.push(m);
}

let configurationSpace = new ConfigurationSpace(masses, radii);


//build the initial set of states for the system:
let iniCond = [];
let maxPos = 0.6;
let maxVel = 1;

for(let i=0; i<NumBalls; i++){
    let pos = randomVector3(maxPos);
    let vel = randomVector3(maxVel);
    iniCond.push(new State(pos,vel));
}

let states = new DataList(iniCond);



//make the simulation
let sim = new Simulation( states, 0.001 );

//make the visualization of the simulation
let viz = new RenderSim( sim, radii );

//send the visualization off to be rendered on the screen
export default { viz };


//export these to use as global variables in the DEFINITIONS of the classes
//Simulation, ConfigurationSpace, and RenderSim :0 :0 PLZ FIX
export { ambientSpace, configurationSpace };