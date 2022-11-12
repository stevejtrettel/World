import {
    InstancedMesh,
    CatmullRomCurve3,
    TubeBufferGeometry,
    MeshPhysicalMaterial,
    Vector3,
    Object3D,
    Color,
    DynamicDrawUsage,
    SphereBufferGeometry,
    DoubleSide,
    BufferGeometry
} from "../../../3party/three/build/three.module.js";

import{ mergeBufferGeometries } from "../../../3party/three/examples/jsm/utils/BufferGeometryUtils.js"

class SlopeField{
    constructor(yPrime,range, res){

        this.range = range;
        this.res = res;
        this.yPrime = yPrime;

        //how many meshes are there?
        this.count = this.res.x * this.res.y;

        //dummy object to be able to make the matrix for each case:
        this.dummy = new Object3D();

        this.getCoords = function(index){

            //get col
            let yIndex = Math.floor(index/this.res.x);
            //get percentage
            let yPercent = yIndex/this.res.y;

            //get row:
            let xIndex = index % this.res.x;
            let xPercent = xIndex / this.res.x;

            //convert these to actual coords using the resolution:
            let xRng = (this.range.x.max-this.range.x.min);
            let xVal = xRng * xPercent + this.range.x.min;
            let yRng = (this.range.y.max-this.range.y.min);
            let yVal = yRng * yPercent + this.range.y.min;

            return {x:xVal, y:yVal};
        }

        this.initialize();

    }


    buildBaseGeometry(){
        //get the dimensions of a "rod"
        let xRng = (this.range.x.max-this.range.x.min);
        let yRng = (this.range.y.max-this.range.y.min);
        let length = 0.8* Math.min(xRng/this.res.x,yRng/this.res.y);
        let rad = 0.1*length;

        let path = new CatmullRomCurve3([new Vector3(-length/2,0,0), new Vector3(length/2,0,0)]);
        let tubeGeometry = new TubeBufferGeometry(path,2,rad,16,false);

        this.baseGeometry = tubeGeometry;

        // let ballGeometry = new SphereBufferGeometry(rad,32,16);
        // let end1 = ballGeometry.clone().translate(-length/2,0,0);
        // let end2 = ballGeometry.clone().translate(length/2,0,0);
        //
        // this.baseGeometry = mergeBufferGeometries([tubeGeometry,end1,end2]);
    }


    initialize(){

        this.buildBaseGeometry();
        const material = new MeshPhysicalMaterial({
            side: DoubleSide,
        });

        this.field = new InstancedMesh( this.baseGeometry, material, this.count );
        this.field.instanceMatrix.setUsage( DynamicDrawUsage ); // will be updated every frame
    }



    addToScene(scene){
        scene.add(this.field);
    }


    //switch out the differential equation
    setDiffEq(fn){
        this.yPrime=fn;
    }

    setRange(range){
        this.range=range;
        //should have time in the update; but we are updating every frame anyway...
        //this.update();
    }

    setRes(res){
        this.res=res;
        this.count = this.res.x * this.res.y;
    }

    //re-orient all of the slopes!
    //use the current this.slope function: this is updated somewhere else
    update(time,a=0,b=0,c=0){
        if ( this.field ) {//if its been initialized

            let coords, yPrime;
            for(let index = 0; index<this.count; index++) {

                //what point in the (x,y) plane does this index represent?
                coords = this.getCoords(index);
                //get the slope at this point
                //time is an optional coordinate in the yPrime function
                yPrime = this.yPrime(coords.x, coords.y,time,a,b,c);
                //get the rotation angle this slope signifies:
                let theta = Math.atan2(yPrime, 1);

                //build a matrix on this.dummy that moves it to the position specified by coords
                this.dummy.position.set(coords.x, coords.y, 0.08);
                //build in the rotational part of this matrix
                this.dummy.rotation.z = theta;

                //set the color of this instance:
                //use slope or xy data to do so?
                let color = new Color().setHSL(theta/Math.PI, 0.4, 0.6)


                //update the actual color at this point!
                this.field.setColorAt(index, color);

                //update the actual matrix at this point!!!
                this.dummy.updateMatrix();
                this.field.setMatrixAt(index, this.dummy.matrix);

            }

            this.field.instanceMatrix.needsUpdate = true;
            this.field.instanceColor.needsUpdate = true;

         }

    }


}


export default SlopeField;