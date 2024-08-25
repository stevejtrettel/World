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


let defaultIntegratorOptions = {
    choice: 0,
    rows: 20,
    cols:20,
    stopAtEdge:false,
}

let defaultParticleOptions = {
    color: 0xffffff,
    radius: 0.075,
    flatten:false,
}


class ParticleGrid {
    constructor(
        surface,
        integratorOptions = defaultIntegratorOptions,
        particleOptions = defaultParticleOptions,
        ){

        this.surface = surface;

        this.integratorChoice = integratorOptions.choice;
        this.rows = integratorOptions.rows;
        this.cols = integratorOptions.cols;
        this.numBalls = this.rows * this.cols;
        this.stopAtEdge = integratorOptions.stopAtEdge;

        //show in domain, or on graph
        this.flatten=particleOptions.flatten;

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

    updateState(state){
        this.iniState= state;
        this.initialize();
    }

    updateSurface(){
        this.initialize();
    }

    setBallPosition(i){
        let rowPos = Math.floor(i/this.rows);
        let colPos = i-rowPos*this.rows;

        let deltaRow = (this.surface.domain.u.max-this.surface.domain.u.min)/this.rows;
        let deltaCol = (this.surface.domain.v.max-this.surface.domain.v.min)/this.cols;

        let u = this.surface.domain.u.min + deltaRow*rowPos;
        let v = this.surface.domain.v.min + deltaCol*colPos;

        u += deltaRow/2;
        v += deltaCol/2;

        return new Vector2(u,v);
    }


    initialize(){
        for(let i=0; i<this.numBalls;i++){

            let pos = this.setBallPosition(i);
            let vel = new Vector2(0,0);
            let state = new State(pos, vel);
            this.states[i] = state;

            let p;
            if(this.flatten){
                p = this.surface.domainParameterization(state.pos);
            }
            else{
                p = this.surface.parameterization(state.pos);
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

    chooseIntegrator(choice){
        this.integratorChoice = choice;
        this.initialize();
    }

    setGridSize(rows,cols){
        this.rows = rows;
        this.cols = cols;
        this.initialize();
    }

    addToScene(scene){
        scene.add(this.balls);
    }



}



export default ParticleGrid;
