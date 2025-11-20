import {
    LineCurve3,
    MeshPhysicalMaterial,
    SphereGeometry,
    TubeGeometry,
    Vector3,
    Mesh,
    Group,
    Color,
} from "../../../../3party/three/build/three.module.js";

export default class ValueRod extends Group{
    constructor(x,fn) {
        super();

        this.fn = fn;
        this.x =x;


        this.val = this.fn(x);

        this.start = new Vector3(x,0,0);
        this.end = new Vector3(x,this.val,0);

        this.color= 0x000000;
        // if(this.val>0) {
        //    this.color = 0x32a852;
        // }
        // else if (this.val<0.){
        //     this.color = 0xe05353;
        // }



        this.mat = new MeshPhysicalMaterial({color:this.color, clearcoat:1});

        let sphGeom = new SphereGeometry(0.15);

        this.startSphere = new Mesh(sphGeom, this.mat);
        this.startSphere.position.copy(this.start);
        this.endSphere = new Mesh(sphGeom, this.mat);
        this.endSphere.position.copy(this.end);
        this.line = new LineCurve3(this.start,this.end);
        let rodGeom = new TubeGeometry(this.line,1,0.1,8,false);
        this.rod = new Mesh(rodGeom,this.mat);

        this.add(this.rod);
        this.add(this.startSphere);
        this.add(this.endSphere);

    }


    update(x){
        if(x<-100){
            this.visible=false;
        }
        else{
            this.visible=true;
        }
        this.x = x;
        this.val = this.fn(this.x);

        this.start = new Vector3(x,0,0);
        this.end = new Vector3(x,this.val,0);


        if(this.val>0) {
            this.color = 0x32a852;
        }
        else if (this.val<0.){
            this.color = 0xe05353;
        }

        this.mat.color.set(this.color);


        this.startSphere.position.copy(this.start);
        this.endSphere.position.copy(this.end);

        this.line = new LineCurve3(this.start,this.end);
        this.rod.geometry.dispose();
        this.rod.geometry =new TubeGeometry(this.line,1,0.1,8,false);

    }

}
