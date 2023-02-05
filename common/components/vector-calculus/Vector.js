import {
    MeshPhysicalMaterial,
    SphereBufferGeometry,
    Vector3,
    Mesh, CylinderBufferGeometry, ConeBufferGeometry,
    Group,
    Color,

} from "../../../3party/three/build/three.module.js";


let defaultColor = new Color().setHSL(0.2,0.5,0.5);

class Vector{
    constructor(dir, color=defaultColor, size=1) {

        this.base = new Vector3(0,0,0);
        this.dir = dir;
        this.length = this.dir.length();
        this.mat=new MeshPhysicalMaterial(
            {
                clearcoat:1,
                color: color,
            }
        );

        this.vec = new Group();

        let sphereGeom = new SphereBufferGeometry(0.2,32,16);
        let cylGeom = new CylinderBufferGeometry(0.1,0.1,this.length,8,1);
        let arrowGeom = new ConeBufferGeometry(0.2,0.3,16,1);

        this.sphere = new Mesh(sphereGeom,this.mat);

        this.cylinder = new Mesh(cylGeom,this.mat);
        this.cylinder.rotateX(Math.PI/2);
        this.cylinder.position.set(0,0,this.length/2);

        this.arrow = new Mesh(arrowGeom,this.mat);
        this.arrow.rotateX(Math.PI/2);
        this.arrow.position.set(0,0,this.length,);

        this.vec.add(this.sphere);
        this.vec.add(this.cylinder);
        this.vec.add(this.arrow);

        this.vec.lookAt(this.dir.x,this.dir.y,this.dir.z);

    }

    addToScene(scene){
        scene.add(this.vec);
    }


    setDir(dir){

        //save position
        let pos = this.vec.position.clone();
        //set position to zero: needed to make lookAT work correctly
        this.vec.position.set(0,0,0);

        this.dir=dir;
        this.length=this.dir.length();

        this.cylinder.geometry.dispose();
        this.cylinder.geometry = new CylinderBufferGeometry(0.1,0.1,this.length);
        this.cylinder.position.set(0,0,this.length/2);

        this.arrow.position.set(0,0,this.length);

        this.vec.lookAt(this.dir.x,this.dir.y,this.dir.z);


        //now re-set the position
        this.vec.position.set(pos.x,pos.y,pos.z);
    }

    setPos(pos){
        this.vec.position.set(pos.x,pos.y,pos.z);
    }

    setVisibility(value){
        this.vec.visible=value;
    }

}


export default Vector;