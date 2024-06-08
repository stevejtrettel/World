import {
    CatmullRomCurve3,
    DoubleSide,
    Mesh,
    MeshPhysicalMaterial,
    SphereGeometry, TubeGeometry
} from "../../../3party/three/build/three.module.js";





class BallTrail{
    constructor(iniPos, radius, color, trailLength){
        this.pos = iniPos;
        this.radius = radius;

        this.trailLength = trailLength;
        this.trail = [];
        for(let i=0;i<this.trailLength;i++){
            this.trail.push(this.pos);
        }

        const planetMaterial = new MeshPhysicalMaterial(
            {
                color: color,
                clearcoat: 1,
            }
        );
        const planetGeometry = new SphereGeometry(this.radius,32,16);
        this.planetMesh = new Mesh(planetGeometry, planetMaterial);
        this.planetMesh.position.set(this.pos.x,this.pos.y,this.pos.z);


        const trailMaterial = new MeshPhysicalMaterial(
            {
                clearcoat:0.5,
                clearcoatRoughness: 0,

                side: DoubleSide,
                color: color,
            }
        );

        let trailCurve = new CatmullRomCurve3(this.trail);
        let trailGeometry = new TubeGeometry(trailCurve,this.trailLength,0.15*this.radius,8);
        this.trailMesh=new Mesh(trailGeometry, trailMaterial);

    }



    addToScene( scene ){
        scene.add(this.planetMesh);
        scene.add(this.trailMesh);
    }

    updatePos(pos){
        this.pos=pos;
        this.planetMesh.position.set(this.pos.x,this.pos.y,this.pos.z);

        //add pos to the trail, and pop off the earliest element
        this.trail.pop();
        this.trail.unshift(this.pos);
    }

    redrawTrail(){
        this.trailMesh.geometry.dispose();
        const curve = new CatmullRomCurve3(this.trail);
        this.trailMesh.geometry=new TubeGeometry(curve,this.trailLength,0.15*this.radius,8);
    }

}


export { BallTrail };
