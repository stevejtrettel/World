import {
    Mesh,
    DoubleSide,
    MeshStandardMaterial,
    PlaneBufferGeometry,
} from "../../../3party/three/build/three.module.js"



class CSQuad {

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
    }

}





export { CSQuad };
