import {
    Mesh,
    DoubleSide,
    MeshStandardMaterial,
    PlaneBufferGeometry,
} from "../../../3party/three/build/three.module.js"



class CsysQuad {

    constructor( computeSystem ) {

        //save the computeShader and run its initial condition
        this.compute = computeSystem;
        this.compute.initialize();

        this.names = this.compute.names;

        this.displayData = null;

        const geometry = new PlaneBufferGeometry(3,3);
        this.material = new MeshStandardMaterial({side:DoubleSide});
        this.material.map = this.displayData;

        this.display = new Mesh(geometry, this.material);

        this.display.position.set(0,0,-3);

        this.params = {chooseData: this.names[0]};

        this.name = null;

    }

    setName(name){
        this.name= name;
    }

    addToUI( ui ){
        ui.add(this.params, 'chooseData',{'position' : `${this.names[0]}`, 'velocity' : `${this.names[1]}`});
    }

    addToScene( scene ){
        scene.add(this.display);
    }

    tick() {
        //the compute system has been independently added to the scene, and is running
        //then we don't need / want to run it here
        //otherwise, enable this next line!
        //this.compute.run();
        let data = this.compute.getData();
        this.material.map = data[this.params.chooseData];
        console.log(this.material.map);
    }

}







class CsQuad {

    constructor( computeShader ) {

        //save the computeShader and run its initial condition
        this.compute = computeShader;
        this.compute.initialize();

        const geometry = new PlaneBufferGeometry(3,3);
        const material = new MeshStandardMaterial({side:DoubleSide});
        //material.map = this.compute.getData();

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
        //then we don't need / want to run it here
        //otherwise, enable this next line!
        //this.compute.run();
        this.display.material.map = this.compute.getData();
    }

}



export { CsQuad, CsysQuad };
