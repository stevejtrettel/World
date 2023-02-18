//set the stuff for this particular example!
import Item from "../common/items/vector-calculus/TESTCurve.js";

//import everything except the objects of the scene
//this uses all the default settings defined in the "template" folder
import { World } from "../common/World/World.js";
import  {globals}  from "./src/globals.js";
import  {createEnvironment}  from "./src/environment.js";
import  {lights}  from "./src/lights.js";
// import  post  from "./src/post.js"


function main(globalParams,itemParams) {

    // Get a reference to the container element, set options
    const container = document.getElementById(globalParams.name);

    // 1. Create an instance of the World class
    const world = new World( container, globals.renderer, globalParams );

    //2. Introduce any global variables:
    // world.addGlobalParams( globals.params );

    const environment = createEnvironment(globalParams.environment);
    world.setEnvironment( environment ) ;

    //BUILD THE OBJECT THAT GOES IN THIS WORLD:
    let object = new Item(itemParams);

    //4. Fill this world with objects
    world.addObjects( {object:object} );
    world.addObjects( lights );

    //5. Set up Post-Processing effects
    //world.addPostprocessor( post );

    // 6. Start the Animation Loop
    world.start();

}



export default main;