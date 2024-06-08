import UI from "./Ui.js";
import Loop from "./Loop.js";


import {createContainer} from "./components/createContainer.js";
import { createCamera } from "./components/createCamera.js";
import { createScene } from "./components/createScene.js";
import { createStats, placeStats } from "./components/createStats.js";
import { createControls } from "./components/createControls.js";
import {createPMREM, createRenderer} from "./components/createRenderer.js";
import {setSize} from "./components/setSize.js";



class World {

    constructor( options ) {

        this.renderer = createRenderer(options.renderer={});
        this.pmrem = createPMREM(this.renderer);

        //create container and attach to renderer:
        this.container = createContainer(options.name);
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


        // set the size of the window:
        setSize( this.container, this.camera, this.renderer );
        window.addEventListener('resize', () => {
            setSize( this.container, this.camera, this.renderer );
        }, false );

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
        this.loop.stop();
    }

}


export default World;
