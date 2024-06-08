//set the stuff for this particular example!
import SecantLinePlotter from "../../../common/items/calculus/SecantLinePlotter.js";
import params from "./params.js";
let example = new SecantLinePlotter(params);

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

    // Fill this world with objects
    let object = {example:example};
    world.addObjects(object);
    world.addObjects( lights );

    // Start the Animation Loop
    world.start();

}


main(globalSettings);
