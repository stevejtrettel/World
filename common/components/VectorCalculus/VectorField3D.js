import {
    InstancedMesh,
    MeshPhysicalMaterial,
    Vector3,
    Object3D,
    Color,
    DynamicDrawUsage,
    DoubleSide,
    ConeBufferGeometry,
    Vector2,
    Matrix4,
} from "../../../3party/three/build/three.module.js";


class VectorField3D{
    constructor(vectorField, range, res){

        this.range = range;
        this.res = res;
        this.vectorField = vectorField;

        //how many meshes are there?
        this.count = this.res.x * this.res.y*this.res.z;

        //dummy object to be able to make the matrix for each case:
        this.dummy = new Object3D();

        this.getCoords = function(index){

            let area = this.res.x*this.res.y;
            let row = this.res.x;

            //get depth
            let zIndex = Math.floor(index/area);
            let zPercent = zIndex/this.res.z;

            //get col
            //remainder from z: point in xy-plane
            index = index % area;
            let yIndex = Math.floor(index/row);
            //get percentage
            let yPercent = yIndex/this.res.y;

            //get row:
            //remainder from x: point along row
            let xIndex = index % row;
            let xPercent = xIndex / this.res.x;

            //convert these to actual coords using the resolution:
            let xRng = (this.range.x.max-this.range.x.min);
            let xVal = xRng * xPercent + this.range.x.min;
            let yRng = (this.range.y.max-this.range.y.min);
            let yVal = yRng * yPercent + this.range.y.min;
            let zRng = (this.range.z.max-this.range.z.min);
            let zVal = zRng * zPercent + this.range.z.min;

            let res = new Vector3(xVal,yVal,zVal);
            return res;
        }

        this.initialize();

    }


    buildBaseGeometry(){
        //get the dimensions of a "rod"
        let xRng = (this.range.x.max-this.range.x.min);
        let yRng = (this.range.y.max-this.range.y.min);
        let zRng = (this.range.z.max-this.range.z.min);
        let length = Math.min(xRng/this.res.x,yRng/this.res.y);
        length = Math.min(length, zRng/this.res.z);
        length *= 0.8;
        let rad = 0.1*length;

        let coneGeometry = new ConeBufferGeometry(rad,length,16,1);
        this.baseGeometry = coneGeometry;

    }


    initialize(){

        this.buildBaseGeometry();
        const material = new MeshPhysicalMaterial({
            side: DoubleSide,
        });

        this.vectors = new InstancedMesh( this.baseGeometry, material, this.count );
        //default orientation is vertical: along y-axis
       this.vectors.instanceMatrix.setUsage( DynamicDrawUsage ); // will be updated every frame
    }



    addToScene(scene){
        scene.add(this.vectors);
    }


    //switch out the differential equation
    setVectorField(fn){
        this.vectorField=fn;
    }

    setRange(range){
        this.range=range;
        //should have time in the update; but we are updating every frame anyway...
        //this.update();
    }

    setRes(res){
        this.res=res;
        this.count = this.res.x * this.res.y*this.res.z;
    }

    //re-orient all of the slopes!
    //use the current this.slope function: this is updated somewhere else
    update(time, params){
        if ( this.vectors ) {//if its been initialized

            let coords, vF;
            for(let index = 0; index<this.count; index++) {

                //this.dummy.matrix.identity();

                //what point in the (x,y,z) are we at?
                coords = this.getCoords(index);
                this.dummy.position.set(coords.x, coords.y, coords.z);

                //get the vector field at this point
                vF = this.vectorField(coords, time, params);

                this.dummy.lookAt(coords.clone().add(vF));

                //
                //
                // //build in the rotational part of this matrix
                // //we are at the point coords: point us in the direction vF rel to
                // let phi = -Math.atan2(vF.x,vF.y);
                // this.dummy.rotateOnWorldAxis(new Vector3(0,0,1),phi);
                //
                // let l = new Vector2(vF.x,vF.y).length();
                // let theta = Math.atan2(vF.z,l);
                // this.dummy.rotateOnWorldAxis(new Vector3(0,1,0),theta);
                //
                //update the actual matrix at this point!!!
                this.dummy.updateMatrix();
                this.vectors.setMatrixAt(index, this.dummy.matrix);

                //set the color of this instance:
                let color = new Color().setHSL(1./Math.PI, 0.4, 0.6)
                this.vectors.setColorAt(index, color);

            }

            this.vectors.instanceMatrix.needsUpdate = true;
            this.vectors.instanceColor.needsUpdate = true;

        }

    }


}


export default VectorField3D;