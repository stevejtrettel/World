import {
    CatmullRomCurve3,
    Mesh,
    MeshPhysicalMaterial,
    TubeGeometry,
    Vector3
} from "../../../3party/three/build/three.module.js"

class Helix{
    constructor(rad=0.25, thickness=0.05, twists=10,length=1){

        this.rad = 0.25;
        this.thickness =0.05;
        this.numTwists = 10;
        this.length = 1.;

        let geom = this.createGeom(this.length);
        let mat = new MeshPhysicalMaterial();
        this.spring = new Mesh(geom,mat);
    }


    createGeom(L){
        let pts = [];
        for(let i=0; i<256;i++){
            let percent = i/256.;
            let h = (2* percent-1.)*this.length;
            let theta = 2.*Math.PI*this.numTwists*percent;

            let pt = new Vector3(this.rad*Math.cos(theta), h, this.rad*Math.sin(theta));
            pts.push(pt);
        }
        let path = new CatmullRomCurve3(pts);
        let springGeom = new TubeGeometry(path,256,this.thickness,8,false);
        return springGeom;
    }


    addToScene(scene){
        scene.add(this.spring);
    }

    setLength(L){
        this.length = L;
        this.spring.geometry.dispose();
        this.spring.geometry = this.createGeom(this.length);
    }

    setPosition(x,y,z){
        this.spring.position.set(x,y,z);
    }

}


export default Helix;
