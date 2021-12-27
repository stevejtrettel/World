import {
    MeshStandardMaterial,
    PlaneBufferGeometry,
    ShaderMaterial,
    Vector2,
} from "../../3party/three/build/three.module.js";

import {FullScreenQuad} from "./FullScreenQuad";
import {ComputeRenderTargets} from "./ComputeRTs";


class ComputeShader {

    constructor( resolution, simulation, initialCondition, renderer ){

        //the resolution of the simulation
        this.res = resolution;
        const resVector = new Vector2(resolution[0], resolution[1]);

        //save the renderer
        this.renderer=renderer;


        //the initial condition computations
        this.iniUniforms = {
            res: {value: resVector},
            ...initialCondition.uniforms,
        };
        let iniMat = new ShaderMaterial(
            {
                fragmentShader: initialCondition.shader,
                uniforms: this.iniUniforms,
            }
        );
        this.ini = new FullScreenQuad( iniMat );


        //the simulation computations
        this.simUniforms = {
            res: {value: resVector},
            frameNumber: {value: 0},
            data: {value: null },
            ...simulation.uniforms
        };
        let simMat = new ShaderMaterial(
            {
                fragmentShader: simulation.shader,
                uniforms: this.simUniforms,
            }
        );
        this.sim = new FullScreenQuad( simMat );



        //the render targets
        this.rts = new ComputeRenderTargets( this.res );


        //where the result is stored
        this.data = null;

    }


    updateUniforms() {
        //whatever we need to do here
        this.simUniforms.frameNumber.value +=1;
    }


    setData( dat ) {
        this.data=dat;
    }

    getData(){
        return this.data;
    }

    run() {
        //do one cycle of the computation
        this.rts.render( this.sim, this.renderer );
        this.data = this.rts.data;
        this.updateUniforms();
    }

    initialize() {
        this.rts.render( this.ini, this.renderer );
        this.data = this.rts.data;
    }

    // getDebugQuad(){
    //
    //     const geometry = new PlaneBufferGeometry(2,2);
    //     const material = new MeshStandardMaterial({side:DoubleSide} );
    //     material.map = this.getData();
    //     const mesh = new Mesh(geometry, material);
    //     mesh.position.set(0,0,-3);
    //
    //     //patch in the necessary functions:
    //     mesh.setName = ()=>{};
    //     mesh.addToScene = (scene) => scene.add(mesh);
    //     mesh.addToUI = ()=>{};
    //
    //     //send it
    //     return mesh;
    // }

}


export { ComputeShader };
