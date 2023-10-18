import {
    CatmullRomCurve3,
    MeshPhysicalMaterial,
    TubeGeometry,
    Mesh,
    SphereGeometry
} from "../../../../3party/three/build/three.module.js";

const defaultOptions = {
    length:10,
    segments: 1024,
    radius: 0.1,
    tubeRes: 32,
    color: 0xffffff,
    roughness:0,
};




class IntegralCurve{
    constructor(integrator, parameterization, iniState, curveOptions=defaultOptions ){
    //constructor(integrator, parameterization, iniState, stop, curveOptions) {

        this.integrator = integrator;
        this.parameterization = parameterization;
        this.iniState = iniState;
        this.curveOptions = curveOptions;


        //initialize the curve parameters in the integrator
        this.length = curveOptions.length;
        //number of steps to integrate out.
        this.N = Math.floor(curveOptions.length/this.integrator.ep);

        //initialize the material parameters for the tube:
        let curveMaterial = new MeshPhysicalMaterial({
            clearcoat:0.5,
            roughness: 0.3,
            color: this.curveOptions.color,
        });

        //initialize the objects:
        //starting and ending spheres are unit radius as we will rescale them when we build the tube:
        let sph =  new SphereGeometry(1,32,16);
        this.start=new Mesh(sph, curveMaterial);
        this.end= new Mesh(sph, curveMaterial);
        //what we do for the geometry of this.tube won't matter as we are going to throw it away right away:
        this.tube = new Mesh(new TubeGeometry(),curveMaterial);

        //do the integration, to get a curve object:
        this.curve = null;
        this._integrate(this.iniState);
        //build the geometry, set the spheres:
        this._buildTube(this.curve);
    }

    _integrate(iniState){

        let pts = [];
        let p,uv;
        let currentState = iniState.clone();

        for(let i=0; i<this.N; i++){

            uv = currentState.pos.clone();

            if(this.integrator.stop(uv)){
                //if we have passed the end of the domain:
                //time to search out the actual endpoint, and make that our last point!
                uv=this.findBoundary(currentState);
                p = this.parameterization(uv);
                pts.push(p.clone());
                break;
            }

            //otherwise, just carry on as usual:
            p = this.parameterization( uv );
            pts.push( p.clone() );

            currentState = this.integrator.step( currentState );
        }
        this.curve = new CatmullRomCurve3(pts);

    }

    _buildTube(curve){
        //this method assumes we have built the tube,start, and stop as meshes already
        //dispose of the old geometry
        this.tube.geometry.dispose();
        //set the radii:
        let rad = this.curveOptions.radius;
        let sphRad = rad*1.5;
        //multiply by this.curveParams.endSizeFactor;

        this.tube.geometry=new TubeGeometry(
            this.curve,
            this.N,
            rad,
            8
        );

        //reset position and size of end sphere
        let startPt = this.curve.getPoint(0);
        this.start.position.set(startPt.x, startPt.y, startPt.z);
        this.start.scale.set(sphRad,sphRad,sphRad);

        //reset position and size of end sphere
        let endPt = this.curve.getPoint(1);
        this.end.position.set(endPt.x, endPt.y, endPt.z);
        this.end.scale.set(sphRad,sphRad,sphRad);
    }

    findBoundary(state){
        //the state is just outside the region, but last step was inside:
        let dist=0.;
        let testDist = 0.25;
        let pos = state.pos.clone();
        //need to go backwards, so negate velocity
        let vel = state.vel.clone().normalize().multiplyScalar(-1);
        let temp;

        for(let i=0;i<10;i++){
            //divide the step size in half
            testDist=testDist/2.;
            //test flow by that amount:
            temp=pos.clone().add(vel.clone().multiplyScalar(dist+testDist));
            //if you are still outside, add the dist
            if(this.integrator.stop(temp)){
                dist+=testDist;
            }
            //if not, then don't add: divide in half and try again
        }

        //now, dist stores how far we should travel.
        // do this to pos directly
        return pos.add(vel.multiplyScalar(dist));
    }

    addToScene(scene){
        scene.add(this.tube);
        scene.add(this.start);
        scene.add(this.end);
    }

    update(iniState){
        this._integrate(iniState);
        this._buildTube(this.curve);
    }

}

export default IntegralCurve;

//
//
// class IntegralCurve {
//
//     constructor(integrator, parameterization, state, options=defaultOptions ){
//
//         this.state = state;
//         this.integrator = integrator;
//
//         //save the options for this curve:
//         this.curveOptions = options;
//
//
//         //this takes the output of the integrator, and displays it in space
//         //for example, if you solve an ODE in coordinates then need to put back into R3 somehow.
//         //default just takes (x,y,z) to (x,y,z)...
//         this.parameterization = parameterization;
//
//
//         //number of steps to integrate out.
//         this.N = Math.floor(this.curveOptions.length/this.integrator.ep);
//
//         this.curve=null;
//
//
//         this.integrate( this.state );
//
//         let curveMaterial = new MeshPhysicalMaterial({
//             clearcoat:1,
//             color: this.curveOptions.color,
//             metalness:1,
//         });
//         let tubeGeo = new TubeGeometry(this.curve, this.curveOptions.segments, this.curveOptions.radius,this.curveOptions.res);
//
//         let ball = new SphereGeometry(2*this.curveOptions.radius, 32,16);
//
//         this.tube = new Mesh( tubeGeo, curveMaterial);
//
//         this.start = new Mesh( ball, curveMaterial);
//         let startPt = this.curve.getPoint(0);
//         this.start.position.set(startPt.x, startPt.y, startPt.z);
//
//         this.end = new Mesh(ball, curveMaterial);
//         let endPt = this.curve.getPoint(1);
//         this.end.position.set(endPt.x, endPt.y, endPt.z);
//
//     }
//
//     integrate( state ){
//
//         let pts = [];
//         let p;
//
//         let currentState = state.clone();
//
//         for(let i=0; i<this.N; i++){
//
//             p = this.parameterization( currentState.pos.clone() );
//             pts.push( p.clone() );
//
//             if(this.integrator.stop(currentState)){
//                 break;
//             }
//
//             currentState = this.integrator.step( currentState );
//
//         }
//         this.curve = new CatmullRomCurve3(pts);
//     }
//
//     resetCurve(curve){
//         this.tube.geometry.dispose();
//         this.tube.geometry=new TubeGeometry(
//             this.curve,
//             this.curveOptions.segments,
//             this.curveOptions.radius,
//             this.curveOptions.res);
//
//         let startPt = this.curve.getPoint(0);
//         this.start.position.set(startPt.x, startPt.y, startPt.z);
//
//         let endPt = this.curve.getPoint(1);
//         this.end.position.set(endPt.x, endPt.y, endPt.z);
//
//     }
//
//     setName( name ) {
//         this.name = name;
//     }
//
//     addToScene( scene ) {
//         scene.add(this.tube);
//         scene.add(this.start);
//         scene.add(this.end);
//     }
//
//
//     update(iniCond){
//         this.integrate(iniCond);
//         this.resetCurve(this.curve);
//     }
//
// }
//
//
//
// export default IntegralCurve;