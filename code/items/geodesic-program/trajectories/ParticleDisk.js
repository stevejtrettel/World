import {
    Vector2,
    MeshPhysicalMaterial,
    SphereGeometry,
    InstancedMesh,
    DynamicDrawUsage,
    Object3D,
} from "../../../../3party/three/build/three.module.js";


import State from "../Surface/Integrators/States/State.js";

function randomDisk(){
    let theta = 2*Math.PI * Math.random();
    let r2 = Math.random();
    let r = Math.sqrt(r2);
    return new Vector2(r*Math.cos(theta), r*Math.sin(theta));
}


let defaultIntegratorOptions = {
    choice: 0,
    numBalls:1000,
    stopAtEdge: false,
    error: 0.1,
}

let defaultParticleOptions = {
    radius: 0.075,
    color: 0xffffff,
    flatten:false,
}

class ParticleDisk {
    constructor(
        surface,
        iniState,
        integratorOptions = defaultIntegratorOptions,
        particleOptions = defaultParticleOptions,
    ){

        this.surface = surface;

        this.integratorChoice = integratorOptions.choice;
        this.numBalls = integratorOptions.numBalls;
        this.stopAtEdge = integratorOptions.stopAtEdge;
        this.error = integratorOptions.error;

        this.flatten = particleOptions.flatten;

        this.iniState = iniState;
        this.error = 0.1;

        let mat = new MeshPhysicalMaterial({
            color:particleOptions.color,
            clearcoat:2,
        });
        let geom = new SphereGeometry(particleOptions.radius,16,8);
        this.balls = new InstancedMesh( geom, mat, this.numBalls );
        this.balls.instanceMatrix.setUsage( DynamicDrawUsage );
        this.dummy = new Object3D();

        this.states = new Array(this.numBalls);
        this.initialize();
    }

    setBallPosition(i){
        let state = this.iniState.clone();
        state.pos.add(randomDisk().multiplyScalar(this.error));
        state.vel.add(randomDisk().multiplyScalar(this.error));
        return state;
    }

    updateState(state){
        this.iniState= state;
        this.initialize();
    }

    updateSurface(){
        this.initialize();
    }

    initialize(){
        for(let i=0; i<this.numBalls;i++){

            this.states[i] = this.setBallPosition(i);

            let p;
            if(this.flatten){
                p = this.surface.domainParameterization(this.states[i].pos);
            }
            else{
                p = this.surface.parameterization(this.states[i].pos);
            }

            this.dummy.position.set(p.x,p.y,p.z);
            this.dummy.updateMatrix();
            this.balls.setMatrixAt( i, this.dummy.matrix );
        }
        this.balls.instanceMatrix.needsUpdate = true;
    }

    stepForward(){
        for(let i=0; i<this.numBalls; i++){

            if(this.stopAtEdge){
                if(!this.surface.stop(this.states[i].pos)) {
                    this.states[i] = this.surface.integrator[this.integratorChoice].step(this.states[i]);
                }
            }

            else{
                //reflect
                if(this.surface.stop(this.states[i].pos)) {
                    this.states[i].pos = this.surface.findBoundary(this.states[i]);
                    this.states[i] = this.surface.boundaryReflect(this.states[i]);
                }
                this.states[i] = this.surface.integrator[this.integratorChoice].step(this.states[i]);
            }

            let p;
            if(this.flatten){
                p = this.surface.domainParameterization(this.states[i].pos);
            }
            else{
                p = this.surface.parameterization(this.states[i].pos);
            }

            this.dummy.position.set(p.x,p.y,p.z);
            this.dummy.updateMatrix();
            this.balls.setMatrixAt( i, this.dummy.matrix );
        }
        this.balls.instanceMatrix.needsUpdate = true;
    }

    addToScene(scene){
        scene.add(this.balls);
    }

    chooseIntegrator(choice){
        this.integratorChoice=choice;
        this.initialize();
    }
}



export default ParticleDisk;
