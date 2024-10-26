import Object from "../Object.js";
import {BoxGeometry, Mesh, MeshPhysicalMaterial,} from "../../../../3party/three/build/three.module.js";
import TVec from "../TVec.js";

class Wall extends Object{
    constructor(pt, normal, mat) {
        super();

        this.pt = pt;
        this.normal = normal;
        this.mat = mat;

        let boxSize = 10;
        let geom;
        if(Math.abs(normal.x) == 1){
            geom = new BoxGeometry(0.1,boxSize,boxSize);
        }
        else if(Math.abs(normal.y) == 1){
            geom = new BoxGeometry(boxSize,0.1,boxSize);
        }
        else{
            geom = new BoxGeometry(boxSize, boxSize,0.1);
        }
        let material = new MeshPhysicalMaterial({

        });
        this.mesh = new Mesh(geom,material);
        this.mesh.position.set(this.pt.x,this.pt.y,this.pt.z);

    }


    sdf(pos){

        //relative position
        let rel = pos.clone().sub(this.pt);
        //project onto normal vector
        return this.normal.dot(rel);
    }

    getNormal(pos){
        return new TVec(pos,this.normal);
    }

}


export default Wall;
