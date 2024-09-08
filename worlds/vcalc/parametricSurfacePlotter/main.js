//set the stuff for this particular example!
import ParametricSurfacePlotter from "./ParametricSurfacePlotter.js";
import params from "./params.js";
let example = new ParametricSurfacePlotter(params);

//this uses all the default settings defined in the "template" folder
import World from "../../../code/World/World.js";
import  {createEnvironment} from "../../../code/World/template/environment.js";
import  {lights} from "../../../code/World/template/lights.js";



//global settings for the scene
let globalSettings={
    name:'World',

    stats:false,

    environment:{
        color:0xffffff,
            //0x292b36,
        cube: false,
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

    // Create an instance of the World class
    const world = new World( globalSettings );

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
