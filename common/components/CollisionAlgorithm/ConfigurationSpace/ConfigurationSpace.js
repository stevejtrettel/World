


//the annoying thing I need to learn how to fix:
//am importing a GLOBAL ambient space into the files defining my classes
// :-(
import { ambientSpace } from "../setup.js";
import {Vector3} from "../../../../3party/three/build/three.module.js";

import { State } from "../Computation/State.js";

//right now the important parameters for the configuration space
//are the list of masses and the radii of the balls involved
//a state of the configuration space is a DataList of states of individual balls
//a dState of the configuration space is also a DataList of dStates




class ConfigurationSpace{

    constructor(masses, radii){
        this.N = masses.length;
        this.masses = masses;
        this.radii = radii;
    }


    //get the dot product with respect to the kinetic energy metric
    dot( states1, states2 ){
        let dot =0;
        for( let i=0; i< this.N; i++ ){
            //add up the dot product for each individual ball
            dot += 0.5 * this.masses[i] * ambientSpace.dot(states1[i],states2[i]);
        }
        return dot;
    }

    //norm-square of the kinetic energy metric
    kinetic( states ){
        return this.dot(states, states);
    }

    //norm of the kinetic energy metric
    norm( states ){
        return Math.sqrt(this.kinetic(states));
    }

    normalize( states ){
        let len = this.norm(states);
        return states.multiplyScalar(1/len);
    }


    //detect which balls collide with the ambient space's obstacle.
    //output the indices of these balls as a list:
    obstacleCollisions( states ){
        let indices = [];
        for(let i=0; i<this.N; i++){
            let posi = states[i].pos;
            let disti = ambientSpace.distToObstacle( posi );
            let radi = this.radii[i];
            if( disti < radi ){
                //the balls is intersecting the boundary:
                //but, see if it is heading outward or inward (maybe it reflected in the last timestep, but
                //traveled a short distance since and so is still intersecting but we shoud NOT repeat the reflection!
                let newPos = states[i].clone().flow(0.01).pos;
                let newDist = ambientSpace.distToObstacle(newPos)
                //if this new distance is less, it's an intersection with inadmissable tangent
                if(newDist<disti) {
                    indices.push(i);
                }
            }
        }

        if(indices.length===0){
            return null;
        }
        return indices;
    }

    //compute the gradient of the distance function to the boundary
    //only at the specified balls: the rest are zero
    //(instead; could take the gradient of the overall distance function which
    //is a minimum over all distances to boundary, but this would have TONS
    //of unnecessary computation)
    obstacleGradient( states, indices){

        //make a new state with same positions but zeroed out velocity:
        let grad = states.clone();
        for(let n=0; n<this.N; n++){
            grad[n].vel=new Vector3(0,0,0);
        }

        if(indices != null ) {
            //replace the velocity with the gradient in the correct index slots
            for (let index = 0; index < indices.length; index++) {
                let i = indices[index];
                let posi = states[i].pos;

                //compute the gradient of the function measuring distance to the obstacle
                let gradi = ambientSpace.gradient(ambientSpace.obstacle.distance, posi);
                //replace this in the gradient list:
                grad[i] = gradi;
            }
        }

        return grad;
    }



    ballCollisions( states ) {
        let indices = [];

        for(let i=1; i<this.N; i++){
            for( let j=0; j<i; j++ ){
                let distij = ambientSpace.distance(states[i].pos, states[j].pos);
                let radij = this.radii[i]+this.radii[j];
                if(distij<radij){

                    //the balls are intersecting: but are they approaching or moving apart?
                    let newPosi = states[i].clone().flow(0.01).pos;
                    let newPosj = states[j].clone().flow(0.01).pos;
                    let newDist = ambientSpace.distance(newPosi,newPosj);
                    //if this new distance is less, it's an intersection with inadmissable tangent
                    if(newDist<distij) {
                        indices.push([i,j]);
                    }
                }
            }
        }

        if( indices.length === 0 ){
            return null;
        }
        return indices;
    }


    //compute the gradient of the distance function
    //only compute for specified pairs [i,j] of balls, then add: rest are zero.
    //(instead; could take the gradient of the overall distance function which
    //is a minimum over all distances to balls, but this would have TONS
    //of unnecessary computation)
    ballGradient(states, indices){

        //make a new state with same positions but zeroed out velocity:
        let grad = states.clone();
        for(let n=0; n<this.N; n++){
            grad[n].vel=new Vector3(0,0,0);
        }


        //replace the velocity with the gradient in the correct index slots
        if(indices != null) {
            for (let index = 0; index < indices.length; index++) {

                let ij = indices[index];
                let i = ij[0];
                let j = ij[1];

                let posi = states[i].pos;
                let posj = states[j].pos;

                //distance function to the ball "i":
                let disti = function (pos) {
                    return ambientSpace.distance(posi, pos);
                }
                //the gradient of this function, evaluated at position j
                let gradjdisti = ambientSpace.gradient(disti, posj);
                //replace the gradient at j with this:
                grad[j] = gradjdisti;

                //distance function to the ball "j":
                let distj = function (pos) {
                    return ambientSpace.distance(posj, pos);
                }
                //the gradient of this function, evaluated at position j
                let gradidistj = ambientSpace.gradient(distj, posi);
                //replace the gradient at j with this:
                grad[i] = gradidistj;

            }
        }

        return grad;
    }


    boundaryNormal(states, collisionIndices){
        let grad1 = this.ballGradient(states, collisionIndices.ball);
        let grad2 = this.obstacleGradient(states, collisionIndices.obstacle);

        //add them together
        grad1.add(grad2);

        //normalize if we want: otherwise just return
        return grad1;
        //return this.normalize(grad1);
    }


    //reflect a state in a normal vector
    reflectIn(states, normal){

        let dot = this.dot(states,normal);
        let KE = this.kinetic(normal);

        let coef = 2.*dot/KE;

        return states.clone().sub(normal.multiplyScalar(coef));
    }


}



export { ConfigurationSpace };