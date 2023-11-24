import {
    CatmullRomCurve3,
    DoubleSide,
    Mesh,
    MeshPhysicalMaterial,
    SphereBufferGeometry, TubeBufferGeometry
} from "../../../3party/three/build/three.module.js";
import {randomVec3Ball} from "../../utils/math/random.js";


class Planet{
    constructor(options){
        this.pos = options.pos;
        this.vel = options.vel;
        this.mass = options.mass;
        this.radius = 0.75*Math.pow(this.mass, 0.333);

        this.trailLength = options.trailLength;
        this.trail = [];
        for(let i=0;i<this.trailLength;i++){
            this.trail.push(this.pos);
        }

        const planetMaterial = new MeshPhysicalMaterial(
            {
                color: options.color,
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

                opacity:0,
                transmission:0.5,
                ior:1.2,

                side: DoubleSide,
                color: options.color,
            }
        );

        let trailCurve = new CatmullRomCurve3(this.trail);
        let trailGeometry = new TubeBufferGeometry(trailCurve,2.*this.trailLength,0.15*this.radius,8);
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
        this.trailMesh.geometry=new TubeBufferGeometry(curve,this.trailLength,0.15*this.radius,8);
    }

    setMass( newMass ){
        this.mass = newMass;
        this.radius = 0.3*Math.pow(this.mass, 0.333);
        this.planetMesh.geometry.dispose();
        this.planetMesh.geometry = new SphereBufferGeometry(this.radius, 32,16);
    }

    resetTrail(){
        this.trail=[];
        for(let i=0;i<this.trailLength;i++){
            this.trail.push(this.pos.clone());
        }
    }

    reset(spaceRad=3,velRad=1){
        this.pos=randomVec3Ball(spaceRad);
        this.vel=randomVec3Ball(velRad);
        this.resetTrail();
    }


}


export default Planet;