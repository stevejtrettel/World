import{
    Vector3,
    MeshPhysicalMaterial,
    SphereGeometry,
    Mesh,
    DoubleSide,
} from "../../../3party/three/build/three.module.js";

import{
    RungeKutta,
} from "../../compute/cpu/RungeKutta.js";

import{
    State,
    dState
} from "../../compute/cpu/components/State.js";


//set up the integrator for the light-like geodesics.
function accel( state, bhCenter, bhMass=1 ){
    let pos = state.pos;
    let vel = state.vel;

    //the acceleration depends on a conserved quantity that looks like angular momentum
    let relPos = pos.clone().sub(bhCenter);
    let ang = relPos.clone().cross(vel);
    let L2 = ang.lengthSq();

    let R = relPos.length();

    let magnitude = - 3/2 * L2 /(R*R*R*R*R);
    let acc = relPos.clone().multiplyScalar( magnitude );

    return new dState(vel.clone(), acc);
};






//class for storing the info about a black hole
class BlackHole{
    constructor(mass=1, ep=0.01){

        //mass of the black hole
        this.mass=mass;

        this.ep=ep;

        //position of the black hole (default = origin)
        this.position = new Vector3(0,0,0);

        //radius of the event horizon (in natural units)
        this.radius = 2*this.mass;


        let ehMat = new MeshPhysicalMaterial(
            {
                color: 0x000000,
                clearcoat:0.5,
                roughness:0.75,
                metalness:1,
            }
        );

        let ehGeom = new SphereGeometry(this.radius,32,16);

        this.eventHorizon = new Mesh(ehGeom, ehMat);

        let phMat = new MeshPhysicalMaterial({
            roughness: 0,
            ior:1,
            transmission: 0.98,
            thickness: this.mass,
        });

        let phGeom = new SphereGeometry(3/2*this.radius, 64, 32);

        this.photonSphere = new Mesh(phGeom, phMat);

        this.derive = (state)=>accel(state,this.position, this.mass);
        this.nullIntegrator = new RungeKutta(this.derive, ep );

    }

    addToScene( scene ){
        scene.add(this.eventHorizon);
        scene.add(this.photonSphere);
    }

    updateMass( mass ){
        this.mass=mass;
        this.radius=2.*this.mass;
        this.derive = (state)=>accel(state, this.position, this.mass);

        this.eventHorizon.geometry.dispose();
        this.eventHorizon.geometry = new SphereGeometry(this.radius,32,16);

        this.photonSphere.geometry.dispose();
        this.photonSphere.geometry = new SphereGeometry(3/2*this.radius,32,16);
    }

}



export { BlackHole };
