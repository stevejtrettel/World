
import {
    State,
    dState,
} from "../../../code/compute/cpu/components/State.js";

import {
    RungeKutta
} from "../../../code/compute/cpu/RungeKutta.js";



// import{ gravForce} from "../../../code/utils/math/gravity.js";

import Planet from "../../../code/items/basic-shapes/Planet.js";



function gravForce(pos1, mass1, pos2, mass2){
    let relPos = pos2.clone().sub(pos1);
    let r2 = relPos.lengthSq();
    let dir = relPos.normalize();

    let force = dir.multiplyScalar(mass1*mass2/r2);
    return force;
}



//store position, velocity, or acceleration for three bodies
//need to be able to implement add, sub, multiplyScalar, clonje
class ThreeBodyData{
    constructor(dataA, dataB, dataC){
        this.a=dataA;
        this.b=dataB;
        this.c=dataC;
    }

    add( dat ){
        this.a.add(dat.a);
        this.b.add(dat.b);
        this.c.add(dat.c);
        return this;
    }

    sub( dat ){
        this.a.sub(dat.a);
        this.b.sub(dat.b);
        this.c.sub(dat.c);
        return this;
    }

    multiplyScalar( k ){
        this.a.multiplyScalar(k);
        this.b.multiplyScalar(k);
        this.c.multiplyScalar(k);
    }

    clone(){
        return new ThreeBodyData(
            this.a.clone(),
            this.b.clone(),
            this.c.clone()
        );
    }

}



class ThreeBody{

    constructor(a,b,c){

        this.speed=0.3;

        //set up the planets
        this.a = new Planet(a);
        this.b = new Planet(b);
        this.c = new Planet(c);

        //set up the state in state space
        let pos = new ThreeBodyData(this.a.pos,this.b.pos,this.c.pos);
        let vel = new ThreeBodyData(this.a.vel,this.b.vel,this.c.vel);
        this.state=new State(pos,vel);


        //set up the derivative of a state:
        let accel = ( state ) => {

            let forceAB=gravForce(state.pos.a, this.a.mass, state.pos.b, this.b.mass);
            let forceAC=gravForce(state.pos.a, this.a.mass, state.pos.c, this.c.mass);
            let forceBC=gravForce(state.pos.b, this.b.mass, state.pos.c, this.c.mass);

            let forceA = forceAB.clone().add(forceAC);
            let forceB = forceAB.clone().multiplyScalar(-1).add(forceBC);
            let forceC = forceAC.clone().multiplyScalar(-1).sub(forceBC);
            let acc = new ThreeBodyData(
                forceA.multiplyScalar(1/this.a.mass),
                forceB.multiplyScalar(1/this.b.mass),
                forceC.multiplyScalar(1/this.c.mass)
            );

            return acc;
        };


        this.derive = ( state ) => {
            let vel = state.vel;
            let acc = accel( state );
            return new dState( vel, acc );
        };

        const ep=0.003;
        this.integrator= new RungeKutta(this.derive, ep);


        //variables to remember planet initial conditions:
        this.stateA = new State(this.a.pos.clone(),this.a.vel.clone());
        this.stateB = new State(this.b.pos.clone(),this.b.vel.clone());
        this.stateC = new State(this.c.pos.clone(),this.c.vel.clone());

    }

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
    }

    addToUI( ui ){

        let massFolder = ui.addFolder('Masses');
        //console.log('made it');
        let ThreeB = this;
        let planetA=this.a;
        let planetB=this.b;
        let planetC=this.c;

        let params = {
            massA:planetA.mass,
            massB:planetB.mass,
            massC:planetC.mass,
            speed:ThreeB.speed,

            reset: function()
            {


                planetA.reset();
                planetB.reset();
                // //rig it up so that the center of mass is at the origin, when choosing planetC position
                //  let com = planetA.pos.clone().multiplyScalar(planetA.mass);
                //  com.add(planetB.pos.clone().multiplyScalar(planetB.mass));
                //  planetC.pos = com.multiplyScalar(-1/planetC.mass);
                //  planetC.resetTrail();
                // // //rig it up so that there is no velocity about the center of mass:
                //  let totVel = planetA.vel.clone().add(planetB.vel);
                //  planetC.vel = totVel.multiplyScalar(-1);
                planetC.reset();


                ThreeB.stateA = new State(planetA.pos.clone(), planetA.vel.clone());
                ThreeB.stateB = new State(planetB.pos.clone(), planetB.vel.clone());
                ThreeB.stateB = new State(planetC.pos.clone(), planetC.vel.clone());

                //set up the state in state space
                let pos = new ThreeBodyData(planetA.pos,planetB.pos,planetC.pos);
                let vel = new ThreeBodyData(planetA.vel,planetB.vel,planetC.vel);
                ThreeB.state=new State(pos,vel);
            },

            replay: function()
            {
                planetA.pos = ThreeB.stateA.pos.clone();
                planetA.vel = ThreeB.stateA.vel.clone();

                planetB.pos = ThreeB.stateB.pos.clone();
                planetB.vel = ThreeB.stateB.vel.clone();

                planetC.pos = ThreeB.stateC.pos.clone();
                planetC.vel = ThreeB.stateC.vel.clone();

                planetA.resetTrail();
                planetB.resetTrail();
                planetC.resetTrail();

                //set up the state in state space
                let pos = new ThreeBodyData(planetA.pos,planetB.pos,planetC.pos);
                let vel = new ThreeBodyData(planetA.vel,planetB.vel,planetC.vel);
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

        ui.add(params, 'speed', 0.0,1,0.01).name('Speed').onChange(function(value){
            ThreeB.speed=value;
        });


        ui.add(params, 'reset');

        ui.add(params, 'replay');

    }

    update(){
        for(let i=0;i<200.*this.speed;i++) {
            this.state = this.integrator.step(this.state);
        }

        const newPos = this.state.pos;

        this.a.updatePos(newPos.a);
        this.b.updatePos(newPos.b);
        this.c.updatePos(newPos.c);

        this.a.redrawTrail();
        this.b.redrawTrail();
        this.c.redrawTrail();
    }

    tick(time,dTime){
        if(!this.detectCollision() && this.speed !==0) {
            this.update();
        }
    }

}


export default ThreeBody;





