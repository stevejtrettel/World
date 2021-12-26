import { World } from "../common/World/World.js";
import { globals } from "./src/globals.js";
import { objects } from "./src/objects.js";
import { environment } from "./src/environment.js";
import { lights } from "./src/lights.js";
import { post } from "./src/post.js"




function main() {

    // Get a reference to the container element, set options
    const container = document.querySelector('#World');
    const options = {color: 0x2f508a};

    // 1. Create an instance of the World class
    const world = new World( container, globals.renderer, options );

    //2. Introduce any global variables:
    world.addGlobalParams( globals.params );

    //3. Set the environment
    world.setEnvironment( environment ) ;

    //4. Fill this world with objects
    world.addObjects( objects );
    world.addObjects( lights );

    //5. Set up Post-Processing effects
    world.addPostprocessor( post );

    // 6. Start the Animation Loop
    world.start();

}


//call the function to run the app
main();
