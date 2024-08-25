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

class ParticleDisk {
    constructor(surface, integratorChoice=0, numBalls=1000){

        this.surface = surface;
        this.integratorChoice = integratorChoice;
        this.numBalls = numBalls;

        this.stopAtEdge = false;

        this.iniState = new State(new Vector2(0.2,0.3),new Vector2(0.03,0.5));
        this.error = 0.1;

        let mat = new MeshPhysicalMaterial({
            color:0xffffff,
            clearcoat:2,
        });
        let geom = new SphereGeometry(0.075,16,8);
        this.balls = new InstancedMesh( geom, mat, this.numBalls );
        this.balls.instanceMatrix.setUsage( DynamicDrawUsage );
        this.dummy = new Object3D();

        this.states = new Array(this.numBalls);
        this.initialize();
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
            let state = this.iniState.clone();
            state.pos.add(randomDisk().multiplyScalar(this.error));
            state.vel.add(randomDisk().multiplyScalar(this.error));
            this.states[i] = state;
            let p = this.surface.parameterization(state.pos);
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


            let p = this.surface.parameterization(this.states[i].pos);
            this.dummy.position.set(p.x,p.y,p.z);
            this.dummy.updateMatrix();
            this.balls.setMatrixAt( i, this.dummy.matrix );
        }
        this.balls.instanceMatrix.needsUpdate = true;
    }

    addToScene(scene){
        scene.add(this.balls);
    }
}



export default ParticleDisk;
