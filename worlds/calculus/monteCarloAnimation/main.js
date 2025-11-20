//set the stuff for this particular example!
import MonteCarloPlotter from "./src/MonteCarloPlotter.js";


let fnText = 'x*cos(x)+x/2+3.';
let range = { min:-10,max:10};
let N = 1000;
let example = new MonteCarloPlotter(fnText, range, N);



//this uses all the default settings defined in the "template" folder
import World from "../../../code/World/World.js";
import  {createEnvironment} from "../../../code/World/template/environment.js";
import  {lights} from "../../../code/World/template/lights.js";


//global settings for the scene
let globalSettings={
    name:'World',

    stats:false,

    environment:{
        color:0x292929,
        cube: true,
    },

    camera:{
        animate:false,
        fov:55,
        pos:{x:0,y:0,z:10},
        look:{x:0,y:0,z:0},
    },

    controls:{
        minDistance:0,
        maxDistance:100,
    }

};





function main(globalSettings) {

    // Create an instance of the World class
    const world = new World(globalSettings );

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
