
import {
    InstancedMesh,
    MeshPhysicalMaterial,
    Object3D,
    Color,
    DynamicDrawUsage,
    DoubleSide,
    Vector2,
    CylinderGeometry,
} from "../../../3party/three/build/three.module.js";


class SlopeField{
    constructor(yPrime, range, res){

        this.range = range;
        this.res = res;
        this.yPrime = yPrime;

        //how many meshes are there for real?
        this.count = this.res.x * this.res.y;
        //how many meshes will we allow to be possible
        this.maxCount = 10000;

        //dummy object to be able to make the matrix for each case:
        this.dummy = new Object3D();

        this.getCoords = function(index){

            //get col
            let yIndex = Math.floor(index/this.res.x)+0.5;
            //get percentage
            let yPercent = yIndex/this.res.y;

            //get row:
            let xIndex = (index % this.res.x)+0.5;
            let xPercent = xIndex / this.res.x;

            //convert these to actual coords using the resolution:
            let xRng = (this.range.x.max-this.range.x.min);
            let xVal = xRng * xPercent + this.range.x.min;
            let yRng = (this.range.y.max-this.range.y.min);
            let yVal = yRng * yPercent + this.range.y.min;

            return new Vector2(xVal,yVal);
        }

        this.initialize();

    }


    buildBaseGeometry(){
        let length = 1;
        let rad = 0.1;
        let cylGeometry = new CylinderGeometry(rad,rad,length, 16,1);
        this.baseGeometry = cylGeometry;
    }


    initialize(){

        this.buildBaseGeometry();
        const material = new MeshPhysicalMaterial({
            side: DoubleSide,
        });

        this.slopes = new InstancedMesh( this.baseGeometry, material, this.maxCount );
        //starts pointing along y-axis:
        this.slopes.instanceMatrix.setUsage( DynamicDrawUsage ); // will be updated every frame
    }



    addToScene(scene){
        scene.add(this.slopes);
    }


    //switch out the differential equation
    setYPrime(yPrime){
        this.yPrime=yPrime;
    }

    setRange(range){
        this.range=range;
        //should have time in the update; but we are updating every frame anyway...
        //this.update();
    }

    setRes(res){
        this.res=res;
        this.count = this.res.x * this.res.y;
        //turn off instances that are not being used:
        this.slopes.count=this.count;
    }

    //re-orient all of the slopes!
    //use the current this.slope function: this is updated somewhere else
    update(params){

        if ( this.slopes ) {//if its been initialized

            let coords, vF;
            for(let index = 0; index<this.count; index++) {

                //what point in the (x,y) plane does this index represent?
                coords = this.getCoords(index);
                //get the slope at this point
                vF = this.yPrime(coords, params);
                //get the rotation angle this slope signifies:
                //rotating BACKWARDS from the y-axis
                let theta = -Math.atan2(vF.x, vF.y);

                //build a matrix on this.dummy that moves it to the position specified by coords
                this.dummy.position.set(coords.x, coords.y, 0.08);

                //build in the rotational part of this matrix
                this.dummy.rotation.z = theta;

                //rescale the slopes based on how many there are:
                let deltaX = (this.range.x.max-this.range.x.min)/this.res.x;
                let deltaY = (this.range.y.max-this.range.y.min)/this.res.y;
                let size = 0.8* Math.min(deltaX,deltaY);
                this.dummy.scale.set(size,size,size);

                //set the color of this instance:
                let color = new Color().setHSL(theta/Math.PI, 0.4, 0.6)
                this.slopes.setColorAt(index, color);

                //update the actual matrix at this point!!!
                this.dummy.updateMatrix();
                this.slopes.setMatrixAt(index, this.dummy.matrix);

            }

            this.slopes.instanceMatrix.needsUpdate = true;
            this.slopes.instanceColor.needsUpdate = true;

        }

    }


}


export default SlopeField;
