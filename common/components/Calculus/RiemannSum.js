import {
    Color,
    DoubleSide,
    DynamicDrawUsage,
    InstancedMesh,
    MeshPhysicalMaterial,
    Object3D,
    PlaneBufferGeometry,
    BoxBufferGeometry,
} from "../../../3party/three/build/three.module.js";

import {posNegColor } from "../../utils/colors.js";


//curve is a function that takes in an x value and parameters
//curve(x,params);
//range is an object {min:-3,max:2}
//N is the number of bars in the Riemann sum to be displayed.


class RiemannSum{
    constructor( curve, range, N, thickness=0.15 ){

        this.curve = curve;
        this.range = range;
        this.N = N;
        this.thickness=thickness;

        //dummy object to be able to make the matrix for each case:
        this.dummy = new Object3D();

        //this index is always between 0 and this.N-1
        this.getCoords = function(index){
            let span = (this.range.max-this.range.min);

            //midpoint Riemann Sum
            let xPercent = (index+0.5) / this.N;
            let xVal = span * xPercent + this.range.min;

            return xVal;
        }

        this.initialize();

        this.value;
    }


    initialize(){
        //all the Riemann sum rectangles are going to be resized versions of this:
        const barGeometry = new BoxBufferGeometry(1,1,1);
        const barMaterial = new MeshPhysicalMaterial({
            side: DoubleSide,
            clearcoat:1,
        });

        //the maximum number of different bars we can have in the bargraph show up
        this.totalCount=1000;

        this.barGraph = new InstancedMesh( barGeometry, barMaterial, this.totalCount );
        //starts pointing along y-axis:
        this.barGraph.instanceMatrix.setUsage( DynamicDrawUsage ); // will be updated every frame

    }


    addToScene(scene){
        scene.add(this.barGraph);
    }

    update(params){


        if ( this.barGraph ) {//if it's been initialized

            //set the count to the current value of N:
            this.barGraph.count = this.N;

            let xCoord, yVal;
            let xScale,yScale;

            //calculate the value of the Riemann Sum
            this.value=0;

            for(let index = 0; index<this.totalCount; index++) {

                //what point in the (x,y) plane does this index represent?
                xCoord = this.getCoords(index);
                //get the y-Value at this point
                yVal = this.curve(xCoord, params);

                //build a matrix on this.dummy that moves it to the position specified by coords
                //rectangle's x is at the xCoord, center is half way up the total y-Value
                this.dummy.position.set(xCoord, yVal/2, 0.0);

                //scale the object correctly: stretch out in the x and y directions
                xScale = (this.range.max-this.range.min)/this.N;
                yScale = Math.abs(yVal);
                this.dummy.scale.set(xScale,yScale,this.thickness);

                //add the area of this new rectangle onto the sum
                this.value += xScale*yVal;

                //set green for pos and red for neg:
                let color = posNegColor(yVal);
                this.barGraph.setColorAt(index, color);

                //update the actual matrix at this point!!!
                this.dummy.updateMatrix();
                this.barGraph.setMatrixAt(index, this.dummy.matrix);

                if(index>this.N-1){
                    break;
                }

            }

            this.barGraph.instanceMatrix.needsUpdate = true;
            this.barGraph.instanceColor.needsUpdate = true;

        }
    }


    //all of these need to be followed by "update"
    //after the switch has been made:

    setCurve(curve){
        this.curve=curve;
    }

    setRange(range){
        this.range=range;
    }

    setN(N){
        this.N=N;
    }

    setVisibility(value){
        this.barGraph.visible=value;
    }

    getValue(){
        return this.value;
    }

    setPosition(x,y,z){
        this.barGraph.position.set(x,y,z);
    }

}



export default RiemannSum;