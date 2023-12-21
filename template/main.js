//set the stuff for this particular example!
//import example from "../common/items/FiveBody.js"
import example from "../common/components/GeoProgram/example.js";
//import example from "../common/items/BlackHoleGeodesics.js";
//import everything except the objects of the scene
//this uses all the default settings defined in the "template" folder
import { World } from "../common/World/World.js";
import  {createEnvironment}  from "./src/environment.js";
import  {lights}  from "./src/lights.js";
// import  post  from "./src/post.js"


//import ex from "../common/items/BlackHoleGeodesics.js";

//import PendulumSim from "../common/items/odes/PendulumSim.js";
// let ex = new PendulumSim(10);

// import DoublePendulumSim from "../common/items/odes/DoublePendulumSim.js";
// let ex = new DoublePendulumSim(200);

//global settings for the scene
let globalSettings={
    name:'World',

    stats:false,

    environment:{
        color:0x292b36,

            //0x0a0d12,
        //0x212121,
            //0x212121,
            //0x292b36,
            //0xffffff,
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

    // 1. Create an instance of the World class
    const world = new World( container, globalSettings );

    const environment = createEnvironment(globalSettings.environment, world.pmrem);
    world.setEnvironment( environment ) ;

    //BUILD THE OBJECT THAT GOES IN THIS WORLD:
    //let object = new Item();
    //let object = example;

    //4. Fill this world with objects
   // world.addObjects( ex );
   // world.addObjects({example:new Item()});
        world.addObjects({example:example} );
    world.addObjects( lights );

    //5. Set up Post-Processing effects
    //world.addPostprocessor( post );

    // 6. Start the Animation Loop
    world.start();

}


main(globalSettings);