import { UI } from "./Ui.js";
import { Loop } from "./Loop.js";
import { Resizer } from "./Resizer.js";
//import { Environment } from "./Environment.js";

import { createCamera } from "./components/createCamera.js";
import { createScene } from "./components/createScene.js";
import { createStats, placeStats } from "./components/createStats.js";
import { createControls } from "./components/createControls.js";
import {createPMREM, createRenderer} from "./components/createRenderer.js";


class World {

    constructor( container, options ) {

        this.container = container;
        this.renderer = createRenderer(options.renderer={});
        this.pmrem = createPMREM(this.renderer);

        //the renderer creates a canvas element: append it to the html
        this.container.append( this.renderer.domElement );

        this.camera = createCamera(options.camera);
        this.scene = createScene( options.environment.color );
        this.loop = new Loop( this.camera, this.scene, this.renderer);

        //set up the environment;
        this.environment = null;

        //set up the controls
        this.controls = createControls( this.camera, this.renderer.domElement, options.controls);
        this.loop.add( this.controls );


        if(options.stats) {
            this.stats = createStats();
            placeStats(this.stats);
        }
        else {
            this.stats = null;
        }

        this.ui = new UI();
        this.resizer = new Resizer( this.container, this.camera, this.renderer );

    }


    //---methods------


    addGlobalParams () {
        //takes in a list of global parameters to add to UI
    }



    addObjects ( objects ) {
        for( const [name, obj] of Object.entries(objects) ) {
            //obj.setName(`${name}`);
            obj.addToScene(this.scene);
            obj.addToUI(this.ui);

            //if the object has a nonempty tick() method, add to loop
            if(obj.tick){
                this.loop.add(obj);
            }
        }
    }

    setEnvironment ( env ) {
        this.scene.background = env.background;
        this.scene.environment = env.reflection;
    }

    addPostprocessor ( post ){
        //take in a postprocessor, add it to the rendering

    }

    render() {
        //render a single frame of World
        this.renderer.render( this.scene, this.camera );
    }

    start() {
        //start an animation cycle
        this.loop.start( this.stats );
    }

    stop() {
        //end an animation cycle
        this.loop.end();
    }

}


export { World };
