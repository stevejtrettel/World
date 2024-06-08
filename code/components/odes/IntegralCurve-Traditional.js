import {
    CatmullRomCurve3,
    MeshPhysicalMaterial,
    TubeBufferGeometry,
    Mesh, SphereBufferGeometry
} from "../../../3party/three/build/three.module.js";




const defaultOptions = {
    length:10,
    segments: 1024,
    radius: 0.1,
    tubeRes: 32,
    color: 0xffffff,
    roughness:0,
};

const defaultStop=function(){
    return false;
}

class IntegralCurve {

    constructor(integrator, parameterization, state, options=defaultOptions, stop=defaultStop){

        this.state = state;
        this.integrator = integrator;

        //save the options for this curve:
        this.curveOptions = options;


        //this takes the output of the integrator, and displays it in space
        //for example, if you solve an ODE in coordinates then need to put back into R3 somehow.
        //default just takes (x,y,z) to (x,y,z)...
        this.parameterization = parameterization;


        //number of steps to integrate out.
        this.N = Math.floor(this.curveOptions.length/this.integrator.ep);

        this.curve=null;
        this.stop=stop;


        this.integrate( this.state );


        let curveMaterial = new MeshPhysicalMaterial({
            clearcoat:1,
            color: this.curveOptions.color,
            metalness:1,
        });
        let tubeGeo = new TubeBufferGeometry(this.curve, this.curveOptions.segments, this.curveOptions.radius,this.curveOptions.res);

        let ball = new SphereBufferGeometry(2*this.curveOptions.radius, 32,16);

        this.tube = new Mesh( tubeGeo, curveMaterial);

        this.start = new Mesh( ball, curveMaterial);
        let startPt = this.curve.getPoint(0);
        this.start.position.set(startPt.x, startPt.y, startPt.z);

        this.end = new Mesh(ball, curveMaterial);
        let endPt = this.curve.getPoint(1);
        this.end.position.set(endPt.x, endPt.y, endPt.z);

    }

    integrate( state ){

        let pts = [];
        let p;
        let currentState = state.clone();

        for(let i=0; i<this.N; i++){

            p = this.parameterization( currentState.pos.clone() );
            pts.push( p.clone() );

            if(this.stop(currentState)){
                break;
            }

            currentState = this.integrator.step( currentState );

        }
        this.curve = new CatmullRomCurve3(pts);
    }

    resetCurve(curve){
        this.tube.geometry.dispose();
        this.tube.geometry=new TubeBufferGeometry(
            this.curve,
            this.curveOptions.segments,
            this.curveOptions.radius,
            this.curveOptions.res);

        let startPt = this.curve.getPoint(0);
        this.start.position.set(startPt.x, startPt.y, startPt.z);

        let endPt = this.curve.getPoint(1);
        this.end.position.set(endPt.x, endPt.y, endPt.z);

    }

    setName( name ) {
        this.name = name;
    }

    addToScene( scene ) {
       scene.add(this.tube);
       scene.add(this.start);
       scene.add(this.end);
    }


    update(iniCond){
        this.integrate(iniCond);
        this.resetCurve(this.curve);
    }

}



export { IntegralCurve }
