import {createCamera} from "../components/createCamera.js";
import {createScene} from "../components/createScene.js";
import {createRenderer} from "../components/createRenderer.js";
import {createStats} from "../components/createStats.js";
import {UI} from "./Ui.js";
import {Loop} from "./Loop.js";
import {Resizer} from "./Resizer.js";


class World {

    constructor( container, renderer, options ) {

        this.container = container;
        this.renderer = renderer;
        //the renderer creates a canvas element: append it to the html
        this.container.append(this.renderer.domElement);


        this.camera = createCamera();
        this.scene = createScene(options.color);
        this.loop = new Loop( this.camera, this.scene, this.renderer);

        this.stats = createStats();
        this.ui = new UI();
        this.resizer = new Resizer(this.container, this.camera, this.renderer );

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
