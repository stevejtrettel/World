import Object from "../Object.js";
import {BoxGeometry, Mesh, MeshPhysicalMaterial,Vector3} from "../../../../3party/three/build/three.module.js";
import TVec from "../TVec.js";

class Wall extends Object{
    constructor(pt, normal, mat) {
        super();

        this.pt = pt;
        this.normal = normal;
        this.mat = mat;

        let boxSize = 10;
        let geom;
        if(Math.abs(normal.x) === 1){
            geom = new BoxGeometry(0.1,boxSize,boxSize);
        }
        else if(Math.abs(normal.y) === 1){
            geom = new BoxGeometry(boxSize,0.1,boxSize);
        }
        else{
            geom = new BoxGeometry(boxSize, boxSize,0.1);
        }
        let material = new MeshPhysicalMaterial({
            color: this.mat.properties.color,


            //make walls slightly transparent to help with visualization
            opacity:1,
            transmission: 0.5,
            ior:1,
        });
        this.mesh = new Mesh(geom,material);



        //depending on which wall, offset a little bit too because of the thickness:
        if(Math.abs(normal.x) === 1){
            this.mesh.position.set(this.pt.x-0.05*normal.x,this.pt.y,this.pt.z);
        }
        else if(Math.abs(normal.y) === 1){
            this.mesh.position.set(this.pt.x,this.pt.y-0.05*normal.y,this.pt.z);
        }
        else{
            this.mesh.position.set(this.pt.x,this.pt.y,this.pt.z-0.05*normal.z);
        }

    }


    sdf(pos){

        //relative position
        let rel = pos.clone().sub(this.pt);
        //project onto normal vector
        return this.normal.dot(rel);
    }

    getNormal(pos){
        let tv = new TVec(pos.clone(),this.normal.clone());
        return tv;
    }

}


export default Wall;
