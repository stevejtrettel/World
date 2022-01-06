import {Clock} from "../../3party/three/build/three.module.js";


class Loop {

    constructor ( camera, scene, renderer ) {

        this.updatables = [];
        this.camera = camera;
        this.scene = scene;
        this.renderer = renderer;

        this.clock = new Clock();

        //make the camera updatable:
        // if( camera.tick ){
        //     this.updatables.push(camera);
        // }
    }

    start ( stats = null) {
        this.renderer.setAnimationLoop(
            () => {

                // tell every animated object to tick forward one frame
                this.tick();

                if(stats) {
                    stats.update();
                }

                // render a frame
                this.renderer.setRenderTarget(null);
                this.renderer.render( this.scene, this.camera );
            }
        );
    }

    //method: stopping the animation loop
    stop(){
        this.renderer.setAnimationLoop( null );
    }

    //place a new object on the list of updatables
    add(obj){
        this.updatables.push( obj );
    }

    //method: update everything one tick forward in time
    tick() {

        //get time since last frame
        const time = this.clock.elapsedTime;
        const dtime = this.clock.getDelta();

        //use this to update each object one tick forwards
        for( const object of this.updatables ) {
            object.tick(time, dtime);
        }
    }

}

export { Loop };
