import {
    Color,
    DoubleSide,
    DynamicDrawUsage,
    InstancedMesh,
    MeshPhysicalMaterial,
    Object3D,
    BoxBufferGeometry, Vector2,
} from "../../../3party/three/build/three.module.js";
import {posNegColor} from "../../utils/colors.js";


//curve is a function that takes in an x value and parameters
//curve(x,params);
//range is an object {min:-3,max:2}
//N is the number of bars in the Riemann sum to be displayed.


let defaultMaterial={
    side: DoubleSide,
    clearcoat:1,
};

class RiemannSum2D{
    constructor( f, range, res, matProps= defaultMaterial){

        this.f = f;
        this.range = range;

        this.res = res;
        this.count = this.res.x*this.res.y;

        this.defaultMaterial = matProps;

        //dummy object to be able to make the matrix for each case:
        this.dummy = new Object3D();

        //get point in 2D that corresponds to this index value
        this.getCoords = function(index){
            //get col
            let yIndex = Math.floor(index/this.res.x)+0.5;
            //get percentage
            let yPercent = yIndex / this.res.y;

            //get row:
            let xIndex = Math.floor(index % this.res.x) + 0.5;
            let xPercent = xIndex/this.res.x;

            //convert these to actual coords using the resolution:
            let xRng = (this.range.x.max-this.range.x.min);
            let xVal = xRng * xPercent + this.range.x.min;
            let yRng = (this.range.y.max-this.range.y.min);
            let yVal = yRng * yPercent + this.range.y.min;

            return new Vector2(xVal,yVal);
        }

        this.initialize();

        this.value=0;

    }


    initialize(){
        //all the Riemann sum rectangles are going to be resized versions of this:
        const barGeometry = new BoxBufferGeometry(1,1,1);
        const barMaterial = new MeshPhysicalMaterial(this.defaultMaterial);

        //the maximum number of different bars we can have in the bargraph show up
        this.totalCount=100000;

        this.barGraph = new InstancedMesh( barGeometry, barMaterial, this.totalCount );
        //starts pointing along y-axis:
        this.barGraph.instanceMatrix.setUsage( DynamicDrawUsage ); // will be updated every frame

    }


    addToScene(scene){
        scene.add(this.barGraph);
    }

    update(params){

        if ( this.barGraph ) {//if it's been initialized

            this.value=0;

            let deltaX = (this.range.x.max-this.range.x.min)/this.res.x;
            let deltaY = (this.range.y.max-this.range.y.min)/this.res.y;

            //set the count to the current value of N:
            this.barGraph.count = this.res.x*this.res.y;

            let coords, val;

            for(let index = 0; index<this.totalCount; index++) {

                //what point in the (x,y) plane does this index represent?
                coords = this.getCoords(index);
                //get the y-Value at this point
                val = this.f(coords, params);

                this.value += val*deltaX*deltaY;

                //build a matrix on this.dummy that moves it to the position specified by coords
                //rectangle's x is at the xCoord, center is half way up the total y-Value
                this.dummy.position.set(coords.x, val/2, coords.y);

                //scale the object correctly: stretch out in the x and y directions
                this.dummy.scale.set(deltaX, Math.abs(val), deltaY);

                //set green for pos and red for neg:
                let color = posNegColor(val);
                this.barGraph.setColorAt(index, color);

                //update the actual matrix at this point!!!
                this.dummy.updateMatrix();
                this.barGraph.setMatrixAt(index, this.dummy.matrix);

                if(index>this.count-1){
                    break;
                }

            }


            this.barGraph.instanceMatrix.needsUpdate = true;
            this.barGraph.instanceColor.needsUpdate = true;

        }
    }


    //all of these need to be followed by "update"
    //after the switch has been made:

    setFunction(f){
        this.f=f;
    }

    setRange(range){
        this.range=range;
    }

    setRes(res){
        this.res=res;
        this.count=this.res.x*this.res.y;
    }

    setVisibility(value){
        this.barGraph.visible=value;
    }

    getValue(){
        return this.value;
    }

}



export default RiemannSum2D;