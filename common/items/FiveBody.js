import {
    Vector3,
    MeshPhysicalMaterial,
    SphereBufferGeometry,
    Mesh, TubeBufferGeometry, CatmullRomCurve3, DoubleSide,
} from "../../3party/three/build/three.module.js";

import {
    State,
    dState,
} from "../compute/cpu/components/State.js";

import {RungeKutta} from "../compute/cpu/RungeKutta.js";

import{
    randomVec3Ball,
    randomVec3Sphere
} from "../utils/math/random.js";

import{ gravForce} from "../utils/math/gravity.js";

import Planet from "../components/basic-shapes/Planet.js";


//store position, velocity, or acceleration for three bodies
//need to be able to implement add, sub, multiplyScalar, clonje
class FiveBodyData{
    constructor(dataA, dataB, dataC,dataD, dataE){
        this.a=dataA;
        this.b=dataB;
        this.c=dataC;
        this.d=dataD;
        this.e=dataE;
    }

    add( dat ){
        this.a.add(dat.a);
        this.b.add(dat.b);
        this.c.add(dat.c);
        this.d.add(dat.d);
        this.e.add(dat.e);
        return this;
    }

    sub( dat ){
        this.a.sub(dat.a);
        this.b.sub(dat.b);
        this.c.sub(dat.c);
        this.d.sub(dat.d);
        this.e.sub(dat.e);
        return this;
    }

    multiplyScalar( k ){
        this.a.multiplyScalar(k);
        this.b.multiplyScalar(k);
        this.c.multiplyScalar(k);
        this.d.multiplyScalar(k);
        this.e.multiplyScalar(k);
    }

    clone(){
        return new FiveBodyData(
            this.a.clone(),
            this.b.clone(),
            this.c.clone(),
            this.d.clone(),
            this.e.clone()
        );
    }

}



class FiveBody{

    constructor(a,b,c,d,e){

        this.speed=0.3;

        //set up the planets
        this.a = new Planet(a);
        this.b = new Planet(b);
        this.c = new Planet(c);
        this.d = new Planet(d);
        this.e = new Planet(e);

        //set up the state in state space
        let pos = new FiveBodyData(this.a.pos,this.b.pos,this.c.pos,this.d.pos,this.e.pos);
        let vel = new FiveBodyData(this.a.vel,this.b.vel,this.c.vel,this.d.vel,this.e.vel);
        this.state=new State(pos,vel);


        //set up the derivative of a state:
        let accel = ( state ) => {

            let forceAB=gravForce(state.pos.a, this.a.mass, state.pos.b, this.b.mass);
            let forceAC=gravForce(state.pos.a, this.a.mass, state.pos.c, this.c.mass);
            let forceAD=gravForce(state.pos.a, this.a.mass, state.pos.d, this.d.mass);
            let forceAE=gravForce(state.pos.a, this.a.mass, state.pos.e, this.e.mass);

            let forceBC=gravForce(state.pos.b, this.b.mass, state.pos.c, this.c.mass);
            let forceBD=gravForce(state.pos.b, this.b.mass, state.pos.d, this.d.mass);
            let forceBE=gravForce(state.pos.b, this.b.mass, state.pos.e, this.e.mass);

            let forceCD=gravForce(state.pos.c, this.c.mass, state.pos.d, this.d.mass);
            let forceCE=gravForce(state.pos.c, this.c.mass, state.pos.e, this.e.mass);

            let forceDE=gravForce(state.pos.d, this.d.mass, state.pos.e, this.e.mass);

            let forceA = new Vector3().add(forceAB).add(forceAC).add(forceAD).add(forceAE);
            let forceB = new Vector3().add(forceAB.clone().multiplyScalar(-1)).add(forceBC).add(forceBD).add(forceBE);
            let forceC = new Vector3().add(forceAC.clone().multiplyScalar(-1)).add(forceBC.clone().multiplyScalar(-1)).add(forceCD).add(forceCE);
            let forceD = new Vector3().add(forceAD.clone().multiplyScalar(-1)).add(forceBD.clone().multiplyScalar(-1)).add(forceCD.clone().multiplyScalar(-1)).add(forceDE);
            let forceE = new Vector3().add(forceAE.clone().multiplyScalar(-1)).add(forceBE.clone().multiplyScalar(-1)).add(forceCE.clone().multiplyScalar(-1)).add(forceDE.clone().multiplyScalar(-1));

            let acc = new FiveBodyData(
                forceA.multiplyScalar(1/this.a.mass),
                forceB.multiplyScalar(1/this.b.mass),
                forceC.multiplyScalar(1/this.c.mass),
                forceD.multiplyScalar(1/this.d.mass),
                forceE.multiplyScalar(1/this.e.mass)
            );

            return acc;
        };


        this.derive = ( state ) => {
            let vel = state.vel;
            let acc = accel( state );
            return new dState( vel, acc );
        };

        const ep=0.005;
        this.integrator= new RungeKutta(this.derive, ep);

    }


    //need to update this still - this is threebody!
    detectCollision(){
        let ab = this.a.pos.distanceTo(this.b.pos);
        let ac = this.a.pos.distanceTo(this.c.pos);
        let bc = this.b.pos.distanceTo(this.c.pos);
        let rescale = 0.01;

        if(ab<rescale*(this.a.radius+this.b.radius)){
            return true;
        }
        if(ac<rescale*(this.a.radius+this.c.radius)){
            return true;
        }
        if(bc<rescale*(this.b.radius+this.c.radius)){
            return true;
        }
        return false;
    }

    addToScene( scene ){
        this.a.addToScene( scene );
        this.b.addToScene( scene );
        this.c.addToScene( scene );
        this.d.addToScene( scene );
        this.e.addToScene( scene );
    }

    addToUI( ui ){

        let massFolder = ui.addFolder('Masses');

        let ThreeB = this;
        let planetA=this.a;
        let planetB=this.b;
        let planetC=this.c;
        let planetD=this.d;
        let planetE=this.e;

        let params = {
            massA:planetA.mass,
            massB:planetB.mass,
            massC:planetC.mass,
            massD:planetD.mass,
            massE:planetE.mass,
            speed:ThreeB.speed,

            reset: function()
            {
                planetA.reset();
                planetB.reset();
                planetC.reset();
                planetD.reset();
                planetE.reset();

                //set up the state in state space
                let pos = new FiveBodyData(planetA.pos,planetB.pos,planetC.pos,planetD.pos,planetE.pos);
                let vel = new FiveBodyData(planetA.vel,planetB.vel,planetC.vel,planetD.vel,planetE.vel);
                ThreeB.state=new State(pos,vel);
            },

        }



        massFolder.add(params, 'massA', 0.01, 5, 0.01).name('a').onChange(function(value){
            planetA.setMass(value);
        });


        massFolder.add(params, 'massB', 0.01, 5, 0.01).name('b').onChange(function(value){
            planetB.setMass(value);
        });


        massFolder.add(params, 'massC', 0.01, 5, 0.01).name('c').onChange(function(value){
            planetC.setMass(value);
        });

        massFolder.add(params, 'massD', 0.01, 5, 0.01).name('d').onChange(function(value){
            planetD.setMass(value);
        });


        massFolder.add(params, 'massE', 0.01, 5, 0.01).name('e').onChange(function(value){
            planetE.setMass(value);
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
        this.c.updatePos(newPos.c);
        this.d.updatePos(newPos.d);
        this.e.updatePos(newPos.e);

        this.a.redrawTrail();
        this.b.redrawTrail();
        this.c.redrawTrail();
        this.d.redrawTrail();
        this.e.redrawTrail();
    }

    tick(time,dTime){
        if(!this.detectCollision()) {
            this.update();
        }
    }

}









//actually building one of these
const pA = {
    mass:2,
    pos: new Vector3(5,30,0),
    vel: new Vector3(0,0,-0.25),
    color: 0xffffff,
    trailLength: 2000,
}

const pB = {
    mass:2,
    pos: new Vector3(-5,30,0),
    vel: new Vector3(0,0,0.25),
    color: 0xd96493,
    trailLength: 2000,
}

const pC = {
    mass:0.5,
    pos: new Vector3(11,0,0),
    vel: new Vector3(0,0,0),
    color: 0x32a852,
    trailLength: 2000,
}

const pD = {
    mass:2,
    pos: new Vector3(0,-30,2),
    vel: new Vector3(-1,0,0),
    color: 0xb88c40,
    trailLength: 2000,
}

const pE = {
    mass:2,
    pos: new Vector3(0,-30,-2),
    vel: new Vector3(1,0,0),
    color: 0x4a2a5c,
    trailLength: 2000,
}

const example = new FiveBody(pA, pB, pC, pD, pE);

// export {
//     FiveBody
// };

export default example;
