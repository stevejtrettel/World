//set the stuff for this particular example!

import item from "../common/items/complex-analysis/CplxPowerSeries.js";
let objects = {...item};


let globalParams={
    name:'World',

    environment:{
        color: 0xffffff,
        cube: true,
    },

    camera:{
        animate:false,
        fov:55,
        pos:{x:0,y:1,z:8},
        look:{x:0,y:0,z:0},
        posAnimate: (t)=>{return {x:Math.cos(t),y:Math.sin(t),z:5}},
        lookAnimate: (t)=>{return {x:0,y:Math.sin(t),z:0}},
    },

    controls:{
        minDistance:0,
        maxDistance:100,
    }

};

//import everything except the objects of the scene
//this uses all the default settings defined in the "template" folder

import { World } from "../common/World/World.js";
import { globals } from "./src/globals.js";
import { createEnvironment } from "./src/environment.js";
import { lights } from "./src/lights.js";
import { post } from "./src/post.js"


function main( objects, options ) {

    // Get a reference to the container element, set options
    const container = document.getElementById('World');

    // 1. Create an instance of the World class
    const world = new World( container, globals.renderer, options );

    //2. Introduce any global variables:
    world.addGlobalParams( globals.params );


    const environment = createEnvironment(options.environment.color);
    world.setEnvironment( environment ) ;

    //4. Fill this world with objects
    world.addObjects( objects );
    world.addObjects( lights );

    //5. Set up Post-Processing effects
    //world.addPostprocessor( post );

    // 6. Start the Animation Loop
    world.start();

}

//call the function to run the app
main(objects, globalParams);
