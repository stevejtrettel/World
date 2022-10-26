import {
    Vector3,
    Matrix3,
    SphereBufferGeometry,
    MeshNormalMaterial,
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
        let eps = 0.001;

        let pos1 = this.clone().flow(-eps/2.).pos;
        let pos2 = this.clone().flow(eps/2.).pos;

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


//base class for a numerical integrator to be extended
class Integrator {
    constructor (derive, ep){
        this.derive=derive;
        this.ep=ep;
    }

    derive( state ){ }

    step( state ) { }

}

class RungeKutta extends Integrator {

    constructor(derive,ep){
        super(derive,ep);
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

//take the derivative with the connection of a state (pos, vel)
//return the corresponding (vel, acc)
let hypCovariantDerivative = function(state){
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

    return new dState(vel,acc);
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



let hypMetric = function(pos){

    let a = pos.x;
    let b = pos.y;

    let sinh2a = Math.sinh(a)*Math.sinh(a);
    let sinh2b = Math.sinh(b)*Math.sinh(b);

    let gaa = 1.;
    let gbb = sinh2a;
    let gcc = sinh2a*sinh2b;

    return new Matrix3(
        gaa,0,0,
        0,gbb,0,
        0,0,gcc
    );
}



let hypDot = function(state1, state2){
    //assuming the states are at the same position: else throw error
    if(state1.pos !== state2.pos ){
        console.log('Error: Dot Product Requires Vectors Based at Same Point')
    }

    let mat = hypMetric(state1.pos);

    let v1 = state1.vel;
    let v2 = state2.vel;

    //apply this to the second vector
    let gv2 = v2.applyMatrix3(mat);

    //compute the dot product:
    return v1.dot(gv2);
}


//returns a basis of the tangent space at a given point:
let hypBasisVectors = function(pos){
    //metric is diagonal so we can start with Euc vectors and rescale:
    let b1 = new State(pos, new Vector3(1,0,0));
    let len1 = Math.sqrt(hypDot(b1,b1));
    b1.multiplyScalar(1/len1);

    let b2 = new State(pos, new Vector3(0,1,0));
    let len2 = Math.sqrt(hypDot(b2,b2));
    b2.multiplyScalar(1/len2);

    let b3 = new State(pos, new Vector3(0,0,1));
    let len3 = Math.sqrt(hypDot(b3,b3));
    b1.multiplyScalar(1/len3);

    return [b1,b2,b3];
}





let hypGradient = function(fn, state){

    let eps =0.001;
    let basis = hypBasisVectors(state.pos);

    let differential = new Vector3(0,0,0);

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
    let metric = hypMetric(state.pos);
    let invMetric = new Matrix3();
    invMetric.getInverse(metric);

    let gradient = differential.applyMatrix3(invMetric);
    return gradient;
}





//---------------------------------
// a class for building simulations
//---------------------------------


//states are a DataList (an array with the added methods of clone, add, multiplyScalar, sub...)
//masses and radii are normal arrays

class Simulation{
    constructor(states, masses, radii){

        //store the input data
        this.states = states;
        this.masses = masses;
        this.radii = radii;



        //build an integrator
        let ep = 0.01;
        //get the function which takes the derivative of each element of a stateList:
        let derive = function(states){
            let res = [];
            for( let i=0; i<states.length; i++){
               res.push(hypCovariantDerivative(states[i]));
            }
            return new DataList(res);
        }
        //console.log(derive(this.states));

        this.integrator = new RungeKutta(derive,ep);

    }

    //state1 and state2 are each a state of the entire system:
    kineticMetric(states1,states2){
        let K=0;
        for( let i=0; i<states1.length; i++){
            K += 0.5 * this.masses[i] * hypDot(states1[i],states2[i]);
        }
        return K;
    }

    //check if the current states intersect or not:
    //RIGHT NOW WRITTEN FOR THE SPECIAL CASE OF TWO BODIES!
    intersect(){

        let pos1 = this.states[0].pos;
        let pos2 = this.states[1].pos;

        let dist = hypDistance(pos1,pos2);
        let radiiSum = this.radii[0]+this.radii[1];

        //return true if they intersect, false if they dont
        return dist < radiiSum;
    }

    //run smooth dynamics for each of the bodies involved:
    smoothDynamics(){
        this.states = this.integrator.step(this.states);
        //console.log(this.states[0].pos);
    }


    //get the Riemannian gradient (wrt the kinetic energy metric)
    // of the overall signed distance function at the given point
    getDistGradient(){
        let grad;
        console.log('need the gradient');
        return grad;
    }


    //re-set the vectors at the collision point before resuming smooth dynamics:
    collisionDynamics(){

        //compute the gradient vector
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
        if(this.intersect()){
            this.collisionDynamics();
        }
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
       this.trailLength = 100.;
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

















function randomVector3(){
    let x = Math.random();
    let y = Math.random();
    let z = Math.random();
    return new Vector3(x,y,z);
}


let stateList = [];
let radii = [];
let masses = [];
for(let i=0; i<10; i++){
    let pos = randomVector3();
    let vel = randomVector3();
    stateList.push(new State(pos,vel));
    let r = 0.1*Math.random();
    let m = r*r*r;
    radii.push(r);
    masses.push(m);
}
let states = new DataList(stateList );


let sim = new Simulation(states, masses, radii);

sim.integrator.step(sim.states);
sim.step();




let proj = function(coords){
    let a = coords.x;
    let b = coords.y;
    let c = coords.z;

    let sinha = Math.sinh(a);
    let cosha = Math.cosh(a);
    let sinb = Math.sin(b);
    let cosb = Math.cos(b);
    let sinc = Math.sin(c);
    let cosc = Math.cos(c);

    let x = sinha * sinb * cosc;
    let y = sinha * sinb * sinc;
    let z = sinha * cosb;
    let w = cosha;

    let scale = 3./(1+w);

    return new Vector3(x,y,z).multiplyScalar(scale);
}


const boundaryGeom = new SphereBufferGeometry(3,64,32);


let viz = new Visualize(sim, proj, boundaryGeom);



export default {viz};