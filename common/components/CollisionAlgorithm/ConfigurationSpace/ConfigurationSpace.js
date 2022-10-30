


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
            dot += 1/2 * this.masses[i] * ambientSpace.dot(states1[i],states2[i]);
        }
        return dot;
    }

    //norm of the kinetic energy metric
    norm( states ){
        return Math.sqrt(this.dot(states, states));
    }

    normalize( states ){
        let len = this.norm(states);
        let res = states.clone().multiplyScalar(1/len);

        return res;
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
                //but, see if it is heading outward or inward
                let newPos = states[i].clone().flow(0.001).pos;
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


        console.log(indices);
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

                //with respect to the metric g on the ambient space X
                let geomGradi = ambientSpace.gradient(ambientSpace.obstacle.distance, posi);

                //the kinetic energy metric is 1/2*m*g, so the inverse metric tensor
                //is scaled by 2/m:
                let gradi = geomGradi.clone().multiplyScalar(2/this.masses[i]);

                //replace this in the gradient list:
                grad[i] = gradi;
            }
        }

        return grad;
    }



    ballCollisions( states ) {
        let indices = [];

        for(let i=0; i<this.N; i++){
            for( let j=i+1; j<this.N; j++ ){

                let distij = ambientSpace.distance(states[i].pos, states[j].pos);
                let radij = this.radii[i]+this.radii[j];

                if(distij<radij){
                    //the balls are intersecting: but are they approaching or moving apart?
                    let newPosi = states[i].clone().flow(0.001).pos;
                    let newPosj = states[j].clone().flow(0.001).pos;
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

        console.log(indices);
        return indices;
    }


    //compute the gradient of the distance function
    //only compute for specified pairs [i,j] of balls, then add: rest are zero.
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

                //the kinetic energy metric for the jth particle is the Riemannian metric g,
                //scaled by 1/2*m: thus the gradient is the g-gradient scaled by 2/m
                //replace the gradient at j with this:
                grad[j] = gradjdisti.clone().multiplyScalar(2/this.masses[j]);;

                //distance function to the ball "j":
                let distj = function (pos) {
                    return ambientSpace.distance(posj, pos);
                }
                //the gradient of this function, evaluated at position j
                let gradidistj = ambientSpace.gradient(distj, posi);

                //the kinetic energy metric for the jth particle is the Riemannian metric g,
                //scaled by 1/2*m: thus the gradient is the g-gradient scaled by 2/m
                //replace the gradient at i with this:
                grad[i] = gradidistj.clone().multiplyScalar(2/this.masses[i]);

            }
        }

        return grad;
    }


    boundaryNormal(states, collisionIndices){
        let grad1 = this.obstacleGradient(states, collisionIndices.obstacle);
        let grad2 =  this.ballGradient(states, collisionIndices.ball);

        //add them together
        let grad = grad1.clone().add(grad2);

        return this.normalize(grad.clone());
    }

    //this is MEANINGLESS outside of Euclidean space:
    //this is only used for debugging: to confirm momentum is conserved
    //with ball-on-ball collisions (but not collisions with the boundary, obv)
    momentum(state){
        let p = new Vector3().set(0,0,0);
        for(let i=0; i<this.N;i++){
            p.add(state[i].vel.clone().multiplyScalar(this.masses[i]));
        }
        return p;
    }


    //reflect a state in a normal vector
    //states is the current tangent vector to configuration space (states of all the balls)
    //normal is the normal vector to the boundary of configuration space
    reflectIn(states, normal){

        let dot = this.dot(states,normal);
        let norm2 = this.dot(normal,normal);

        let coef = 2.*dot/norm2;

        let result =  states.clone().sub(normal.clone().multiplyScalar(coef));

        return result;
    }

}



export { ConfigurationSpace };