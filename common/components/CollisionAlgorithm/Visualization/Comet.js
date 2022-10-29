import {
    CatmullRomCurve3,
    DoubleSide,
    Mesh,
    MeshPhysicalMaterial,
    SphereBufferGeometry, TubeBufferGeometry
} from "../../../../3party/three/build/three.module.js";




//a class for visualizing the trajectory of an individual ball within the system
//shows a sphere with a small trail, tracking previous positions of the sphere



class Comet{

    //comet takes as input the initial position of the sphere
    //and the auxilary data on how to draw it
    constructor(iniPos, radius, color, trailLength){
        this.pos = iniPos;
        this.radius = radius;

        //build a tail of the right length, all at the starting point
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
        const planetGeometry = new SphereBufferGeometry(this.radius,32,16);
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
        let trailGeometry = new TubeBufferGeometry(trailCurve,this.trailLength,0.15*this.radius,8);
        this.trailMesh=new Mesh(trailGeometry, trailMaterial);

    }


    //add the comet to a scene
    addToScene( scene ){
        scene.add(this.planetMesh);
        scene.add(this.trailMesh);
    }

    //move the comet forward, adding one new position to the list
    //and removing the oldest.
    updatePos(pos){
        this.pos=pos;
        this.planetMesh.position.set(this.pos.x,this.pos.y,this.pos.z);

        //add pos to the trail, and pop off the earliest element
        this.trail.pop();
        this.trail.unshift(this.pos);
    }

    //delete the current geometry of the tail, and create a new one
    //since the points have been updated.
    redrawTrail(){
        this.trailMesh.geometry.dispose();
        const curve = new CatmullRomCurve3(this.trail);
        this.trailMesh.geometry=new TubeBufferGeometry(curve,this.trailLength,0.15*this.radius,8);
    }

}



export { Comet };

