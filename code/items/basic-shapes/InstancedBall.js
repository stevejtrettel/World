import {InstancedMesh, MeshPhysicalMaterial, SphereGeometry,Object3D} from "../../../3party/three/build/three.module.js";


let defaultOptions = {
    color: 0x000000,
    clearcoat: true,
    radius:0.1,
};


class InstancedBall{
    constructor(pts,options=defaultOptions, maxN=1000) {

        this.maxN = maxN;
        this.options = options;


        let geo = new SphereGeometry(options.radius, 32, 16);
        let mat = new MeshPhysicalMaterial(this.options);
        this.balls = new InstancedMesh(geo, mat, this.maxN);

        this.dummy = new Object3D();

        this.setPoints(pts);
    }



    addToScene(scene){
        scene.add(this.balls);
    }


    setPoints(pts){

        this.pts = pts;
        this.N = pts.length;
        let p;

        for(let i=0;i<this.maxN;i++){

            if(i<this.N){
                p = this.pts[i];
            }
            else{
                p = this.pts[0];
            }

            this.dummy.position.set(p.x,p.y,p.z);
            this.dummy.updateMatrix();
            this.balls.setMatrixAt( i, this.dummy.matrix );
        }

        this.balls.instanceMatrix.needsUpdate=true;
    }
}



export default InstancedBall;
