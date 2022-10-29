
import { hyperbolic } from "./AmbientSpace/ExampleSpaces/Hyperbolic.js";
import { randomVector3 } from "./Computation/random.js";
import {ConfigurationSpace} from "./ConfigurationSpace/ConfigurationSpace.js";
import {RenderSim} from "./Visualization/RenderSim.js";
import {Simulation} from "./ConfigurationSpace/Simulation.js";
import {euclidean} from "./AmbientSpace/ExampleSpaces/Euclidean.js";
import {State} from "./Computation/State.js";
import {DataList} from "./Computation/DataList.js";


//set the ambient space for the project
let ambientSpace = euclidean;

//build a configuration space:
let NumBalls = 30;
let MaxRad = 0.75;

let radii = [];
let masses = [];
for(let i=0; i<NumBalls; i++){
    let r = MaxRad* Math.random();
    let m = r*r*r;
    radii.push(r);
    masses.push(m);
}

let configurationSpace = new ConfigurationSpace(masses, radii);


//build the initial set of states for the system:
let iniCond = [];
let maxPos = 2;
let maxVel = 1;

for(let i=0; i<NumBalls; i++){
    let pos = randomVector3(maxPos);
    let vel = randomVector3(maxVel);
    iniCond.push(new State(pos,vel));
}

let states = new DataList(iniCond);



//make the simulation
let sim = new Simulation( states );

//make the visualization of the simulation
let viz = new RenderSim( sim, radii );

//send the visualization off to be rendered on the screen
export default { viz };

//export these to use as global variables in the DEFINITIONS of the classes
//Simulation, ConfigurationSpace, and RenderSim :0 :0 PLZ FIX
export { ambientSpace, configurationSpace };