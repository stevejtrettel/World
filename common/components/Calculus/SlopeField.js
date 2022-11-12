
import {
    InstancedMesh,
    MeshPhysicalMaterial,
    Object3D,
    Color,
    DynamicDrawUsage,
    DoubleSide,
    Vector2,
    CylinderBufferGeometry,
} from "../../../3party/three/build/three.module.js";


class SlopeField{
    constructor(yPrime, range, res){

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

            return new Vector2(xVal,yVal);
        }

        this.initialize();

    }


    buildBaseGeometry(){
        //get the dimensions of a "rod"
        let xRng = (this.range.x.max-this.range.x.min);
        let yRng = (this.range.y.max-this.range.y.min);
        let length = 0.8* Math.min(xRng/this.res.x,yRng/this.res.y);
        let rad = 0.1*length;

        let cylGeometry = new CylinderBufferGeometry(rad,rad,length,16,1);
        this.baseGeometry = cylGeometry;

    }


    initialize(){

        this.buildBaseGeometry();
        const material = new MeshPhysicalMaterial({
            side: DoubleSide,
        });

        this.slopes = new InstancedMesh( this.baseGeometry, material, this.count );
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
    }

    //re-orient all of the slopes!
    //use the current this.slope function: this is updated somewhere else
    update(time, params){

        if ( this.slopes ) {//if its been initialized

            let coords, vF;
            for(let index = 0; index<this.count; index++) {

                //what point in the (x,y) plane does this index represent?
                coords = this.getCoords(index);
                //get the slope at this point
                vF = this.yPrime(coords, time, params);
                //get the rotation angle this slope signifies:
                //rotating BACKWARDS from the y-axis
                let theta = -Math.atan2(vF.x, vF.y);
                //build a matrix on this.dummy that moves it to the position specified by coords
                this.dummy.position.set(coords.x, coords.y, 0.08);

                //build in the rotational part of this matrix
                //this.dummy.lookAt(coords.x+vF.x,coords.y+vF.y,0.08);
                this.dummy.rotation.z = theta;

                //set the scale:
                let mag = vF.length();
                let rescale = 2.*Math.tanh(mag/2.);
                this.dummy.scale.set(rescale,rescale,rescale);

                //set the color of this instance:
                //use slope or xy data to do so?
                let color = new Color().setHSL(theta/Math.PI, 0.4, 0.6)

                //update the actual color at this point!
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
