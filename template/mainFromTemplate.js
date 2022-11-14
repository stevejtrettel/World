
//import everything except the objects of the scene
//this uses all the default settings defined in the "template" folder

import { World } from "../common/World/World.js";
import { globals } from "./src/globals.js";
import { createEnvironment } from "./src/environment.js";
import { lights } from "./src/lights.js";
import { post } from "./src/post.js"


function mainFromTemplate( objects, options ) {

    // Get a reference to the container element, set options
    const container = document.querySelector('#World');

    // 1. Create an instance of the World class
    const world = new World( container, globals.renderer, options );

    //2. Introduce any global variables:
    world.addGlobalParams( globals.params );

    //3. Set the environment
    let bkgColor=globals.color;;
    if(options.hasOwnProperty("color")){
        bkgColor=options.color;
    }

    const environment = createEnvironment(bkgColor);
    world.setEnvironment( environment ) ;


    //4. Fill this world with objects
    world.addObjects( objects );
    world.addObjects( lights );

    //5. Set up Post-Processing effects
    world.addPostprocessor( post );

    // 6. Start the Animation Loop
    world.start();

}


export { mainFromTemplate };
