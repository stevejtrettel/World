import {
    Vector2,
    MeshPhysicalMaterial,
    SphereGeometry,
    InstancedMesh,
    DynamicDrawUsage,
    Object3D,
} from "../../../../3party/three/build/three.module.js";

import State from "../Surface/Integrators/States/State.js";


function placeBall(i, domain, row, col){
    let rowPos = Math.floor(i/row);
    let colPos = i-rowPos*row;

    let deltaRow = (domain.u.max-domain.u.min)/row;
    let deltaCol = (domain.v.max-domain.v.min)/col;

    let u = domain.u.min + deltaRow*rowPos+deltaRow/2;
    let v = domain.v.min + deltaCol*colPos+deltaCol/2;

    return new Vector2(u,v);
}



class ParticleGrid {
    constructor(surface, integratorChoice=0, array=[30,30]){

        this.surface = surface;
        this.integratorChoice = integratorChoice;
        this.array = array;
        this.numBalls = array[0]*array[1];
        this.stopAtEdge = false;

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

            let pos = placeBall(i,this.surface.domain,this.array[0],this.array[1]);
            let vel = new Vector2(0,0);
            let state = new State(pos, vel);
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



export default ParticleGrid;
