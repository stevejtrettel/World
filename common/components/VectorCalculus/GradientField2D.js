import {
    InstancedMesh,
    MeshPhysicalMaterial,
    Vector3,
    Object3D,
    Color,
    DynamicDrawUsage,
    DoubleSide,
    ConeBufferGeometry,
    Vector2
} from "../../../3party/three/build/three.module.js";


class GradientField2D{
    constructor(scalarFunction, range ){

        this.range = range;
        this.scalarFunction = scalarFunction;

        //defauly resolution:easily changed via UI
        this.res = {x:50,y:50};

        this.xPartial = function(coords, params){
            let eps = 0.001;
            let p0 = coords.clone().add(new Vector2(-eps/2,0));
            let p1 = coords.clone().add(new Vector2(eps/2,0));
            let val0 = this.scalarFunction(p0,params);
            let val1 = this.scalarFunction(p1,params);

            let deriv = (val1-val0)/eps;
            return deriv;
        }

        this.yPartial = function(coords, params){
            let eps = 0.001;
            let p0 = coords.clone().add(new Vector2(0,-eps/2));
            let p1 = coords.clone().add(new Vector2(0,eps/2));
            let val0 = this.scalarFunction(p0,params);
            let val1 = this.scalarFunction(p1,params);

            let deriv = (val1-val0)/eps;
            return deriv;
        }

        this.gradient = function(coords, params){
            let dx = this.xPartial(coords,params);
            let dy = this.yPartial(coords,params);
            return new Vector2(dx,dy);
        }




        //NOW I'M BASICALLY READY TO MAKE A VECTOR FIELD 2D:

        //how many meshes are there for real?
        this.count = this.res.x * this.res.y;
        //how many meshes will we allow to be possible
        this.maxCount = 10000;

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
        let length =1;
        let rad = 0.1;
        this.baseGeometry = new ConeBufferGeometry(rad,length,16,1);
    }



    initialize(){

        this.buildBaseGeometry();
        const material = new MeshPhysicalMaterial({
            side: DoubleSide,
        });

        this.vectors = new InstancedMesh( this.baseGeometry, material, this.maxCount );
        //rotate so its pointing the right way: along the x axis as default:
       // this.vectors.rotateZ(-Math.PI/2);
        this.vectors.instanceMatrix.setUsage( DynamicDrawUsage ); // will be updated every frame
    }



    addToScene(scene){
        scene.add(this.vectors);
    }


    //switch out the differential equation
    setFunction(fn){
        this.scalarFunction=fn;
    }

    setRange(range){
        this.range=range;
    }

    setRes(res){
        this.res=res;
        this.count = this.res.x * this.res.y;
        //turn off instances that are not being used:
        this.vectors.count=this.count;
    }

    //re-orient all of the slopes!
    //use the current this.slope function: this is updated somewhere else
    update(params){
        if ( this.vectors ) {//if its been initialized

            let coords, vF;
            for(let index = 0; index<this.count; index++) {

                //what point in the (x,y) plane does this index represent?
                coords = this.getCoords(index);
                //get the slope at this point
                vF = this.gradient(coords, params);
                //get the rotation angle this slope signifies:
                let theta = Math.atan2(vF.x, vF.y);

                //build a matrix on this.dummy that moves it to the position specified by coords
                this.dummy.position.set(coords.x,0, coords.y);

                //build in the rotational part of this matrix
                //this.dummy.lookAt(coords.x+vF.x,coords.y+vF.y,0.08);
                this.dummy.rotation.z=-3.1415/2.;
                this.dummy.rotation.y = -3.1415/2+theta;

                //set the original scale based on the resolution
                let deltaX = (this.range.x.max-this.range.x.min)/this.res.x;
                let deltaY = (this.range.y.max-this.range.y.min)/this.res.y;
                let size = 0.8* Math.min(deltaX,deltaY);

                //set the scale based on the vectors magnitude:
                let mag = vF.length();
                let rescale = Math.tanh(mag/3.);
                size = rescale*size;
                this.dummy.scale.set(size,size,size);

                // //set the color of this instance:
                // //use slope or xy data to do so?
                // let color = new Color().setHSL(theta/Math.PI, 0.4, 0.6)
                // //update the actual color at this point!
                // this.vectors.setColorAt(index, color);

                //update the actual matrix at this point!!!
                this.dummy.updateMatrix();
                this.vectors.setMatrixAt(index, this.dummy.matrix);

            }

            this.vectors.instanceMatrix.needsUpdate = true;
           // this.vectors.instanceColor.needsUpdate = true;

        }

    }


}


export default GradientField2D;