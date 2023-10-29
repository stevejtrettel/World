import {
    CatmullRomCurve3,
    Mesh,
    MeshPhysicalMaterial,
    SphereGeometry,
    TubeGeometry
} from "../../../../3party/three/build/three.module.js";


const defaultOptions = {
    length:200,
    radius: 0.05,
    tubeRes: 32,
    color: 0x212540,
    roughness:0,
    maxReflections:8,
};


class BilliardPath {
    constructor(surface, iniState, curveOptions = defaultOptions) {

        this.surface=surface;
        this.state=iniState;
        this.curveOptions=curveOptions;

        this.visible=true;
        this.reflectionCount = 0;

        //initialize the curve parameters in the integrator
        this.length = curveOptions.length;
        //number of steps to integrate out.
        this.N = Math.floor(curveOptions.length/this.surface.integrator.ep);


        //initialize the material parameters for the tube:
        let curveMaterial = new MeshPhysicalMaterial({
            clearcoat:1,
            roughness: 0.2,
            color: this.curveOptions.color,
            metalness:0.5
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
        this.integrate();
        //build the geometry, set the spheres:
        this.buildTube();
    }


    integrate(){
        let pts = [];
        let p,uv;
        let currentState = this.state.clone();

        for(let i=0; i<this.N; i++){

            uv = currentState.pos.clone();

            if(this.surface.integrator.stop(uv)){
                //if we have passed the end of the domain:
                //add one to the count of reflections
                this.reflectionCount += 1;
                uv = this.findBoundary(currentState);
                currentState.pos=uv;

                if(this.reflectionCount>this.curveOptions.maxReflections) {
                    p = this.surface.parameterization(uv);
                    pts.push(p.clone());
                    break;
                }
                //otherwise, do a reflection in the boundary!
                currentState= this.surface.boundaryReflect(currentState);
            }

            //otherwise, just carry on as usual:
            p = this.surface.parameterization( uv );
            pts.push( p.clone() );

            currentState = this.surface.integrator.step( currentState );
        }
        this.curve = new CatmullRomCurve3(pts);
    }

    findBoundary(state) {
        //the state is just outside the region, but last step was inside:
        let dist = 0.;
        let testDist = 0.25;
        let pos = state.pos.clone();
        //need to go backwards, so negate velocity
        let vel = state.vel.clone().normalize().multiplyScalar(-1);
        let temp;

        for (let i = 0; i < 10; i++) {
            //divide the step size in half
            testDist = testDist / 2.;
            //test flow by that amount:
            temp = pos.clone().add(vel.clone().multiplyScalar(dist + testDist));
            //if you are still outside, add the dist
            if (this.surface.integrator.stop(temp)) {
                dist += testDist;
            }
            //if not, then don't add: divide in half and try again
        }
        //now, dist stores how far we should travel.
        // do this to pos directly
        return pos.add(vel.multiplyScalar(dist));
    }


    buildTube(){
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


    update(){
        this.reflectionCount=0;
        this.integrate();
        this.buildTube();
    }


    addToScene(scene){
        scene.add(this.tube);
        scene.add(this.start);
        scene.add(this.end);
    }


    updateSurface(surface){
        this.surface=surface;
        this.update();
    }

    updateState(iniState){
        //get new initial state if it exists:
        this.state = iniState
        this.update();
    }


    setVisibility(value){
        this.visible=true;
        this.tube.visible = value;
        this.start.visible = value;
        this.end.visible = value;
        if(value){
            this.updateState(this.state);
        }
    }


    //redo that also prints normal vectors:
    printToString(numPts=500){

    }

}




export default BilliardPath;