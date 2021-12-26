


class World {

    constructor( container, renderer, options ) {
        this.camera = null;
        this.scene = null;
        this.renderer = null;
        this.stats = null;
        this.ui = null;
        this.loop = null;
        this.resizer = null;

    }


    //---methods------

    addObjects ( objects ) {
        //take in a list of objects and add them to the world
        let name,obj;


        for( const [name, obj] of Object.entries(objects) ) {
            obj.setName(`${name}`);
            obj.addToScene(this.scene);
            obj.addToUI(this.ui);

            //if the object has a nonempty tick() method, add to loop
            if(obj.tick()){
                this.loop.add(obj);
            }
        }
    }

    addEnvironment ( environment ) {
        //take in an environment (bkg/envmap) and set it for the scene

    }

    addPostprocessor ( post ){
        //take in a postprocessor, add it to the rendering

    }






    render() {
        //render a single frame of World

    }

    start() {
        //start an animation cycle

    }

    stop() {
        //end an animation cycle
    }

}


export { World };
