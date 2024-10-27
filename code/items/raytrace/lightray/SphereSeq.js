import {Mesh, MeshPhysicalMaterial, SphereGeometry,Object3D} from "../../../../3party/three/build/three.module.js"


class SphereSeq{
    constructor( maxN=50) {

        this.maxN = maxN;

        //fix the geometry of the balls
        let geo = new SphereGeometry(1, 32, 16);
        this.mat = new MeshPhysicalMaterial({
            color: 0xffffff,
            clearcoat:true,
            // opacity:0.2,
            // transparent:true,

            opacity:1,
            transmission:0.9,
            ior:1,
        });

        //build the initial list
        this.spheres = [];
        for(let i=0;i< this.maxN;i++){
            this.spheres.push(new Mesh(geo,this.mat));
        }

    }


    addToScene(scene){
       for(let i=0;i<this.maxN;i++){
          scene.add(this.spheres[i]);
       }
    }


    setData(pts,rad){
        this.pts = pts;
        this.rad = rad;

        this.N = pts.length;

        for(let i=0;i<this.maxN;i++){
            if(i<this.N){
                let p = this.pts[i];
                let r = this.rad[i];
                this.spheres[i].scale.set(r,r,r);
                this.spheres[i].position.set(p.x,p.y,p.z);
                this.spheres[i].visible=true;
            }
            else{
                this.spheres[i].visible=false;
            }
        }
    }


    setVisibility(N){
        //show only first N balls
        for(let i=0;i<this.maxN;i++){
            if(i<N){
                this.spheres[i].visible=true;
            }
            else{this.spheres[i].visible=false;}
        }
    }

    setColor(color){
        this.mat.color.setHex(color);
    }
}



export default SphereSeq;
