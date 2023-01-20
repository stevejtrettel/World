
import { randomVec3Ball } from "./utils/random.js";
import {State} from "./Computation/State.js";

import {DataList} from "./Computation/DataList.js";

import {ConfigurationSpace} from "./ConfigurationSpace/ConfigurationSpace.js";
import {Simulation} from "./ConfigurationSpace/Simulation.js";
import {RenderSim} from "./Visualization/RenderSim.js";

import {euclidean} from "./AmbientSpace/ExampleSpaces/Euclidean.js";
import { hyperbolic } from "./AmbientSpace/ExampleSpaces/HypSpacePoincareBall.js";
import { spherical } from "./AmbientSpace/ExampleSpaces/SphericalStereoProj.js";
import { inhomogeneousNeg } from "./AmbientSpace/ExampleSpaces/InhomogeneousNeg.js";
import { inhomogeneousPos } from "./AmbientSpace/ExampleSpaces/InhomogeneousPos.js";


//set the ambient space for the project
let ambientSpace = hyperbolic;

//build a configuration space:
let NumBalls = 30;
let MaxRad = ambientSpace.obstacle.size/10.;

let radii = [];
let masses = [];
for(let i=0; i<NumBalls; i++){
    let r = MaxRad * Math.random()+0.05;
    let m = 10.*r*r*r;
    radii.push(r);
    masses.push(m);
}

let configurationSpace = new ConfigurationSpace(masses, radii);
// let maxPos = 2.;
// let maxVel = 1;

//build the initial set of states for the system:
let iniCond = [];
for(let i=0; i<NumBalls; i++){
    // let pos = new randomVec3Ball(maxPos);
    // let vel = new randomVec3Ball(maxVel);
    // let state = new State(pos,vel);
    // iniCond.push(state);
    iniCond.push(ambientSpace.obstacle.generateState());
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