//set the stuff for this particular example!
import Item from "../common/itemsNew/vector-calculus/ParametricCurvePlotter.js";

//import everything except the objects of the scene
//this uses all the default settings defined in the "template" folder
import { World } from "../common/World/World.js";
import  {createEnvironment}  from "./src/environment.js";
import  {lights}  from "./src/lights.js";
// import  post  from "./src/post.js"

import { createRenderer } from "../common/World/components/createRenderer.js";
import {PMREMGenerator} from "../3party/three/build/three.module.js";


function main(globalSettings,itemSettings) {

    // Get a reference to the container element, set options
    const container = document.getElementById(globalSettings.name);

    // 1. Create an instance of the World class
    const world = new World( container, globalSettings );

    const environment = createEnvironment(globalSettings.environment, world.pmrem);
    world.setEnvironment( environment ) ;

    //BUILD THE OBJECT THAT GOES IN THIS WORLD:
    let object = new Item( itemSettings );
    console.log(object);

    //4. Fill this world with objects
    world.addObjects( {object:object} );
    world.addObjects( lights );

    //5. Set up Post-Processing effects
    //world.addPostprocessor( post );

    // 6. Start the Animation Loop
    world.start();

}



export default main;