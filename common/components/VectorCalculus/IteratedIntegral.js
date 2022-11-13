import {
    BoxBufferGeometry, Color,
    DoubleSide, DynamicDrawUsage, InstancedMesh,
    MeshPhysicalMaterial, Object3D,
    Vector2
} from "../../../3party/three/build/three.module.js";
import {posNegColor} from "../../utils/colors.js";

//take a function of x,y; and integrate out the x direction to get a function of y:

class IteratedIntegralX{
    constructor(f, range, res, thickness=0.5 ) {

        this.f = f;
        this.range = range;
        this.res = res;
        this.thickness=thickness;

        this.integratedX = function (y, params) {

            let spreadX = (this.range.x.max - this.range.x.min)
            let deltaX = spreadX / this.res.x;
            let xi = this.range.x.min + 0.5*deltaX;

            let coords;
            let val = 0.;

            for (let i = 0; i < this.res.x; i++) {

                coords = new Vector2(xi, y);
                val +=  deltaX * this.f(coords, params);
                xi += deltaX;
            }

            //so its not as "tall"
            return val/this.thickness;
        }

        //dummy object to be able to make the matrix for each case:
        this.dummy = new Object3D();

        //initialize the InstancedMesh
        this.initialize();

        this.value=0;

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

                this.value=0;

                //set the count to the current value of N:
                this.barGraph.count = this.res.y;

                let barHeight,val;
                let deltaY = (this.range.y.max-this.range.y.min)/this.res.y;
                let y = this.range.y.min + 0.5 * deltaY;

                for(let index = 0; index<this.totalCount; index++) {

                    if(index>this.res.y-1){
                        break;
                    }

                    //get the y-Value at this point
                    val = this.integratedX(y, params);
                    //build a matrix on this.dummy that moves it to the position specified by coords
                    //rectangle's x is at the xCoord, center is half way up the total y-Value
                    this.dummy.position.set(2.*this.range.x.max, val/2, y);

                    //scale the object correctly: stretch out in the x and y directions
                    barHeight = Math.abs(val);
                    this.dummy.scale.set(this.thickness, barHeight, deltaY);

                    //add deltaY to get ready for the next iteration
                    y += deltaY;

                    //add to the running total:
                    this.value += deltaY * val;

                    //set green for pos and red for neg:
                    let color = posNegColor(val);
                    this.barGraph.setColorAt(index, color);

                    //update the actual matrix at this point!!!
                    this.dummy.updateMatrix();
                    this.barGraph.setMatrixAt(index, this.dummy.matrix);

                }

                this.barGraph.instanceMatrix.needsUpdate = true;
                this.barGraph.instanceColor.needsUpdate = true;

            }
        }


        //all of these need to be followed by "update"
        //after the switch has been made:

        setF(f){
            this.f=f;
        }

        setRange(range){
            this.range=range;
        }

        setRes(res){
            this.res=res;
        }

        setVisibility(value){
            this.barGraph.visible=value;
        }
}






//this is the SAME THING but with y switched for x
//and the graph put on the other side
//there should be a better way to do this instead of COPY AND PASTE :(
//but I'm lazy tonight and this is just for an example for class

class IteratedIntegralY{
    constructor(f, range, res, thickness=0.5 ) {

        this.f = f;
        this.range = range;
        this.res = res;
        this.thickness=thickness;

        this.integratedY = function (x, params) {

            let spreadY = (this.range.y.max - this.range.y.min)
            let deltaY = spreadY / this.res.y;
            let yi = this.range.y.min + 0.5*deltaY;

            let coords;
            let val = 0.;

            for (let i = 0; i < this.res.y; i++) {
                coords = new Vector2(x,yi);
                val +=  deltaY * this.f(coords, params);
                yi += deltaY;
            }

            //so its not as "tall"
            return val/this.thickness;
        }

        //dummy object to be able to make the matrix for each case:
        this.dummy = new Object3D();

        //initialize the InstancedMesh
        this.initialize();

        this.value=0;

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

            this.value=0;

            //set the count to the current value of N:
            this.barGraph.count = this.res.x;

            let barHeight,val;
            let deltaX = (this.range.x.max-this.range.x.min)/this.res.x;
            let x = this.range.x.min + 0.5 * deltaX;

            for(let index = 0; index<this.totalCount; index++) {

                if(index>this.res.x-1){
                    break;
                }

                //get the y-Value at this point
                val = this.integratedY(x, params);

                //build a matrix on this.dummy that moves it to the position specified by coords
                //rectangle's x is at the xCoord, center is half way up the total y-Value
                this.dummy.position.set(x, val/2, -2.*this.range.y.max);

                //scale the object correctly: stretch out in the x and y directions
                barHeight = Math.abs(val);
                this.dummy.scale.set(deltaX, barHeight, this.thickness);


                //add deltaX to get ready for the next round
                x += deltaX;

                //add to the running total
                this.value += deltaX *val;

                //set green for pos and red for neg:
                let color = posNegColor(val);
                this.barGraph.setColorAt(index, color);

                //update the actual matrix at this point!!!
                this.dummy.updateMatrix();
                this.barGraph.setMatrixAt(index, this.dummy.matrix);



            }

            this.barGraph.instanceMatrix.needsUpdate = true;
            this.barGraph.instanceColor.needsUpdate = true;

        }
    }


    //all of these need to be followed by "update"
    //after the switch has been made:

    setF(f){
        this.f=f;
    }

    setRange(range){
        this.range=range;
    }

    setRes(res){
        this.res=res;
    }

    setVisibility(value){
        this.barGraph.visible=value;
    }

}



export {
    IteratedIntegralX,
    IteratedIntegralY,
};