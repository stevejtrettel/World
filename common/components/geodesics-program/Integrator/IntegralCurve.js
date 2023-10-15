
//takes in an integrator, a parameterization, and then some curve params and returns the curve
//parameterization is a function (integrator output)->vec3
//the input curve params are:
//{iniState, length, stopFn}
//the input display params are:
//{tubeRad, ballRad, color}

import {
    CatmullRomCurve3,
    MeshPhysicalMaterial,
    SphereBufferGeometry,
    TubeBufferGeometry,
    Mesh,
} from "../../../../3party/three/build/three.module.js";



class IntegralCurve{
    constructor(integrator, parameterization, iniState, curveParams) {

        this.integrator = integrator;
        this.curveParams = curveParams;
        this.iniState = iniState;

        //a map from state.pos -> Vector3() placing the integral curve (in coordinates) into 3space
        //default is
        this.parameterization = parameterization;

        //initialize the curve parameters in the integrator
        this.length = curveParams.length;
        //number of steps to integrate out.
        this.N = Math.floor(curveParams.length/this.integrator.ep);

        this.stop = curveParams.stop;
        this.curve = null;

        //do the integration, to get a curve object:
        this._integrate(this.iniState);


        //initialize the material parameters for the tube:
        let curveMaterial = new MeshPhysicalMaterial({
            clearcoat:1,
            color: this.curveParams.color,
            metalness:1,
        });

        //initialize the objects:
        //starting and ending spheres are unit radius as we will rescale them when we build the tube:
        this.start=new Mesh(
            new SphereBufferGeometry(1,32,16),
            curveMaterial
        );
        this.end= new Mesh(
            new SphereBufferGeometry(1,32,16),
            curveMaterial
        );

        //what we do for the geometry of this.tube won't matter as we are going to throw it away right away:
        this.tube = new Mesh(
            new TubeBufferGeometry(
                this.curve,
                8,
                this.curveParams.radius,
                this.curveParams.res),
            curveMaterial
        );

        this._buildTube(this.curve);
    }

    _integrate(iniState){

        let pts = [];
        let p;
        let currentState = iniState.clone();

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

    _buildTube(curve){
        //this method assumes we have built the tube,start, and stop as meshes already
        //dispose of the old geometry
        this.tube.geometry.dispose();
        //set the radii:
        let rad = this.curveParams.radius;
        let sphRad = rad*1.5;
            //multiply by this.curveParams.endSizeFactor;

        this.tube.geometry=new TubeBufferGeometry(
            this.curve,
            8,
            rad,
            this.curveParams.res);

        //reset position and size of end sphere
        let startPt = this.curve.getPoint(0);
        this.start.position.set(startPt.x, startPt.y, startPt.z);
        this.start.scale.set(sphRad,sphRad,sphRad);

        //reset position and size of end sphere
        let endPt = this.curve.getPoint(1);
        this.end.position.set(endPt.x, endPt.y, endPt.z);
        this.end.scale.set(sphRad,sphRad,sphRad);
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