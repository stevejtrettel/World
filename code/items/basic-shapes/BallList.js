import {Mesh, MeshPhysicalMaterial, SphereGeometry} from "../../../3party/three/build/three.module.js";


let defaultBallOptions = {
    radius:0.35,

};


// a string of balls, that can be placed anywhere by giving a 1D array of vec3 to update()

class BallList {
    constructor(N, ballOptions=defaultBallOptions) {
        this.N = N;

        this.pos = [];

        let mat = new MeshPhysicalMaterial({
            color:0xffffff,
            clearcoat:true,
        });
        let geom = new SphereGeometry(0.2,32,16);

        this.balls = [];

        let ball = new Mesh(geom,mat);
        //SET THE SCALE OF THE BALL?

        for(let i=0; i<this.N; i++){
            this.balls.push(ball.clone());
        }

    }


    addToScene(scene){
        for(let i=0; i<this.N; i++){
            scene.add(this.balls[i]);
        }
    }


    updatePosition(index, pos){
        this.balls[index].position.set(pos.x,pos.y,pos.z);
    }

    updateColor(index,color){
        this.balls[index].material.color.set(color);
    }

    updateScale(index,height){
        this.balls[index].scale.set(1,height,1);
    }

}

export default BallList;
