import {
    Vector3,
    CatmullRomCurve3,
    CylinderBufferGeometry,
    Mesh,
    MeshPhysicalMaterial,
    TubeBufferGeometry,
    TextureLoader,
} from "../../3party/three/build/three.module.js";


function ctc(S){
    let s= 2*Math.PI *S;

    let a = 13/10;
    let b = 8/5;
    let n=4;

    let x = (a + Math.cos(s))*Math.cos(n*s);
    let y = (a + Math.cos(s))*Math.sin(n*s);
    let z = b*Math.sin(s);

    return new Vector3(x,z,-y);
}


class CTC{
    constructor(){


        const marble = new TextureLoader().load( '../../assets/textures/marble.jpeg' );
        const metal = new TextureLoader().load( '../../assets/textures/foil.webp' );


        let baseGeom = new CylinderBufferGeometry(3,3,0.75,128);
        let baseMat = new MeshPhysicalMaterial({
            clearcoat:0.75,
            roughness:0.1,
            map:marble,
            color:0x2b2b2b,

        });

        const materials = [
            baseMat,
            baseMat,
            baseMat
        ];
        this.base = new Mesh(baseGeom, materials);
        this.base.position.set(0,-1.75,0);

        let sampleRes=256;
        let pts = [];
        let s;
        for(let i=0; i<sampleRes;i++){
            s=i/sampleRes;
            pts.push( ctc(s) );
        }
        let curve = new CatmullRomCurve3(pts);
        let ctcGeom = new TubeBufferGeometry(curve, sampleRes,0.3,32,true);

        let ctcMat = new MeshPhysicalMaterial({
            metalness: 1,
            roughness:0.4,
            clearcoat:1,
            map:metal,
            color: 0xffffff,
        });

        this.ctc = new Mesh(ctcGeom, ctcMat);
        this.ctc.position.set(0,0.5,0);
    }

    addToScene( scene ){
        scene.add(this.base);
        scene.add(this.ctc);
    }

    addToUI(ui){}

    tick(time, dTime){
        this.ctc.rotateY(-0.015);
        this.base.rotateY(-0.015);
    }
}


let example = new CTC();

export default {example};