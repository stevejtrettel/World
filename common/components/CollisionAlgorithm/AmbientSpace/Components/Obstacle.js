import {randomVec3Ball} from "../../utils/random.js";
import {State} from "../../Computation/State.js";



class Obstacle{
    constructor(distance,geometry, size=null, generateState=null){
        this.distance=distance;
        this.geometry=geometry;


        //size gives the rough size of the bounding box IN GEOMETRIC UNITS: useful for setting initial conditions
        //(ie choosing radii)
        if(size!=null){
            this.size=size;
        }
        else{this.size = 1.}


        //generateState makes a random state IN COORDINATES that is not hitting the obstacle
        if(generateState != null){
            this.generateState = generateState;
        }
        else{
            this.generateState = function(){
                return new State(randomVec3Ball(1),randomVec3Ball(1));
            }
        }
    }
}



export { Obstacle };