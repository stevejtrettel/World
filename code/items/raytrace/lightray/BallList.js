import {Mesh, MeshPhysicalMaterial, SphereGeometry,Object3D} from "../../../../3party/three/build/three.module.js"


let defaultOptions = {
    color: 0x000000,
    clearcoat: true,
    radius:0.1,
};


class BallList{
    constructor(pts,options=defaultOptions, maxN=1000) {

        this.maxN = maxN;
        this.options = options;

        //fix the geometry of the balls
        let geo = new SphereGeometry(options.radius, 32, 16);
        let mat = new MeshPhysicalMaterial(this.options);

        //build the initial list
        this.balls = [];
        for(let i=0;i< this.maxN;i++){
            this.balls.push(new Mesh(geo,mat));
        }

        //move them around and set visibility
        this.setPoints(pts);
    }



    addToScene(scene){
       for(let i=0;i<this.maxN;i++){
          scene.add(this.balls[i]);
       }
    }


    setPoints(pts){
        this.pts = pts;
        this.N = pts.length;

        for(let i=0;i<this.maxN;i++){
            if(i<this.N){
                let p = this.pts[i];
                this.balls[i].position.set(p.x,p.y,p.z);
                this.balls[i].visible=true;
            }
            else{
                this.balls[i].visible=false;
            }
        }
    }


    setVisibility(N){
        //show only first N balls
        for(let i=0;i<this.maxN;i++){
            if(i<N){
                this.balls[i].visible=true;
            }
            else{this.balls[i].visible=false;}
        }
    }
}



export default BallList;
