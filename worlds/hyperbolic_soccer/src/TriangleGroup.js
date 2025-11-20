import {Matrix3,Vector3} from "../../../3party/three/build/three.module.js";


let cox = (p)=>{return -Math.cos(Math.PI/p);}

export default class TriangleGroup{
    constructor(p,q,r) {
        this.p = p;
        this.q = q;
        this.r = r;

        //make the coxeter matrix;
        this.B = new Matrix3().set(
           cox(1),cox(2), cox(3),
            cox(2), cox(1), cox(7),
            cox(3), cox(7), cox(1),
        );

        //the normals to the hyperplanes defining edges
        this.n1 = new Vector3(1,0,0);
        this.n2 = new Vector3(0,1,0);
        this.n3 = new Vector3(0,0,1);

        //dot
        this.dot = (v,w)=>{
            let V = v.applyMatrix3(this.B);
            return V.dot(w);
        }
        //normalize
        this.normalize = (v)=>{return v.clone().divideScalar(this.dot(v,v))}


        //the reflections
        this.R1 = (v)=>{
            let proj = this.dot(v,this.n1)/this.dot(this.n1,this.n1);
            let comp = this.n1.clone().multiplyScalar(proj)
            return v.clone().sub(comp)
        }

        this.R2 = (v)=>{
            let proj = this.dot(v,this.n2)/this.dot(this.n2,this.n2);
            let comp = this.n2.clone().multiplyScalar(proj)
            return v.clone().sub(comp)
        }

        this.R3 = (v)=>{
            let proj = this.dot(v,this.n3)/this.dot(this.n3,this.n3);
            let comp = this.n3.clone().multiplyScalar(proj)
            return v.clone().sub(comp)
        }



        //the vertices of EDGE1
        this.hexEdge = [];

        //the vertices of EDGE2
        this.heptEdge = [];




    }
}
