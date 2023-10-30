import {
    LineCurve3,
    Mesh,
    MeshPhysicalMaterial,
    SphereGeometry, TorusGeometry,
    TubeGeometry,
    Vector2, Vector3
} from "../../../3party/three/build/three.module.js";
import {ParametricGeometry} from "../../../3party/three/examples/jsm/geometries/ParametricGeometry.js";

import {dState, State} from "../../compute/cpu/components/State.js";
import {RungeKutta} from "../../compute/cpu/RungeKutta.js";





//renaming trig functions to make things less annoying
let sin=function(x){
    return Math.sin(x);
}
let cos = function(x){
    return Math.cos(x);
}

let sin2 = function(x){
    return sin(x)*sin(x);
}

let cos2 = function(x){
    return cos(x)*cos(x);
}

let torusCoords = function(uv){
    let x = uv.x;
    let y = uv.y;
    return new Vector3((2+cos(y))*cos(x),sin(y),(2+cos(y))*sin(x));
}



class DoublePendulum{
    //length is a Vec2, origin a Vec3 (just used for display purposes)
    constructor(length = new Vector2(1,1), mass = new Vector2(1,1), origin = new Vector3(0,1,0)){
        this.origin = origin;
        this.torusOffset = 3;
        this.length = length;
        this.mass = mass;
        this.rad = 0.1;
        //state is a vec2: theta1 theta2 and their derivatives
        this.state = {pos:new Vector2(0,0),vel:new Vector2(0,0)};

        //build all the geometries for a first time:
        let mat = new MeshPhysicalMaterial({
            clearcoat:1,
            color:0xffffff,
        });
        let sphGeo = new SphereGeometry(this.rad);
        let rodGeo1 = new TubeGeometry();
        let rodGeo2 = new TubeGeometry();

        this.ball1 = new Mesh(sphGeo,mat);
        this.ball2 = new Mesh(sphGeo,mat);
        this.rod1 = new Mesh(rodGeo1,mat);
        this.rod2 = new Mesh(rodGeo2, mat);

        //also have the point in configuration space:
        this.config = new Mesh(sphGeo,mat);

    }

    getPositions(){
        let origin = this.origin;
        let arm1 = new Vector3(0,-Math.cos(this.state.pos.x),Math.sin(this.state.pos.x)).multiplyScalar(this.length.x);
        let pt1 = origin.clone().add(arm1);
        let arm2 =  new Vector3(0,-Math.cos(this.state.pos.y),Math.sin(this.state.pos.y)).multiplyScalar(this.length.y);
        let pt2 = pt1.clone().add(arm2);
        return {
            origin: origin,
            pt1: pt1,
            pt2: pt2
        };
    }

    rebuildRods(){
       let pos = this.getPositions();
       let curve1 = new LineCurve3(pos.origin,pos.pt1);
       let curve2 = new LineCurve3(pos.pt1,pos.pt2);
       let geo1 = new TubeGeometry(curve1,1,0.25*this.rad);
       let geo2 = new TubeGeometry(curve2,1,0.25*this.rad);

       this.rod1.geometry.dispose();
       this.rod1.geometry =geo1;

       this.rod2.geometry.dispose();
       this.rod2.geometry = geo2;
    }

    repositionBalls(){
        let pos = this.getPositions();
        this.ball1.position.set(pos.pt1.x,pos.pt1.y,pos.pt1.z);
        this.ball2.position.set(pos.pt2.x,pos.pt2.y,pos.pt2.z);
    }

    repositionConfig(){
        let p = torusCoords(this.state.pos);
        p.multiplyScalar(1);
        let torusOrigin = new Vector3(0,-this.torusOffset,0);
        p.add(torusOrigin);
        this.config.position.set(p.x,p.y,p.z);
    }


    addToScene(scene){
        scene.add(this.ball1);
        scene.add(this.ball2);
        scene.add(this.rod1);
        scene.add(this.rod2);
        scene.add(this.config);
    }

    update(state){
        this.state=state;
        this.repositionBalls();
        this.rebuildRods();
        this.repositionConfig();
    }
}







class DoublePendulumSim{
    constructor(N=10) {
        this.N = N;
        this.length = new Vector2(1,1);
        this.mass = new Vector2(1,1);
        this.origin = new Vector3(0,1,0);
        this.torusOffset = 3.;

        this.params = {
            center1: 1,
            center2: 0.2,
            spread1: 0.001,
            spread2: 0.001,
        };

        this.states =  new Array(this.N);
        this.pendula = new Array(this.N);

        for(let i=0; i<this.N; i++){
            this.pendula[i] = new DoublePendulum(this.length,this.mass, this.origin);
        }

        this.initialize();

        let mat = new MeshPhysicalMaterial({
            clearcoat:1,
            color:0xffffff,
        });
        let sphGeo = new SphereGeometry(0.15);
        this.vertex = new Mesh(sphGeo,mat);
        this.vertex.position.set(this.origin.x,this.origin.y,this.origin.z);


        let torusMat = new MeshPhysicalMaterial(
            {
                clearcoat:2,
                transparent:true,
                transmission:0.9,
                ior:1.,
                color:0xffffff
            }
        );
        let torusGeo = new TorusGeometry(2,1,32,64);

        this.torus = new Mesh(torusGeo,torusMat);
        this.torus.rotateX(Math.PI/2);
        this.torus.position.set(0,-this.torusOffset,0);


        this.createIntegrator();
        this.initialize();

    }

    initialize(){
        this.createIniStates();
        this.updatePendula();
    }

    updatePendula(){
        for( let i=0; i<this.N; i++){
            this.pendula[i].update(this.states[i]);
        }
    }

    createIniStates(){
        //states need two angles for position, two velociites for momentum
        for(let i=0; i<this.N; i++){

            let ang1 = this.params.spread1*(i/this.N-0.5);
            let pos1 = this.params.center1+ang1;

            let ang2 = this.params.spread2*(i/this.N-0.5);
            let pos2 = this.params.center2+ang2;

            let pos = new Vector2(pos1,pos2);
            let vel = new Vector2(0,0);

            this.states[i]= new State(pos,vel);
        }
    }

    createIntegrator(){

        let ep =0.001;
        let g = 5.;

        let length = this.length;
        let mass = this.mass;

        //diffeq from here! https://www.physics.umd.edu/hep/drew/pendulum2.html
        let accel = function(state){

            let pos = state.pos;
            let vel = state.vel;

            let L1 = length.x;
            let L2 = length.y;

            let a1 = pos.x;
            let a2 = pos.y;
            let da1 = vel.x;
            let da2 = vel.y;
            let deltA = a1-a2;

            let m1 = mass.x;
            let m2 = mass.y;
            let M = m1 + m2;

            let denom = m1+ m2*sin2(deltA);

            let term1 = m2*L1*cos(deltA)*da1*da1 + m2*L2*da2*da2;
            let term2 = M*sin(a1) - m2*sin(a2)*cos(deltA);
            let acc1 = -sin(deltA)*(term1)-g*(term2);
            acc1 = acc1/(L1*denom);

            let term3 = M*L1*da1*da1 + m2*L2*cos(deltA)*da2*da2;
            let term4 = M*sin(a1)*cos(deltA) - M*sin(a2);
            let acc2 = sin(deltA)*(term3)+g*(term4);
            acc2 = acc2/(L2*denom);

            let acc = new Vector2(acc1,acc2);
            return acc;
        }

        let derive = function(state){
            let vel = state.vel;
            let acc =accel(state);
            return new dState(vel,acc);
        }
        this.integrator = new RungeKutta(derive,ep);
    }

    stepForward(){
        for(let i=0; i<this.N; i++){
            for(let j=0;j<10; j++) {
                this.states[i] = this.integrator.step(this.states[i]);
            }
        }
        this.updatePendula();
    }

    addToScene(scene){
        scene.add(this.torus);
        scene.add(this.vertex);
        for(let i=0; i<this.N; i++){
            this.pendula[i].addToScene(scene);
        }
    }

    addToUI(ui){
        let sim = this;
        let params = this.params;
        ui.add(params,'center1',0,3.14,0.01).name('StartPos').onChange(function(value){
            params.center=value;
            sim.initialize();
        });
        ui.add(params,'spread1',0,3.14,0.01).name('Spread').onChange(function(value){
            params.spread=value;
            sim.initialize();
        });
    }

    tick(time,dTime){
        this.stepForward();
    }

}




export default DoublePendulumSim;