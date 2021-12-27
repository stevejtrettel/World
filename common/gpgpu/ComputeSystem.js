//A compute system is a collection of ComputeShaders
// (position,velocity,etc) that all work together


class ComputeSystem {

    constructor( ) {

        //
        // //simulations is a list of shaders and their shared uniforms
        // let simShaders = simulations.shaders;
        // let simUniforms = simulations.uniforms;
        //
        // //initialization is also a list of shaders together with their shared uniforms
        // let iniShaders = initializations.shaders;
        // let iniUniforms = initializations.uniforms;
        //
        //




    }








    updateUniforms() {
        //whatever we need to do here

    }


    setData( dat ) {

    }

    getData(){

    }

    run() {

    }

    initialize() {

    }


    setName( name ){
        this.name = name;
    }

    addToUI( ui ){

    }

    addToScene( scene ) {

    }

    tick(){
        //if you add the compute shader to the scene it'll run
        //this.run();
    }



}


export { ComputeSystem };
