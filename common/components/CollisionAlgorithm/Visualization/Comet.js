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
    constructor(iniPos, radius, color, length){
        this.pos = iniPos;
        this.radius = radius;

        //build a tail of the right length, all at the starting point
        this.length = length;
        this.tail = [];
        for(let i=0;i<this.length;i++){
            this.tail.push(this.pos);
        }

        const cometMaterial = new MeshPhysicalMaterial(
            {
                color: color,
                clearcoat: 1,
                side: DoubleSide,
            }
        );
        const nucleusGeometry = new SphereBufferGeometry(this.radius,32,16);
        this.nucleusMesh = new Mesh(nucleusGeometry, cometMaterial);
        this.nucleusMesh.position.set(this.pos.x,this.pos.y,this.pos.z);

        let tailCurve = new CatmullRomCurve3(this.tail);
        let tailGeometry = new TubeBufferGeometry(tailCurve,this.length,0.15*this.radius,8);
        this.tailMesh=new Mesh(tailGeometry, cometMaterial);

    }


    //add the comet to a scene
    addToScene( scene ){
        scene.add(this.nucleusMesh);
        scene.add(this.tailMesh);
    }


    resize(rad){
        this.radius=rad;
        this.nucleusMesh.geometry.dispose();
        this.nucleusMesh.geometry=new SphereBufferGeometry(this.radius,32,16);
    }

    //move the comet forward, adding one new position to the list
    //and removing the oldest.
    updatePos(pos){
        this.pos=pos;
        this.nucleusMesh.position.set(this.pos.x,this.pos.y,this.pos.z);

        //add pos to the trail, and pop off the earliest element
        this.tail.pop();
        this.tail.unshift(this.pos);
    }

    //delete the current geometry of the tail, and create a new one
    //since the points have been updated.
    redrawTail(){
        this.tailMesh.geometry.dispose();
        const curve = new CatmullRomCurve3(this.tail);
        this.tailMesh.geometry=new TubeBufferGeometry(curve,this.length,0.15*this.radius,8);
    }

}



export { Comet };

