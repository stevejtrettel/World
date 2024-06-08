import {
    Vector3,
    Matrix3,
    SphereBufferGeometry,
    MeshPhysicalMaterial,
    Mesh, DoubleSide, CatmullRomCurve3, TubeBufferGeometry
} from "../../3party/three/build/three.module.js";



// a class for states: position and velocities of a single ball
class State {

    constructor(pos, vel){
        this.pos=pos.clone();
        this.vel=vel.clone();
    }

    clone(){
        return  new State(this.pos.clone(), this.vel.clone());
    }


    add( state ) {
        this.vel.add(state.vel);
        return this;
    }

    sub( state ){
        this.vel.sub(state.vel);
        return this;
    }

    multiplyScalar( k ) {
        this.vel.multiplyScalar(k);
        return this;
    }


    //a new possibility not inherited from vec
    flow(ep){
        this.pos.add(this.vel.clone().multiplyScalar(ep));
        return this;
    }

    //take the directional derivative of a function at pos in direction vel:
    dirDeriv(fn){

        let eps = 0.00001;
        let pos1 = this.pos.clone().add(this.vel.clone().multiplyScalar(-eps/2));
        let pos2 = this.pos.clone().add(this.vel.clone().multiplyScalar(eps/2));

        let dval = fn(pos2)-fn(pos1);
        return  dval/eps;
    }

    //add a dState to State:
    updateBy( dState ) {
        this.pos.add(dState.vel);
        this.vel.add(dState.acc);
        return this;
    }

}

//a class for the differential of states on the tangent bundle:
//vel is the velocity of the original configuration, and acc is the covariant derivative
class dState {
    constructor(vel,acc){
        this.vel=vel.clone();
        this.acc=acc.clone();
    }

    clone() {
        return  new dState(this.vel.clone(),this.acc.clone());
    }

    multiplyScalar ( k ) {
        this.vel.multiplyScalar( k );
        this.acc.multiplyScalar( k );
        return this;
    }

    add(dState) {
        this.vel.add(dState.vel);
        this.acc.add(dState.acc);
        return this;
    }

    sub( dState ) {
        this.vel.sub( dState.vel );
        this.acc.sub( dState.acc );
        return this;
    }

}




//classes for lists of States and dStates
//these are states in the configuration space of the combined system: so these are the "q" in the paper
class DataList extends Array {
    constructor(list) {
        super(...list);
    }

    clone(){
        let arr = [];
        for( let i=0; i<this.length; i++){
            arr.push(this[i].clone());
        }
        return new DataList(arr);
    }

    multiplyScalar( scalar ){
        for( let i=0; i<this.length; i++){
            this[i].multiplyScalar( scalar );
        }
        return this;
    }

    add(list){
        for( let i=0; i<this.length; i++){
            this[i].add( list[i] );
        }
        return this;
    }

    sub(list){
        for( let i=0; i<this.length; i++){
            this[i].sub( list[i] );
        }
        return this;
    }


    updateBy(list){
        for( let i=0; i<this.length; i++){
            this[i].updateBy( list[i] );
        }
        return this;
    }

}


// a class for integrating equations of motion called "integrator" and one specific implementation, Runge Kutta
//derive is a function taking a state to state (now storing velocity and acceleration instead of position and velocity)
//items fed into RungeKutta need to have the following methods available:
//.add, .multiplyScalar, .clone

//implementing the Rk4 Scheme for arbitrary classes that have clone add and multiplyScalar
//will use this possibly on individual states, or on entire DataLists!
class RungeKutta {

    constructor (derive, ep){
        this.derive=derive;
        this.ep=ep;
    }

    //step forwards one timestep
    step(state){

        let k1,k2,k3,k4;
        let temp;

        //get the derivative
        k1 = this.derive(state);
        k1.multiplyScalar(this.ep);

        //get k2
        temp=state.clone().add(k1.clone().multiplyScalar(0.5));
        k2=this.derive(temp);
        k2.multiplyScalar(this.ep);

        //get k3
        temp=state.clone().add(k2.clone().multiplyScalar(0.5));
        k3=this.derive(temp);
        k3.multiplyScalar(this.ep);

        //get k4
        temp=state.clone().add(k3.multiplyScalar(1.));
        k4=this.derive(temp);
        k4.multiplyScalar(this.ep);

        //add up results:
        let total = k1;//scale factor 1
        total.add(k2.multiplyScalar(2));
        total.add(k3.multiplyScalar(2));
        total.add(k4);//scale factor 1
        total.multiplyScalar(1/6);


        //move ahead one step
        return state.clone().updateBy(total);
    }

}











// -------------------------------------------------------------
//some hyperbolic geometry stuff:
// -------------------------------------------------------------



let hypMetricTensor = function(pos){

    let a = pos.x;
    let b = pos.y;

    let sinh2a = Math.sinh(a)*Math.sinh(a);
    let sinh2b = Math.sinh(b)*Math.sinh(b);

    let gaa = 1.;
    let gbb = sinh2a;
    let gcc = sinh2a*sinh2b;

    return new Matrix3().set(
        gaa,0,0,
        0,gbb,0,
        0,0,gcc
    );
}

//take the derivative with the connection of a state (pos, vel)
let hypAcceleration = function(state){
    let pos = state.pos;
    let a = pos.x;
    let b = pos.y;
    let c = pos.z;

    let vel = state.vel;
    let aP = vel.x;
    let bP = vel.y;
    let cP = vel.z;

    let sinh2a = Math.sinh(2.*a);
    let cotha = 1/Math.tanh(a);
    let sin2b = Math.sin(2.*b);
    let sinb = Math.sin(b);
    let cotb = 1./Math.tan(b);

    let aPP = sinh2a/2 * (bP*bP + cP*cP * sinb*sinb);
    let bPP = 1/2*(sin2b*cP*cP-4.*aP*bP * cotha);
    let cPP = -2*(aP*cP*cotha + bP*cP * cotb);

    let acc = new Vector3(aPP, bPP, cPP);
    return acc;
}



let hypDistance = function(pos1, pos2){

    let coshA1 = Math.cosh(pos1.x);
    let sinhA1 = Math.sinh(pos1.x);

    let coshA2 = Math.cosh(pos2.x);
    let sinhA2 = Math.sinh(pos2.x);

    let cosB1 = Math.cos(pos1.y);
    let sinB1 = Math.sin(pos1.y);

    let cosB2 = Math.cos(pos2.y);
    let sinB2 = Math.sin(pos2.y);

    let cosDeltaC = Math.cos(pos1.z-pos2.z);

    let delta = coshA1*coshA2 - sinhA1 * sinhA2 * (cosB1*cosB2 + sinB1*sinB2*(cosDeltaC));
    return Math.acosh(delta);
}


//
// let hypDot = function(state1, state2){
//
//     //assuming the states are at the same position: else throw error
//     if(state1.pos.clone().sub(state2.pos.clone()).length() >0.0001 ){
//         console.log('Error: Dot Product Requires Vectors Based at Same Point')
//     }
//
//     let mat = hypMetricTensor(state1.pos);
//
//     let v1 = state1.vel;
//     let v2 = state2.vel;
//
//     //apply this to the second vector
//     let gv2 = v2.applyMatrix3(mat);
//
//     //compute the dot product:
//     return v1.dot(gv2);
// }



//SHOULD REMOVE DEPENDENCE ON HYPDOT?
//CAN WE DEFINE THIS INSIDE THE GEOMETRY EASIER?
//returns a basis of the tangent space at a given point:
// let hypTangentBasis = function(pos){
//     //metric is diagonal so we can start with Euc vectors and rescale:
//     let b1 = new State(pos, new Vector3(1,0,0));
//     let len1 = Math.sqrt(hypDot(b1,b1));
//     b1.multiplyScalar(1/len1);
//
//     let b2 = new State(pos, new Vector3(0,1,0));
//     let len2 = Math.sqrt(hypDot(b2,b2));
//     b2.multiplyScalar(1/len2);
//
//     let b3 = new State(pos, new Vector3(0,0,1));
//     let len3 = Math.sqrt(hypDot(b3,b3));
//     b3.multiplyScalar(1/len3);
//
//     return [b1,b2,b3];
// }



//
//
// let hypGradient = function(fn, pos){
//
//     let eps =0.001;
//     let basis = hypBasisVectors(pos);
//
//     let differential = new State(pos, new Vector3(0,0,0));
//
//     //add them all up:
//     let df0 = basis[0].dirDeriv(fn);
//     basis[0].multiplyScalar(df0);
//     differential.add(basis[0]);
//
//     let df1 = basis[1].dirDeriv(fn);
//     basis[1].multiplyScalar(df1);
//     differential.add(basis[1]);
//
//     let df2 = basis[2].dirDeriv(fn);
//     basis[2].multiplyScalar(df2);
//     differential.add(basis[2]);
//
//     //now the differential needs to be converted from a covector to a vector
//     //using the hyperbolic metric:
//     let invMetric = hypMetric(pos).invert();
//     differential.vel = differential.vel.applyMatrix3(invMetric);
//     return differential;
// }



//where are the sphere's allowed to go in the geometry: everywhere?
let hypBoundingBox = function(pos){
    //center point of H3 in coordinates:
    let center = new Vector3(0,0,0);
    //distance from center to position
    let dist = hypDistance(pos,center);
    //how far is this from the boundary sphere of radius 5?
    return 3.-dist;
}








let eucMetricTensor = function(pos){
    return new Matrix3().identity();
}

let eucDistance = function(pos1, pos2){
    return pos1.clone().sub(pos2).length()
}

let eucAcceleration = function(state){
    return new Vector3(0,0,0);
}


//where are the sphere's allowed to go in the geometry: everywhere?
let eucBoundingBox = function(pos){
    //center point of H3 in coordinates:
    let center = new Vector3(0,0,0);
    //distance from center to position
    let dist = eucDistance(pos,center);
    //how far is this from the boundary sphere of radius 5?
    return 4.-dist;
}










//the x coordinate is actually distance from the center in our coordinate system!
//makes this function easier :)
//AND makes all the confusion I had earlier about the directional derivatives make sense
//directional derivative of distance from the origin IS just the x-derivative
//so, in coordinates the derivative is just (1,0,0) all the time!
// let boundingBox = function(pos){
//
//     return 3.-pos.x;
// }




class Geometry{
    constructor(distance, metricTensor, acceleration, boundingBox){
        this.acceleration = acceleration;
        this.distance = distance;
        this.metricTensor = metricTensor;
        this.boundingBox = boundingBox;
    }

    covariantDerivative(state){
        let vel = state.vel;
        let acc = this.acceleration(state);
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

    //get a basis for the tangent space
    tangentBasis(pos){
        let b1 = new State(pos, new Vector3(1,0,0));
        let b2 = new State(pos, new Vector3(0,1,0));
        let b3 = new State(pos, new Vector3(0,0,1));
        return [b1,b2,b3];
    }

    gradient(fn,pos){

        //WARNING: IF THE COORDINATE SYSTEM IS SINGULAR: THIS COMPUTATION IS BAD AT THAT POINT!
        //NEED GOOD COORDINATES.....

        let basis = this.tangentBasis(pos);
        let differential = new State(pos, new Vector3(0,0,0));

        //add them all up:
        let df0 = basis[0].dirDeriv(fn);
        basis[0].multiplyScalar(df0);
        differential.add(basis[0]);

        let df1 = basis[1].dirDeriv(fn);
        basis[1].multiplyScalar(df1);
        differential.add(basis[1]);

        let df2 = basis[2].dirDeriv(fn);
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



let hypGeo = new Geometry(
    hypDistance,
    hypMetricTensor,
    hypAcceleration,
    hypBoundingBox,
);

let eucGeo = new Geometry(
    eucDistance,
    eucMetricTensor,
    eucAcceleration,
    eucBoundingBox
);


let ambientSpace = eucGeo;


//---------------------------------
// a class for building simulations
//---------------------------------


//states are a DataList (an array with the added methods of clone, add, multiplyScalar, sub...)
//masses and radii are normal arrays
//bounding box is a function from position to reals, telling us where balls need to stop!

//requires an ambient space to be defined OUTSIDE of the class, and NAMED AMBIENT SPACE
//to make this work: annoying! When I feed in a geometry class as an argument, it has trouble producing
//functions on the fly...idk why.

class Simulation{
    constructor(states, masses, radii){

        //store the input data
        this.states = states;
        this.masses = masses;
        this.radii = radii;

        //to set when intersecting
        this.ballCollisionIndices=null;
        this.boundaryCollisionIndex=null;

        //build an integrator
        let ep = 0.01;
        //get the function which takes the derivative of each element of a stateList:
        let derive = function(st){
            let res = [];
            for( let i=0; i<st.length; i++){
               res.push(ambientSpace.covariantDerivative(st[i]));
            }
            return new DataList(res);
        }

        this.integrator = new RungeKutta(derive,ep);

    }

    //state1 and state2 are each a state of the entire system:
    kineticMetric(states1,states2){
        let K=0;
        for( let i=0; i<states1.length; i++){
            K += 0.5 * this.masses[i] * ambientSpace.dot(states1[i],states2[i]);
        }
        return K;
    }

    //check if the current states intersect or not
    detectCollision(){

        //set off the default reporting of no collisions:
        this.ballCollisionIndices=null;
        this.boundaryCollisionIndex=null;


        //check if any ball collided with the boundary:
        for( let i=0; i<this.states.length; i++){
            let posi = this.states[i].pos.clone();
            let radi = this.radii[i];

            let dist = ambientSpace.boundingBox(posi)
            if(dist-radi<0.){
                this.boundaryCollisionIndex=i;

                console.log('boundary collision detected');
                return true;
            }
        }


        //check if any two balls collided with one another:
        let posi, posj, radi, radj;
        for( let i=1; i<this.states.length; i++){

            posi = this.states[i].pos;
            radi = this.radii[i];

            for( let j=0; j<i; j++){
                posj = this.states[j].pos;
                radj = this.radii[j];

                let dist = ambientSpace.distance(posi,posj);
                let radiiSum = radi+radj

                if(dist<radiiSum){
                    //return the pair of indices of balls that are colliding:
                    this.ballCollisionIndices=[i,j];
                    console.log('ball-on-ball collision detected');
                    console.log(this.ballCollisionIndices);
                    return true;
                }
            }
        }

        console.log('no collisions');
        return false;
    }

    //run smooth dynamics for each of the bodies involved:
    smoothDynamics(){
        this.states = this.integrator.step(this.states);
    }


    //get the Riemannian gradient (wrt the kinetic energy metric)
    // of the overall signed distance function at the given point
    getDistGradient(){

        //don't need to compute the gradient of all pairs of distance functions: almost all are zero!
        let grad = this.states.clone();

        for(let n=0; n<this.states.length; n++){
            //not sure this is updating them all to zero....
            grad[n].vel=new Vector3(0,0,0);
        }

        // //if a ball impacted the boundary
        if(this.boundaryCollisionIndex != null){

            //just need the ones involving i and j:
            let i = this.boundaryCollisionIndex;
            let posi = this.states[i].pos.clone();

            //take gradient of boundary distance based at posi:
            let gradi = ambientSpace.gradient(ambientSpace.boundingBox, posi);

            //replace this gradient with its correct nonzero version in the list
           // grad.splice(i, 1, gradi);
            grad[i] = gradi;
        }

        //if two balls collided
        if( this.ballCollisionIndices != null ) {

            //just need the ones involving i and j:
            let i = this.ballCollisionIndices[0];
            let j = this.ballCollisionIndices[1];
            let posi = this.states[i].pos.clone();
            let posj = this.states[j].pos.clone();

            //for i: we fix particle-j and take the gradient
            let disti = function (pos) {
                return ambientSpace.distance(pos, posj);
            }

            //now find the gradient at posi:
            let gradi = ambientSpace.gradient(disti, posi);

            //do same for j
            let distj = function (pos) {
                return ambientSpace.distance(pos, posi);
            }

            let gradj = ambientSpace.gradient(distj, posj);

            //replace these two gradients with their correct nonzero versions
            grad[i] = gradi;
            grad[j] = gradj;

            console.log(gradi);
            console.log(gradj);

        }



        return grad;

    }


    //re-set the vectors at the collision point before resuming smooth dynamics:
    collisionDynamics(){

        //compute the gradient vector
        //this automatically takes care of whether we are having a ball collision or a boundary
        //collision: the math doesn't care!
        let grad = this.getDistGradient();

        //find its length, projection of states vector onto it
        let gradLen2 = this.kineticMetric(grad,grad);
        let dot = this.kineticMetric(this.states,grad);

        //this gives the coefficient for reflection
        let coef = 2.*dot/gradLen2;

        //now get the new vector using the reflection law!
        //this automatically sets it as "this.states"
        this.states.sub(grad.multiplyScalar(coef));
    }


    //step forward in time
    step(){

        //get the points of collision, if there are any
        let collide = this.detectCollision();

        if( collide ){
            this.collisionDynamics();
        }

        //then after they've been resolved, run smooth dynamics
        this.smoothDynamics();
    }
}











class Trajectory{
    constructor(iniPos, radius, color, trailLength){
        this.pos = iniPos;
        this.radius = radius;

        this.trailLength = trailLength;
        this.trail = [];
        for(let i=0;i<this.trailLength;i++){
            this.trail.push(this.pos);
        }

        const planetMaterial = new MeshPhysicalMaterial(
            {
                color: color,
                clearcoat: 1,
            }
        );
        const planetGeometry = new SphereBufferGeometry(this.radius,32,16);
        this.planetMesh = new Mesh(planetGeometry, planetMaterial);
        this.planetMesh.position.set(this.pos.x,this.pos.y,this.pos.z);


        const trailMaterial = new MeshPhysicalMaterial(
            {
                clearcoat:0.5,
                clearcoatRoughness: 0,

                side: DoubleSide,
                color: color,
            }
        );

        let trailCurve = new CatmullRomCurve3(this.trail);
        let trailGeometry = new TubeBufferGeometry(trailCurve,this.trailLength,0.15*this.radius,8);
        this.trailMesh=new Mesh(trailGeometry, trailMaterial);

    }



    addToScene( scene ){
        scene.add(this.planetMesh);
        scene.add(this.trailMesh);
    }

    updatePos(pos){
        this.pos=pos;
        this.planetMesh.position.set(this.pos.x,this.pos.y,this.pos.z);

        //add pos to the trail, and pop off the earliest element
        this.trail.pop();
        this.trail.unshift(this.pos);
    }

    redrawTrail(){
        this.trailMesh.geometry.dispose();
        const curve = new CatmullRomCurve3(this.trail);
        this.trailMesh.geometry=new TubeBufferGeometry(curve,this.trailLength,0.15*this.radius,8);
    }

}


















//take in a simulation and render to the screen a colleciton of balls:
//projection is a map (center,radius) -> (center, radius) from coordinates to what we want to see in Euclidean space

class Visualize{
   constructor(simulation, projection, boundaryGeom) {

       this.N = simulation.states.length;
       this.trailLength = 200.;
       this.simulation = simulation;
       this.projection = projection;

       let physMat = new MeshPhysicalMaterial({
           clearcoat:0.3,
           transmission:0.99,
           ior:1.,
       });
       this.boundary = new Mesh(boundaryGeom,physMat);

       //make a default ball for each
       this.balls = [];
       for(let i=0; i<this.N; i++){

            let pos = this.simulation.states[i].pos.clone();
            let center = this.projection(pos);

           this.balls.push(new Trajectory(center, this.simulation.radii[i], 0xffffff, this.trailLength));
       }


   }


   updateBalls(){
       for(let i=0; i<this.N; i++){

            let pos = this.simulation.states[i].pos.clone();
            let center = this.projection(pos);

            this.balls[i].updatePos(center);
            this.balls[i].redrawTrail();
       }
   }


   addToScene(scene){
        for(let i=0; i<this.N; i++){
            this.balls[i].addToScene(scene);
        }
        scene.add(this.boundary);
   }

   addToUI(ui){

   }

   tick(time,dTime){
       this.simulation.step();
       this.updateBalls();
   }

}




function getRandom(min, max) {
    return Math.random() * (max - min) + min;
}

function randomVector3(rng){
    let x = getRandom(-rng,rng);
    let y = getRandom(-rng,rng);
    let z = getRandom(-rng,rng);
    return new Vector3(x,y,z);
}


let stateList = [];
let radii = [];
let masses = [];
for(let i=0; i<40; i++){
    let pos = randomVector3(2);
    let vel = randomVector3(1);
    stateList.push(new State(pos,vel));
    let r = 0.3*Math.random();
    let m = r*r*r;
    radii.push(r);
    masses.push(m);
}
let states = new DataList(stateList );


let sim = new Simulation(states, masses, radii);

sim.integrator.step(sim.states);
sim.step();




let proj = function(coords){

    return coords;

    //
    // let a = coords.x;
    // let b = coords.y;
    // let c = coords.z;
    //
    // let sinha = Math.sinh(a);
    // let cosha = Math.cosh(a);
    // let sinb = Math.sin(b);
    // let cosb = Math.cos(b);
    // let sinc = Math.sin(c);
    // let cosc = Math.cos(c);
    //
    // let x = sinha * sinb * cosc;
    // let y = sinha * sinb * sinc;
    // let z = sinha * cosb;
    // let w = cosha;
    //
    // let scale = 3./(1+w);
    //
    // return new Vector3(x,y,z).multiplyScalar(scale);
}


const boundaryGeom = new SphereBufferGeometry(4,64,32);

let viz = new Visualize(sim, proj, boundaryGeom);

export default viz;