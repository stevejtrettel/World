import {
    Vector3,
    MeshPhysicalMaterial,
    SphereGeometry,
    Mesh, TubeGeometry, CatmullRomCurve3, DoubleSide,
} from "../../../3party/three/build/three.module.js";

import {
    State,
    dState,
} from "../../compute/cpu/components/State.js";

import {
    RungeKutta
} from "../../compute/cpu/RungeKutta.js";

import{
    randomVec3Ball,
    randomVec3Sphere
} from "../../utils/math/random.js";

import{ gravForce} from "../../utils/math/gravity.js";

import Planet from "../../components/basic-shapes/Planet.js";


//store position, velocity, or acceleration for three bodies
//need to be able to implement add, sub, multiplyScalar, clonje
class TwoBodyData{
    constructor(dataA, dataB){
        this.a=dataA;
        this.b=dataB;
    }

    add( dat ){
        this.a.add(dat.a);
        this.b.add(dat.b);
        return this;
    }

    sub( dat ){
        this.a.sub(dat.a);
        this.b.sub(dat.b);
        return this;
    }

    multiplyScalar( k ){
        this.a.multiplyScalar(k);
        this.b.multiplyScalar(k);
    }

    clone(){
        return new TwoBodyData(
            this.a.clone(),
            this.b.clone(),
        );
    }

}



class TwoBody{

    constructor(a,b){

        this.speed=0.3;

        //set up the planets
        this.a = new Planet(a);
        this.b = new Planet(b);

        //set up the state in state space
        let pos = new TwoBodyData(this.a.pos,this.b.pos);
        let vel = new TwoBodyData(this.a.vel,this.b.vel);
        this.state=new State(pos,vel);

        //set up the derivative of a state:
        let accel = ( state ) => {

            let forceAB=gravForce(state.pos.a, this.a.mass, state.pos.b, this.b.mass);

            let forceA = forceAB;
            let forceB = forceAB.clone().multiplyScalar(-1);

            let acc = new TwoBodyData(
                forceA.multiplyScalar(1/this.a.mass),
                forceB.multiplyScalar(1/this.b.mass),
            );

            return acc;
        };


        this.derive = ( state ) => {
            let vel = state.vel;
            let acc = accel( state );
            return new dState( vel, acc );
        };

        const ep=0.002;
        this.integrator= new RungeKutta(this.derive, ep);

    }

    detectCollision(){
        let ab = this.a.pos.distanceTo(this.b.pos);
        let rescale = 0.2;

        if(ab<rescale*(this.a.radius+this.b.radius)){
            return true;
        }
        return false;
    }

    addToScene( scene ){
        this.a.addToScene( scene );
        this.b.addToScene( scene );
    }

    addToUI( ui ){

        let massFolder = ui.addFolder('Masses');
        let ThreeB = this;
        let planetA=this.a;
        let planetB=this.b;

        let params = {
            massA:planetA.mass,
            massB:planetB.mass,
            speed:ThreeB.speed,

            reset: function()
            {
                planetA.reset(0.,0.);
                planetB.reset(5,2);
                //planetB.resetTrail();
                //planetB.vel = planetA.vel.clone().multiplyScalar(-planetA.mass/planetB.mass);

                //set up the state in state space
                let pos = new TwoBodyData(planetA.pos,planetB.pos);
                let vel = new TwoBodyData(planetA.vel,planetB.vel);
                ThreeB.state=new State(pos,vel);
            },
        }



        massFolder.add(params, 'massA', 0.01, 5, 0.01).name('a').onChange(function(value){
            planetA.setMass(value);
        });


        massFolder.add(params, 'massB', 0.01, 5, 0.01).name('b').onChange(function(value){
            planetB.setMass(value);
        });


        ui.add(params, 'speed', 0.01,1,0.01).name('Speed').onChange(function(value){
            ThreeB.speed=value;
        });


        ui.add(params, 'reset');

    }

    update(){
        for(let i=0;i<200.*this.speed;i++) {
            this.state = this.integrator.step(this.state);
        }

        const newPos = this.state.pos;

        this.a.updatePos(newPos.a);
        this.b.updatePos(newPos.b);

        this.a.redrawTrail();
        this.b.redrawTrail();
    }

    tick(time,dTime){
        if(!this.detectCollision()) {
            this.update();
        }
    }

}







export default TwoBody;
