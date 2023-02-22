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

import {
    RungeKutta
} from "../compute/cpu/RungeKutta.js";


//gravitational force AT pos1 from mass2 and pos2
function gravForce(pos1, mass1, pos2, mass2){
    let relPos = pos2.clone().sub(pos1);
    let r2 = relPos.lengthSq();
    let dir = relPos.normalize();

    let force = dir.multiplyScalar(mass1*mass2/r2);
    return force;
}


//generate a random point on the 2sphere
function randomS2(){
    let long = 2.*Math.PI*Math.random();
    let lat = 2.*Math.random()-1;

    //project horizontally onto sphere:
    let z = lat;
    let x = Math.sqrt(1-lat*lat)*Math.cos(long);
    let y = Math.sqrt(1-lat*lat)*Math.sin(long)

    return new Vector3(x,y,z);
}



//generate a random point in the 3 ball
//this is NOT uniformly distributed: concentrated around center right now bc im lazy
function randomB3(){
    let sph = randomS2();
    let rad = Math.random();
    return sph.multiplyScalar(rad);
}



class Planet{
    constructor(options){
        this.pos = options.pos;
        this.vel = options.vel;
        this.mass = options.mass;
        this.radius = 0.3*Math.pow(this.mass, 0.333);

        this.trailLength = options.trailLength;
        this.trail = [];
        for(let i=0;i<this.trailLength;i++){
            this.trail.push(this.pos);
        }

        const planetMaterial = new MeshPhysicalMaterial(
            {
                color: options.color,
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

                opacity:0,
                transmission:0.5,
                ior:1.2,

                side: DoubleSide,
                color: options.color,
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

    setMass( newMass ){
        this.mass = newMass;
        this.radius = 0.3*Math.pow(this.mass, 0.333);
        this.planetMesh.geometry.dispose();
        this.planetMesh.geometry = new SphereBufferGeometry(this.radius, 32,16);
    }

    resetTrail(){
        this.trail=[];
        for(let i=0;i<this.trailLength;i++){
            this.trail.push(this.pos.clone());
        }
    }

    reset(){
        this.pos=randomB3().multiplyScalar(3.);
        this.vel=randomB3();
        this.resetTrail();
    }


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

        const ep=0.002;
        this.integrator= new RungeKutta(this.derive, ep);

    }

    addToScene( scene ){
        this.a.addToScene( scene );
        this.b.addToScene( scene );
        this.c.addToScene( scene );
    }

    addToUI( ui ){


        let massFolder =ui.addFolder('Masses');
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

                //rig it up so that the center of mass is at the origin, when choosing planetC position
                // let com = planetA.pos.clone().multiplyScalar(planetA.mass);
                // com.add(planetB.pos.clone().multiplyScalar(planetB.mass));
                // planetC.pos = com.multiplyScalar(-1/planetC.mass);
                // planetC.resetTrail();
                // //rig it up so that there is no velocity about the center of mass:
                // let totVel = planetA.vel.clone().add(planetB.vel);
                // planetC.vel = totVel.multiplyScalar(-1);
                planetC.reset();



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

        this.a.redrawTrail();
        this.b.redrawTrail();
        this.c.redrawTrail();
    }

    tick(time,dTime){
        this.update();
    }

}









//actually building one of these
const pA = {
    mass:1,
    pos: new Vector3(0,0,0),
    vel: new Vector3(0,0,0),
    color: 0xffffff,
    trailLength: 1000,
}

const pB = {
    mass:0.5,
    pos: new Vector3(0,3,0),
    vel: new Vector3(0,0,0.5),
    color: 0xd96493,
    trailLength: 1000,
}

const pC = {
    mass:0.3,
    pos: new Vector3(0,0,3),
    vel: new Vector3(0.2,0,0),
    color: 0x32a852,
    trailLength: 1000,
}

const item = new ThreeBody(pA, pB, pC);

export {
    ThreeBody
};

export default {item};
