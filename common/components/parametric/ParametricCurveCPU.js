
//a class to draw parametric curves with nice spheres on the end, given a function and domain
//this is NOT fast (it doesn't use the GPU materials or anything), so don't use it if you're updating every frame...

import {
    MeshPhysicalMaterial,
    SphereBufferGeometry,
    Mesh,
    CatmullRomCurve3,
    TubeBufferGeometry,
} from "../../../3party/three/build/three.module.js";

class ParametricCurveCPU {
    constructor(curve, domain, options={}) {

        this.curveFn = curve;
        this.domain = domain;
        this.radius = options.radius || 0.05;
        this.color = options.color || 0xffffff;
        this.res = options.res || 64;

        this.rescaleT = function(u){
            return domain.min + u * (domain.max-domain.min);
        }

        let sphGeo = new SphereBufferGeometry(1.25*this.radius,32,16);
        let mat = new MeshPhysicalMaterial({
            clearcoat:1,
            color: this.color,
        });

        this.tube = new Mesh(this.createTube(), mat);


        this.start = new Mesh(sphGeo, mat);
        let startPt = this.curvePts.getPoint(0);
        this.start.position.set(startPt.x,startPt.y,startPt.z);

        this.end = new Mesh(sphGeo, mat);
        let endPt = this.curvePts.getPoint(1);
        this.end.position.set(endPt.x,endPt.y,endPt.z)
    }

    createTube(params){
        let pts = [];
        for(let i=0;i<this.res+1;i++){
            let t = this.rescaleT(i/this.res);
            pts.push(this.curveFn(t,params));
        }
        console.log(pts);
        this.curvePts = new CatmullRomCurve3(pts);
        return new TubeBufferGeometry(this.curvePts, 2.*this.res,this.radius,16,false);
    }



    addToScene(scene){
        scene.add(this.tube);
        scene.add(this.start);
        scene.add(this.end);
    }

    setDomain(domain){
        this.domain = domain;
        this.rescaleT = function(u){
            return domain.min + u * (domain.max-domain.min);
        }
    }

    setCurve(curve){
        this.curveFn = curve;
    }

    setVisibility(value){
        this.tube.visible=value;
        this.start.visible=value;
        this.end.visible=value;
    }

    setPosition(x,y,z){
        this.tube.position.set(x,y,z);
        this.start.position.set(x,y,z);
        this.end.position.set(x,y,z);
    }

    update(params){
        this.tube.geometry.dispose();
        this.tube.geometry = this.createTube(params);

        let startPt = this.curvePts.getPoint(0);
        this.start.position.set(startPt.x,startPt.y,startPt.z);

        let endPt = this.curvePts.getPoint(1);
        this.end.position.set(endPt.x,endPt.y,endPt.z)

    }
}



export default ParametricCurveCPU;