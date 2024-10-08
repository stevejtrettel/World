

import {
    CatmullRomCurve3,
    Mesh,
    MeshPhysicalMaterial,
    SphereGeometry,
    TubeGeometry
} from "../../../../3party/three/build/three.module.js";


const defaultOptions = {
    length:2,
    color: 0xffffff,
    radius: 0.05,
    res: 1024,
}

class Ball {
    constructor(surface,  iniState, integratorChoice=0, curveOptions = defaultOptions) {
        this.surface=surface;
        this.integratorChoice = integratorChoice;
        this.state=iniState;
        this.curveOptions=curveOptions;
        this.numSteps = this.curveOptions.length/this.surface.integrator[this.integratorChoice].ep;
        this.visible=true;

        let mat = new MeshPhysicalMaterial(
            {
                color: 0xffffff,
                clearcoat: 1,
                roughness:0.1,
            }
        );

        let startGeo = new SphereGeometry(5*this.curveOptions.radius,32,16);
        this.start = new Mesh(startGeo,mat);

        let endGeo = new SphereGeometry(2*this.curveOptions.radius,32,16);
        this.end = new Mesh(endGeo,mat);

        this.initialize();

        let trailGeometry = new TubeGeometry(this.curve,this.numSteps,this.curveOptions.radius,8);
        this.trail=new Mesh(trailGeometry,mat);
    }


    initialize(){

        //get the location
        this.pos = this.surface.parameterization(this.state.pos);
        this.start.position.set(this.pos.x,this.pos.y,this.pos.z);
        this.end.position.set(this.pos.x,this.pos.y,this.pos.z);
        this.pts = [];
        for(let i=0;i<this.numSteps;i++){
            this.pts.push(this.pos);
        };
        this.curve = new CatmullRomCurve3(this.pts);
    }

    addToScene(scene){
        scene.add(this.start);
        scene.add(this.trail);
        scene.add(this.end);
    }

    redrawTrail(){
        this.trail.geometry.dispose();
        const curve = new CatmullRomCurve3(this.pts);
        this.trail.geometry=new TubeGeometry(curve,this.curveOptions.res,this.curveOptions.radius,8);
    }

    stepForward(){

        if(this.surface.stop(this.state.pos)) {
            this.state.pos = this.surface.findBoundary(this.state);
            this.state = this.surface.boundaryReflect(this.state);

        }

        //  for(let i=0;i<10; i++) {
        this.state = this.surface.integrator[this.integratorChoice].step(this.state);
        //  }
        this.pos=this.surface.parameterization(this.state.pos);

        this.start.position.set(this.pos.x,this.pos.y,this.pos.z);

        //add pos to the trail, and pop off the earliest element
        let fin = this.pts.pop();
        this.end.position.set(fin.x,fin.y,fin.z);

        this.pts.unshift(this.pos);

        this.redrawTrail();
    }


    updateSurface(){
        this.initialize();
        this.redrawTrail();
    }

    updateState(iniState){
        //get new initial state if it exists:
        this.state = iniState
        this.initialize();
        this.redrawTrail();
    }

    setVisibility(value){
        this.visible=value;
        this.start.visible=value;
        this.end.visible=value;
        this.trail.visible=value;
    }

}


export default Ball;
