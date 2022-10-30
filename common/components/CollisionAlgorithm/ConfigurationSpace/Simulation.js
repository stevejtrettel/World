
import {DataList} from "../Computation/DataList.js";
import {RungeKutta} from "../Computation/RungeKutta.js";



//RIDICULOUS: need to figure out how not to have to import these :(
import{ ambientSpace, configurationSpace } from "../setup.js";



class Simulation{
    constructor(states, stepSize) {
        this.states = states;
        this.stepSize =stepSize;

        //to set when intersecting
        this.collisions={
            ball: null,
            obstacle: null
        };


        //build an integrator
        //get the function which takes the derivative of each element of a stateList:
        //using ambientSpace.acceleration will allow us to use external potentials without changing code
        let derive = function(st){
            let res = [];
            for( let i=0; i<st.length; i++){
                res.push(ambientSpace.acceleration(st[i]));
            }

            let accel = new DataList(res);
            return accel;
        }

        this.integrator = new RungeKutta(derive,this.stepSize);

    }


    detectCollision(){

        this.collisions.obstacle = configurationSpace.obstacleCollisions(this.states);
        this.collisions.ball = configurationSpace.ballCollisions(this.states);

        if(this.collisions.obstacle !=null || this.collisions.ball != null ){
            return true;
        }

        return false;

    }


    smoothDynamics(){
        this.states = this.integrator.step(this.states);
    }

    collisionDynamics(){

        //get the normal vector to the boundary of configuration space
        let bdyNormal = configurationSpace.boundaryNormal(
            this.states,
            this.collisions
        );

        //update the state by reflecting in the boundary normal
        //with respect to the configuration space's metric
        this.states = configurationSpace.reflectIn(this.states, bdyNormal);
    }

    step(){

        //get the points of collision, if there are any
        let collide = this.detectCollision();

        if( collide ){
            this.collisionDynamics();
        }

        else {
            //then after they've been resolved, run smooth dynamics
            this.smoothDynamics();
        }

    }

}



export { Simulation };