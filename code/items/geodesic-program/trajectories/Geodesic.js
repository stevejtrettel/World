import {
    CatmullRomCurve3,
    Mesh,
    MeshPhysicalMaterial,
    SphereGeometry,
    TubeGeometry
} from "../../../../3party/three/build/three.module.js";


const defaultOptions = {
    length:20,
    segments: 1024,
    radius: 0.1,
    tubeRes: 32,
    color: 0xffffff,
    roughness:0,
};


class Geodesic{
    constructor(surface, iniState, integratorChoice=0, curveOptions=defaultOptions) {

        this.surface=surface;
        this.state=iniState;
        this.integratorChoice = integratorChoice;
        this.curveOptions = curveOptions;

        this.visible=true;
        this.reflectionCount = 0;

        //initialize the curve parameters in the integrator
        this.length = curveOptions.length;
        //number of steps to integrate out.
        this.Nmax = Math.floor(curveOptions.length/this.surface.integrator[this.integratorChoice].ep);
        this.N = this.Nmax;

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
        this.initialize();
    }


    integrate(){
        let pts = [];
        let p,uv;
        let currentState = this.state.clone();

        for(let i=0; i<this.Nmax; i++){

            uv = currentState.pos.clone();
            this.N=i;

            if(this.surface.stop(uv)){

                uv = this.surface.findBoundary(currentState);
                    p = this.surface.parameterization(uv);
                    pts.push(p.clone());
                    break;

            }

            //otherwise, just carry on as usual:
            p = this.surface.parameterization( uv );
            pts.push( p.clone() );

            currentState = this.surface.integrator[this.integratorChoice].step( currentState );
        }
        this.curve = new CatmullRomCurve3(pts);
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


    initialize(){
        this.reflectionCount=0;
        this.integrate();
        this.buildTube();
    }


    addToScene(scene){
        scene.add(this.tube);
        scene.add(this.start);
        scene.add(this.end);
    }


    updateSurface(){
        this.initialize();
    }

    updateState(iniState){
        //get new initial state if it exists:
        this.state = iniState
        this.initialize();
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

}



export default Geodesic;
