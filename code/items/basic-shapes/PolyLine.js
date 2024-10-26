
//extension of the Curve Class to piecewise linear curves

import {
    Curve,
    LineCurve3,
    MeshPhysicalMaterial,
    TubeGeometry,
    Vector3,
    CurvePath,
    Mesh,
    Group, SphereGeometry
} from "../../../3party/three/build/three.module.js";

// class PolyLine extends Curve{
//     constructor(pts) {
//         super();
//         this.setPoints(pts);
//     }
//
//     setPoints(pts){
//         this.pts = pts;
//         this.N = pts.length-1;
//     }
//
//     getPoint(t, optionalTarget = new Vector3()){
//
//         //parameter in the right segment: t is in [0,1], this new T is in [0,1] for the corresponding segment
//         t *= 0.999;//make it so t=1 doesn't occur
//         let i = Math.floor(this.N*t);
//         let T = this.N*t-i;
//
//
//         let p = this.pts[i];
//         let q = this.pts[i+1];
//
//
//         optionalTarget = p.clone().multiplyScalar(1-T).add(q.clone().multiplyScalar(T));
//         return optionalTarget;
//     }
//
// }
//
// export default PolyLine;
//
//
//
//
//
//
//




let defaultOptions = {
    color: 0xffffff,
    radius:0.1,
    clearcoat:true,
};


class PolyLine{

    constructor(pts,options = defaultOptions,maxN=100) {

        this.maxN=100;
        this.pts = pts;
        this.N = pts.length-1;
        this.options = options;


        let geom = new SphereGeometry();
        let mat = new MeshPhysicalMaterial({
            color:options.color,
            clearcoat: options.clearcoat,
        });

        //set up defaults
        this.rods =[];
        this.lines = [];
        for(let i=0;i<this.maxN;i++){
            this.lines.push(0);
            this.rods.push(new Mesh(geom,mat));
        }

        //build the actual segments
        this.buildSegments();

    }

    buildSegments(){
        this.lines = [];
        for(let i=0;i<this.maxN;i++){
            if(i<this.N) {
                let line = new LineCurve3(this.pts[i], this.pts[i + 1]);
                this.lines[i] = line;
                this.rods[i].geometry.dispose();
                this.rods[i].geometry = new TubeGeometry(line, 1, this.options.radius, 8, false);
                this.rods[i].visible =true;
            }
            else{
                this.rods[i].visible=false;
            }
        }
    }

    setPoints(pts){
        this.pts = pts;
        this.N = pts.length;
        this.buildSegments();
    }


    addToScene(scene){
        for(let i=0;i<this.maxN;i++){
            scene.add(this.rods[i]);
        }
    }
}


export default PolyLine;
