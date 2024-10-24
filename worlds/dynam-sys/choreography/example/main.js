
//set the stuff for this particular example!
import Choreography from "../Choreography.js";

//let params = [0.1546025015193900, -0.0987561640960160, -1.1843704912618038,  0.2521819944674475,  0.5587063079197599];
//let params = [ 0.1540289328762600, -0.0932474525425240,  0.9635026027520550,  0.5076890556787989,  0.8985961737399401];
//let params = [0.1951429184882400, -0.0827104405429360,  1.0905642669894511,  0.3887159487844687, 4.3206669731543998];
//let params = [  0.1787012846452800, -0.1663930069419300,  0.5077335405192913,  0.3792544914576978,  2.0928208429258000];
let params = [0.0893901348729010, -0.2778040293412700,  0.8927016901476158,  0.0993236875107956,  3.2303844831488000];
const example = new Choreography(params);


//this uses all the default settings defined in the "template" folder
import World from "../../../../code/World/World.js";
import  {createEnvironment} from "../../../../code/World/template/environment.js";
import  {lights} from "../../../../code/World/template/lights.js";

//global settings for the scene
let globalSettings={
    name:'World',

    stats:false,

    environment:{
        color:0x292b36,
        cube: true,
    },

    camera:{
        animate:false,
        fov:55,
        pos:{x:0.5,y:1,z:5},
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

    //BUILD THE OBJECT THAT GOES IN THIS WORLD:
    let object = {example:example};
    // Fill this world with objects
    world.addObjects(object);
    world.addObjects( lights );

    // Start the Animation Loop
    world.start();

}


main(globalSettings);
