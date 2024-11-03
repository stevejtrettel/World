import {Mesh, MeshPhysicalMaterial, SphereGeometry,Object3D} from "../../../../3party/three/build/three.module.js"


let defaultOptions = {
    color: 0xffffff,
    radius:0.05,
};


class BallList{
    constructor(options=defaultOptions, maxN=1000) {

        this.maxN = maxN;

        this.radius = options.radius;
        this.color = options.color;

        //fix the geometry of the balls
        let geo = new SphereGeometry(this.radius, 32, 16);
        this.mat = new MeshPhysicalMaterial({
            color: this.color,
            clearcoat:true,
        });

        //build the initial list
        this.balls = [];
        for(let i=0;i< this.maxN;i++){
            this.balls.push(new Mesh(geo,this.mat));
        }


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

    setColor(color){
        this.mat.color.setHex(color);
    }
}



export default BallList;
