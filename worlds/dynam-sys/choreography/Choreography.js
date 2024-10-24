import {
    CatmullRomCurve3,
    MeshPhysicalMaterial,
    TubeGeometry,
    Vector3,
    Mesh,
    DoubleSide,
} from "../../../3party/three/build/three.module.js";

import {ThreeBody,ThreeBodyDState,ThreeBodyState} from "./ThreeBody.js";
import {BallTrail} from "../../../code/items/basic-shapes/BallTrail.js";
import {RungeKutta} from "../../../code/compute/cpu/RungeKutta.js";
import SymplecticIntegrator from "../../../code/compute/cpu/SymplecticIntegrator.js";


//the gravitational force felt by mass 1 from mass 2
function gravForce(pos1, mass1, pos2, mass2){
    //vector from mass1 to mass2: the force points at the second mass
    let relPos = pos2.clone().sub(pos1);

    let r2 = relPos.lengthSq();
    let dir = relPos.normalize();

    let force = dir.multiplyScalar(mass1*mass2/r2);
    return force;
}


//set up the derivative of a state for the 3 body problem
let derive = ( state ) => {

    let vel = state.vel;

    let forceAB=gravForce(state.pos.a, state.mass.a, state.pos.b, state.mass.b);
    let forceAC=gravForce(state.pos.a, state.mass.a, state.pos.c, state.mass.c);
    let forceBC=gravForce(state.pos.b, state.mass.b, state.pos.c, state.mass.c);

    let forceA = forceAB.clone().add(forceAC);
    let forceB = forceAB.clone().multiplyScalar(-1).add(forceBC);
    let forceC = forceAC.clone().multiplyScalar(-1).sub(forceBC);

    //want accelerations not forces
    let acc = new ThreeBody(
        forceA.multiplyScalar(1/state.mass.a),
        forceB.multiplyScalar(1/state.mass.b),
        forceC.multiplyScalar(1/state.mass.c)
    );

    return new ThreeBodyDState( vel, acc );
};





class Choreography{

    constructor(params) {

        //set the initial condition from parameters
        this.setIniCond(params);

        //set up the integrator
        this.NSteps = 20000;
        const ep= this.T/this.NSteps;
        this.integrator= new SymplecticIntegrator(derive, ep);

        //compute the curve
        this.compute();


        //draw the tube around computed curve
       // let res  = 512*this.T;
        let geom = new TubeGeometry(this.curve,1500,0.02,8,false);
        let mat = new MeshPhysicalMaterial({
            side:DoubleSide,
            clearcoat:1,
        });
        this.trajectory = new Mesh(geom, mat);


        //draw the balls that move on it
        let len = 50;
        let rad = 0.15;

        this.a = new BallTrail(this.curve.getPoint(0),rad,0xffffff,len);
        this.b = new BallTrail(this.curve.getPoint(2/3),rad,0xd96493,len);
        this.c = new BallTrail(this.curve.getPoint(1/3),rad,0x32a852,len);

    }


    setIniCond(params){


        //rescale the problem:
        let scaleFactor = 8;
        let massScaleFactor = scaleFactor*scaleFactor*scaleFactor;
        let timeScaleFactor = 1;

        //params = [c1,c2,c3,c4]
        let c1 = params[0]*scaleFactor;
        let c2 = params[1]*scaleFactor;
        let c3 = params[2]*scaleFactor;
        let c4 = params[3]*scaleFactor;


        //one third the time interval of the curve
        this.T = params[4]*timeScaleFactor;


        let mass = {
            a: massScaleFactor/3,
            b: massScaleFactor/3,
            c: massScaleFactor/3,
        };

        let pos = new ThreeBody(
            new Vector3(-2*c1,0,0),
            new Vector3(c1, c2, 0),
            new Vector3(c1,-c2, 0)
        );

        let vel = new ThreeBody(
            new Vector3(0,-2*c4,0),
            new Vector3(c3,c4,0),
            new Vector3(-c3,c4,0),
         );

        this.state = new ThreeBodyState(mass, pos,vel);

    }



    compute(){

        //compute the curve
        let A = [];
        let B = [];
        let C = [];


        //how many integrations to do before laying down a point
        let skipInterval = 20;

        for(let i=0; i<this.NSteps/skipInterval; i++ ){
            for(let j=0;j<skipInterval;j++) {
                this.state = this.integrator.step(this.state);
            }

            A.push(this.state.pos.a);
            B.push(this.state.pos.b);
            C.push(this.state.pos.c);
        }

        let pts = A.concat(C).concat(B);

        this.curve = new CatmullRomCurve3(pts);

    }


    addToScene(scene){
        scene.add(this.trajectory);
        this.a.addToScene(scene);
        this.b.addToScene(scene);
        this.c.addToScene(scene);
    }


    addToUI(ui){}


    tick(time,dTime){

        let tA = (time/10) % 1;
        let tB = (time/10+2/3) % 1;
        let tC = (time/10+1/3) % 1;

        let pA = this.curve.getPoint(tA);
        let pB = this.curve.getPoint(tB);
        let pC = this.curve.getPoint(tC);

        this.a.updatePos(pA);
        this.b.updatePos(pB);
        this.c.updatePos(pC);

        this.a.redrawTrail();
        this.b.redrawTrail();
        this.c.redrawTrail();
    }

}


export default Choreography;
