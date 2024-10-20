import {
    ConeGeometry,
    MeshPhysicalMaterial,
    Vector2,
    InstancedMesh,
    DynamicDrawUsage, Object3D
} from "../../../../3party/three/build/three.module.js";
import State from "../Integrators/States/State.js";






let defaultOptions = {
    color:0x211c66,
        //0xffffff,
    rows: 35,
    cols: 35,
    negate: true,
}

class GradientVF{
    constructor(surface, vfOptions = defaultOptions) {

        this.surface = surface;
        this.rows = vfOptions.rows;
        this.cols = vfOptions.cols;
        this.numVecs = this.rows * this.cols;
        this.negate = vfOptions.negate;

        //store the gradient values:
        //this.gradients = new Array(this.numVecs);

        //build the instanced mesh for display
        let geom = new ConeGeometry(0.1,1,16,1);
        let mat = new MeshPhysicalMaterial({
            clearcoat:1,
            color: vfOptions.color,
        });
        this.vectors = new InstancedMesh(geom,mat,this.numVecs);
        this.vectors.instanceMatrix.setUsage( DynamicDrawUsage );
        this.dummy = new Object3D();

        this.initialize();
    }

    setVecPosition(i){
        let rowPos = Math.floor(i/this.rows);
        let colPos = i-rowPos*this.rows;

        let deltaRow = (this.surface.domain.u.max-this.surface.domain.u.min)/this.rows;
        let deltaCol = (this.surface.domain.v.max-this.surface.domain.v.min)/this.cols;

        let u = this.surface.domain.u.min + deltaRow*rowPos;
        let v = this.surface.domain.v.min + deltaCol*colPos;

        u += deltaRow/2;
        v += deltaCol/2;

        return new Vector2(u,v);
    }


    initialize(){

        //set the positions, the gradient vectors
        for(let i=0; i<this.numVecs;i++){

            //the position
            let pos = this.setVecPosition(i);

            let grad = this.surface.gradient(pos);
            if(this.negate){
                grad.multiplyScalar(-1);
            }

           // WARNING: WE ARE DISPLAYING EVERYTHING WITH (X,Y,Z)->(X,Z,-Y):
            //NEED TO NEGATE FINAL COORDINATES BEFORE DISPLAYING
            pos.y = -pos.y;
            grad.y = -grad.y;

            //get the rotation angle this slope signifies:
            let theta = Math.atan2(grad.x, grad.y);

            //build a matrix on this.dummy that moves it to the position specified by coords
            this.dummy.position.set(pos.x,-4, pos.y);

            //build in the rotational part of this matrix

            this.dummy.rotation.z = -3.1415/2.; //started vertical: make point along the x axis
            //now rotate into position
            this.dummy.rotation.y = -3.1415/2.+theta;


            //set the original scale based on the resolution
            let deltaX = (this.surface.domain.u.max-this.surface.domain.u.min)/this.rows;
            let deltaY = (this.surface.domain.v.max-this.surface.domain.v.min)/this.cols;
            let size = Math.min(deltaX,deltaY);

            //set the scale based on the vectors magnitude:
            let mag = grad.length();
            let rescale = 3*Math.tanh(mag/2)+0.5;
            size = rescale*size;
            this.dummy.scale.set(size,size,size);

            // //set the color of this instance:
            // //use slope or xy data to do so?
            // let color = new Color().setHSL(theta/Math.PI, 0.4, 0.6)
            // //update the actual color at this point!
            // this.vectors.setColorAt(index, color);

            //update the actual matrix at this point!!!
            this.dummy.updateMatrix();
            this.vectors.setMatrixAt(i, this.dummy.matrix);


        }
        this.vectors.instanceMatrix.needsUpdate = true;

    }

    updateSurface(){
        this.initialize();
    }

    addToScene(scene){
        scene.add(this.vectors);
    }


}


export default GradientVF;
