import {Vector3} from "../../../3party/three/build/three.module.js";


//set the stuff for this particular example!
import ThreeBody from "../../../common/items/diffeqs/ThreeBody.js";


//actually building one of these
const pA = {
    mass:1,
    pos: new Vector3(0,0,0),
    vel: new Vector3(0,-0.5,-0.5),
    color: 0xffffff,
    trailLength: 2000,
}

const pB = {
    mass:0.5,
    pos: new Vector3(0,5,0),
    vel: new Vector3(0,0,.5),
    color: 0xd96493,
    trailLength: 2000,
}

const pC = {
    mass:0.3,
    pos: new Vector3(0,0,5),
    vel: new Vector3(-0.2,0.5,0.),
    color: 0x32a852,
    trailLength: 2000,
}


const example = new ThreeBody(pA, pB, pC);




//this uses all the default settings defined in the "template" folder
import { World } from "../../../common/World/World.js";
import  {createEnvironment} from "../../../common/World/template/environment.js";
import  {lights} from "../../../common/World/template/lights.js";

//global settings for the scene
let globalSettings={
    name:'World',

    stats:false,

    environment:{
        color:0x292b36,
        cube: true,
    },

    camera:{
        animate:false,
        fov:55,
        pos:{x:2,y:4,z:8},
        look:{x:0,y:0,z:0},
        posAnimate: (t)=>{
            return {x:15.*Math.sin(Math.sin(t/5)),y:7,z:15.*Math.cos(Math.sin(t/5))}},
        lookAnimate: (t)=>{return {x:0,y:-5,z:0}},
    },

    controls:{
        minDistance:0,
        maxDistance:100,
    }

};





function main(globalSettings) {

    // Get a reference to the container element, set options
    const container = document.getElementById(globalSettings.name);

    // Create an instance of the World class
    const world = new World( container, globalSettings );

    const environment = createEnvironment(globalSettings.environment, world.pmrem);
    world.setEnvironment( environment ) ;

    //BUILD THE OBJECT THAT GOES IN THIS WORLD:
    let object = {example:example};
    // Fill this world with objects
    world.addObjects(object);
    world.addObjects( lights );

    // Start the Animation Loop
    world.start();

}


main(globalSettings);