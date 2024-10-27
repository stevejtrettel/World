
import {
    LineCurve3,
    MeshPhysicalMaterial,
    TubeGeometry,
    Mesh,
    SphereGeometry
} from "../../../../3party/three/build/three.module.js"


let defaultOptions = {
    color: 0xffffff,
    radius:0.1,
};


class PolyLine{

    constructor(options = defaultOptions,maxN=100) {

        this.maxN=maxN;


        this.radius = options.radius;
        this.color = options.color;


        let geom = new SphereGeometry();
        this.mat = new MeshPhysicalMaterial({
            color:options.color,
            clearcoat: true,
        });

        //set up defaults
        this.rods =[];
        this.lines = [];
        for(let i=0;i<this.maxN;i++){
            this.lines.push(0);
            this.rods.push(new Mesh(geom,this.mat));
        }


    }

    buildSegments(){
        this.lines = [];
        for(let i=0;i<this.maxN;i++){
            if(i<this.N) {
                let line = new LineCurve3(this.pts[i], this.pts[i + 1]);
                this.lines[i] = line;
                this.rods[i].geometry.dispose();
                this.rods[i].geometry = new TubeGeometry(line, 1, this.radius, 8, false);
                this.rods[i].visible =true;
            }
            else{
                this.rods[i].visible=false;
            }
        }
    }

    setPoints(pts){
        this.pts = pts;
        this.N = pts.length-1;
        this.buildSegments();
    }

    setVisibility(N){
        //show only first N rods
        for(let i=0;i<this.maxN;i++){
            if(i<N){
                this.rods[i].visible=true;
            }
            else{this.rods[i].visible=false;}
        }
    }


    addToScene(scene){
        for(let i=0;i<this.maxN;i++){
            scene.add(this.rods[i]);
        }
    }

    setColor(color){
        this.mat.color.setHex(color);
    }


}


export default PolyLine;
