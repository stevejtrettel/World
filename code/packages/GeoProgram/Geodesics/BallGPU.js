import {
    Vector2,
    MeshPhysicalMaterial,
    MeshStandardMaterial,
    SphereGeometry,
    Mesh,
    InstancedMesh,
    DynamicDrawUsage,
    Object3D,
} from "../../../../3party/three/build/three.module.js";

function randomDisk(){
    let theta = 2*Math.PI * Math.random();
    let r2 = Math.random();
    let r = Math.sqrt(r2);
    return new Vector2(r*Math.cos(theta), r*Math.sin(theta));
}

class BallGPU {
    constructor(surface, numBalls, iniState, error ){
        this.surface = surface;
        this.numBalls = numBalls;
        this.iniState = iniState;
        this.error = error;

        let mat = new MeshPhysicalMaterial({
            color:0x000000,
            clearcoat:2,
        });
        let geom = new SphereGeometry(0.03,16,8);
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
            if(this.surface.stop(this.states[i].pos)) {
                this.states[i].pos = this.surface.findBoundary(this.states[i]);
                this.states[i] = this.surface.boundaryReflect(this.states[i]);
            }
            //for(let j=0;j<5;j++){
                this.surface.integrator.step(this.states[i]);
           // }
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



export default BallGPU;