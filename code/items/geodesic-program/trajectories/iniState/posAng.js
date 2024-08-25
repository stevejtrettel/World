import {Vector2} from "../../../../../3party/three/build/three.module.js";

//creates and keeps track of an initial state
// State(pos, vel)
//pos is controlled by x,y in [-1,1]; rescaled to domain
//vel is controlled by angle and magnitude

class posAng{

    constructor(surface) {
        this.surface = surface;
        this.params = {
            x: 0,
            y: 0,
            ang: 0,
            mag: 1,
        }

    }


    addToUI(ui){

    }

}

export default posAng;
