import {Vector3} from "../../../../../3party/three/build/three.module.js";

import { State} from "../../Computation/State.js";
import {dState} from "../../Computation/dState.js";


// a class for storing the information about the ambient space geometry
// used in a curved space simulation.

class Geometry {

    constructor(distance, metricTensor, christoffel){
        this.christoffel = christoffel;
        this.distance = distance;
        this.metricTensor = metricTensor;
    }


    //take the covariant derivative of a state
    //and return a dState storing the initial velocity, and the
    //covariant coordinates (x'', y'', z'')= of the covariant derivative
    covariantAcceleration(state){
        let vel = state.vel;
        let acc = this.christoffel(state);
        return new dState(vel,acc);
    }

    //calculate the dot product of two vectors, using the  metric tensor
    dot(state1, state2){
        let mat = this.metricTensor(state1.pos);
        let v1 = state1.vel;
        let v2 = state2.vel;

        //apply this to the second vector
        let gv2 = v2.applyMatrix3(mat);
        //compute the dot product:
        return v1.dot(gv2);
    }


    //get a basis for the tangent space at a point, in coordinates
    //change how we want to do this, depending on which implementation
    //of the gradient we want below:
    //right now, this is the coordinate basis, and we use the metric tensor
    //in the gradient: could instead do Gram-Schmidt here then calculate
    //gradient as differential directly in that basis.
    tangentBasis(pos){
        let b1 = new State(pos, new Vector3(1,0,0));
        let b2 = new State(pos, new Vector3(0,1,0));
        let b3 = new State(pos, new Vector3(0,0,1));
        return [b1,b2,b3];
    }


    //WARNING: IF THE COORDINATE SYSTEM IS SINGULAR: THIS COMPUTATION IS BAD AT THAT POINT!
    //NEED GOOD COORDINATES.....
    //get the gradient of a function fn at a position pos
    gradient(fn,pos){

        let basis = this.tangentBasis(pos);
        let differential = new State(pos, new Vector3(0,0,0));

        //add them all up:
        let df0 = basis[0].differentiate(fn);
        basis[0].multiplyScalar(df0);
        differential.add(basis[0]);

        let df1 = basis[1].differentiate(fn);
        basis[1].multiplyScalar(df1);
        differential.add(basis[1]);

        let df2 = basis[2].differentiate(fn);
        basis[2].multiplyScalar(df2);
        differential.add(basis[2]);

        //now the differential needs to be converted from a covector to a vector
        //using the hyperbolic metric:
        let metric = this.metricTensor(pos);
        if(Math.abs(metric.determinant())<0.00001){
            console.log('Warning! Metric Tensor Near Singular');
            console.log(pos);
            console.log(metric);
        }
        let invMetric = metric.clone().invert();
        differential.vel = differential.vel.applyMatrix3(invMetric);
        return differential;
    }

}


export { Geometry };