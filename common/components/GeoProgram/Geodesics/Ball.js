
import IntegralCurve from "../Integrator/IntegralCurve.js";
import {
    MeshPhysicalMaterial,
    SphereGeometry,
    Mesh,
    CatmullRomCurve3, TubeGeometry
} from "../../../../3party/three/build/three.module.js";

//essentially a wrapper for IntegralCurve that takes in a compute class
//and pulls out the acceleration to build the integrator

const defaultOptions = {
    length:20,
    color: 0xffffff,
    radius: 0.05,
    res: 100,
}

class Ball {
    constructor(surface, iniState, curveOptions = defaultOptions) {
        this.surface=surface;
        this.state=iniState;
        this.curveOptions=curveOptions;
        this.ep = 0.1;
        this.numSteps = this.curveOptions.length/this.ep;



        let mat = new MeshPhysicalMaterial(
            {
                color: 0xffffff,
                clearcoat: 1,
            }
        );

        let ballGeo = new SphereGeometry(5*this.curveOptions.radius,32,16);
        this.ball = new Mesh(ballGeo,mat);

        this.initialize();

        let trailGeometry = new TubeGeometry(this.curve,this.numSteps,this.curveOptions.radius,8);
        this.trail=new Mesh(trailGeometry,mat);
    }


    initialize(){

        //get the location
        this.pos = this.surface.parameterization(this.state.pos);
        this.ball.position.set(this.pos.x,this.pos.y,this.pos.z);
        this.pts = [];
        for(let i=0;i<this.numSteps;i++){
            this.pts.push(this.pos);
        };
        this.curve = new CatmullRomCurve3(this.pts);
    }

    addToScene(scene){
        scene.add(this.ball);
        scene.add(this.trail);
    }

    redrawTrail(){
        this.trail.geometry.dispose();
        const curve = new CatmullRomCurve3(this.pts);
        this.trail.geometry=new TubeGeometry(curve,this.numSteps,this.curveOptions.radius,8);
    }

    stepForward(){

        //if we hit the edge, reflect the state:
        if(this.surface.integrator.stop(this.state.pos)) {
            this.surface.boundaryReflect(this.state);
        }

        this.state = this.surface.integrator.step(this.state);
        this.pos=this.surface.parameterization(this.state.pos);

        this.ball.position.set(this.pos.x,this.pos.y,this.pos.z);

        //add pos to the trail, and pop off the earliest element
        this.pts.pop();
        this.pts.unshift(this.pos);

        this.redrawTrail();
    }


    updateSurface(){
        this.initialize();
        this.redrawTrail();
    }

    update(iniState){
        //get new initial state if it exists:
        this.state = iniState
        this.initialize();
        this.redrawTrail();
    }

    setVisibility(value){
        this.ball.visible=value;
        this.trail.visible=value;
    }

}



export default Ball;