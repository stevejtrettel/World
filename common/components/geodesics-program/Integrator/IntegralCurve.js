
//takes in an integrator, a parameterization, and then some curve params and returns the curve
//parameterization is a function (integrator output)->vec3
//the input curve params are:
//{iniState, length, stopFn}
//the input display params are:
//{tubeRad, ballRad, color}

import {
    CatmullRomCurve3,
    MeshPhysicalMaterial,
    SphereGeometry,
    TubeGeometry,
    Mesh,
} from "../../../../3party/three/build/three.module.js";





class IntegralCurve{
    constructor(integrator, parameterization, iniState, stop, curveOptions) {

        this.integrator = integrator;
        this.curveOptions = curveOptions;
        this.iniState = iniState;

        //a map from state.pos -> Vector3() placing the integral curve (in coordinates) into 3space
        //default is
        this.parameterization = parameterization;

        //initialize the curve parameters in the integrator
        this.length = curveOptions.length;
        //number of steps to integrate out.
        this.N = Math.floor(curveOptions.length/this.integrator.ep);

        this.stop = stop;

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

            // if(this.stop(uv.x,uv.y)){
            //     //if we have passed the end of the domain:
            //     //time to search out the actual endpoint, and make that our last point!
            //     uv=this.findBoundary(currentState);
            //     p = this.parameterization(uv.x, uv.y);
            //     pts.push(p.clone());
            //     break;
            // }

            //otherwise, just carry on as usual:
            p = this.parameterization( uv.x, uv.y );
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
            if(this.stop(temp.x,temp.y)){
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