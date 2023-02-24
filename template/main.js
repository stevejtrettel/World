//set the stuff for this particular example!
import Item from "../common/itemsNew/colorvision/Monochromat.js";
import example from "../common/items/vector-calculus/CrossProduct.js"



//import everything except the objects of the scene
//this uses all the default settings defined in the "template" folder
import { World } from "../common/World/World.js";
import  {createEnvironment}  from "./src/environment.js";
import  {lights}  from "./src/lights.js";
// import  post  from "./src/post.js"



//global settings for the scene
let globalSettings={
    name:'World',

    stats:false,

    environment:{
        color: 0xffffff,
            ///0x292b36,
        cube: true,
    },

    camera:{
        animate:false,
        fov:55,
        pos:{x:2,y:4,z:8},
        look:{x:0,y:0,z:0},
        posAnimate: (t)=>{return {x:Math.cos(t),y:Math.sin(t),z:5}},
        lookAnimate: (t)=>{return {x:0,y:Math.sin(t),z:0}},
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
    let object = new Item();

    //4. Fill this world with objects
    world.addObjects( {object: object} );
    world.addObjects( lights );

    //5. Set up Post-Processing effects
    //world.addPostprocessor( post );

    // 6. Start the Animation Loop
    world.start();

}


main(globalSettings);