
//this example is already an object
import Extremal from "./src/Extremal.js";
let ex = new Extremal();


//this uses all the default settings defined in the "template" folder
import World from "../../../code/World/World.js";
import  {createEnvironment} from "../../../code/World/template/environment.js";
import  {lights} from "../../../code/World/template/lights.js";


//global settings for the scene
let globalSettings={
    name:'World',

    stats:false,

    environment:{
        color:0x1a1a1a,
        cube: true,
    },

    camera:{
        animate:false,
        fov:55,
        pos:{x:0,y:0,z:0},
        look:{x:0,y:0,z:0},
        posAnimate: (t)=>{
            return {x:20.*Math.sin(t/10),y:5,z:20.*Math.cos(t/10)}},
        lookAnimate: (t)=>{return {x:0,y:-5,z:0}},
    },

    controls:{
        minDistance:0,
        maxDistance:100,
    }

};





function main(globalSettings) {

    // Create an instance of the World class
    const world = new World(globalSettings);

    const environment = createEnvironment(globalSettings.environment, world.pmrem);
    world.setEnvironment( environment ) ;

    // Fill this world with objects
    let object = {example:ex};
    world.addObjects(object);
    world.addObjects( lights );

    // Start the Animation Loop
    world.start();

}


main(globalSettings);
