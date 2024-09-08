import {
    CatmullRomCurve3,
    MeshPhysicalMaterial,
    TubeGeometry,
    Vector3,
    Mesh, SphereGeometry,
} from "../../../../3party/three/build/three.module.js";


class RodChain{
    constructor(params) {

        this.n = params.n||params.pts.length;
        this.radius = params.radius || 0.015;
        this.color = params.color || 0xffffff;

        if(params.hasOwnProperty('pts')) {
            this.pts = params.pts;
        }
        else{
            this.pts = [];
            for(let i =0; i< this.n; i++){
                this.pts.push(new Vector3(0,0,0))
            }
        }

        //create the material
        let matOptions={};
        this.mat = new MeshPhysicalMaterial(matOptions);

        //create the geometries
        this.rods = [];
        this.balls = [];
        let start, end, curve, geom, mesh;
        let sphGeom = new SphereGeometry(1.5*this.radius, 8,16);
        for( let i=1; i<this.n; i++){

            start = this.pts[i-1];
            end = this.pts[i];

            curve = new CatmullRomCurve3([start, end]);
            geom = new TubeGeometry(curve, 1 ,this.radius, 8);
            mesh = new Mesh(geom,this.mat);
            this.rods.push(mesh);

            mesh = new Mesh(sphGeom, this.mat);
            mesh.position.set(start.x,start.y,start.z);
            this.balls.push(mesh);
        }
        //add the final ball endpoint:
        mesh = new Mesh(sphGeom, this.mat);
        mesh.position.set(end.x,end.y,end.z);
        this.balls.push(mesh);


    }

    addToScene(scene){
        for(let i=1; i<this.n; i++){
            scene.add(this.rods[i]);
            scene.add(this.balls[i]);
        }
        //add the last ball:
        scene.add(this.balls[this.n]);
    }

    updatePts(pts){
        this.pts = pts;

        let start, end, curve;
        for( let i=1; i<this.n; i++){

            start = this.pts[i-1];
            end = this.pts[i];

            this.rods[i].geometry.dispose();
            curve = new CatmullRomCurve3([start, end]);
            this.rods[i].geometry = new TubeGeometry(curve, 1 ,this.radius, 8);
            this.balls[i].position.set(end.x,end.y,end.z);
        }
        //add the final ball endpoint:
        this.balls[this.n].position.set(end.x,end.y,end.z);
    }

    updateColor(color){
        this.mat.color.set(color);
    }



}


export default RodChain;
