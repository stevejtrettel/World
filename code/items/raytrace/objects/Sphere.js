import Object from "../Object.js";
import {Mesh, MeshPhysicalMaterial, SphereGeometry,Color} from "../../../../3party/three/build/three.module.js";
import TVec from "../TVec.js";

class Sphere extends Object{
    constructor(center,radius, mat) {
        super();

        //store the data
        this.center = center;
        this.radius = radius;
        this.mat = mat;

        //build the physical version
        let geom = new SphereGeometry(this.radius);
        let material = new MeshPhysicalMaterial({
            color: this.mat.color,
            roughness: this.mat.roughness,
            clearcoat:true,
        });
        if(this.mat.refractChance>0.){
            material.transmission = this.mat.refractChance;
            material.opacity = 1.;
            material.ior=1;
            material.thickness=1.;
        }

        this.mesh = new Mesh(geom,material);
        this.mesh.position.set(this.center.x,this.center.y,this.center.z);

    }


    sdf(pos){
        let dist = pos.clone().sub(this.center).length();
        return dist - this.radius;
    }

    getNormal(posOnSphere){
        let dir = posOnSphere.clone().sub(this.center);
        dir.normalize();
        return new TVec(posOnSphere,dir);
    }

}

export default Sphere;
