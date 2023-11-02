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
        this.isVisible = true;
        this.integrator = integrator;
        this.parameterization = parameterization;
        this.iniState = iniState;
        this.curveOptions = curveOptions;

        this.setLength(this.curveOptions.length);

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

    setLength(length){
        //initialize the curve parameters in the integrator
        this.length = length;
        //number of steps to integrate out.
        this.N = Math.floor(length/this.integrator.ep);
    }

    _integrate(){
        let pts = [];
        let p,uv;
        let currentState = this.iniState.clone();

        let len = 0;
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


            //try to stop when we get to the right length, by adding up all the infinitesimal lengths
            //should be a better way to do this.
            if(i>1) {
                //figure out the distance we're at:
                let q = pts[pts.length - 1];
                let diff = p.distanceTo(q);
                len += diff;
                if (len > this.length) {
                    //if length is greater, we should actually remove that last element,
                    //and replace it with one that's the right percentage of the way along!
                    //that way we lie actually at the right distance, instead of slightly overshooting.
                    break;
                }
            }
            pts.push( p.clone() );

            currentState = this.integrator.step( currentState );
        }

        this.curve = new CatmullRomCurve3(pts);

    }

    _buildTube(){
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

    updateIntegrator(integrator,parameterization){
        this.integrator=integrator;
        this.parameterization=parameterization;
        if(this.isVisible){
            this.update(this.iniState);
        }
    }

    update(iniState){
        this.iniState = iniState.clone();
        this._integrate();
        this._buildTube();
    }

    //generate points for printing:
    printToString(numPts = 100){
        let precision = 4;
        let str = ``;
        for(let i=0;i<numPts;i++){
            let pt = this.curve.getPoint(i/(numPts-1));
            //need to re-order so xyz is correct again
            let x = pt.x.toFixed(precision);
            let y = -pt.z.toFixed(precision);
            let z = pt.y.toFixed(precision);
            let ptString = `(${x},${y},${z}), `;
            str += ptString;
        }
       this.pointString = str;
        return str;
    }

    //this makes a file to download with the generated points
    printToFile(fileName=`curve`){

        const file = new File([this.pointString], `${fileName}.txt`, {
            type: 'text/plain',
        });

        //a function which allows the browser to automatically downlaod the file created
        //(a hack from online: it makes a download link, artificially clicks it, and removes the link)
        //https://javascript.plainenglish.io/javascript-create-file-c36f8bccb3be
        function download() {
            const link = document.createElement('a')
            const url = URL.createObjectURL(file)

            link.href = url
            link.download = file.name
            document.body.appendChild(link)
            link.click()

            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
        }

        download();
    }


    setVisibility(value){
        this.isVisible = value;
        this.tube.visible=value;
        this.start.visible=value;
        this.end.visible=value;
        if(value){
            this.update(this.iniState);
        }
    }

}

export default IntegralCurve;
