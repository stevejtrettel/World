import {
    Mesh,
    DoubleSide,
    MeshStandardMaterial,
    PlaneBufferGeometry,
} from "../../../3party/three/build/three.module.js"



class CsQuad {

    constructor( computeShader ) {

        //save the computeShader and run its initial condition
        this.compute = computeShader;
        this.compute.initialize();

        const geometry = new PlaneBufferGeometry(3,3);
        const material = new MeshStandardMaterial({side:DoubleSide});
        material.map = this.compute.getData();

        this.display = new Mesh(geometry, material);

        this.display.position.set(0,0,-3);

        this.name = null;

    }

    setName(name){
        this.name= name;
    }

    addToUI( ui ){

    }

    addToScene( scene ){
        scene.add(this.display);
    }

    tick() {
        //the compute system has been independently added to the scene, and is running
        this.compute.run();
        this.display.material.map = this.compute.getData();
    }

}


export { CsQuad };
