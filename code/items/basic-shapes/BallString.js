import {Mesh, MeshPhysicalMaterial, SphereGeometry} from "../../../3party/three/build/three.module.js";


let defaultBallOptions = {
    radius:0.25,

};


// a string of balls, that can be placed anywhere by giving a 1D array of vec3 to update()

class BallString{
    constructor(N, ballOptions=defaultBallOptions) {
        this.N = N;

        this.pos = [];

        let mat = new MeshPhysicalMaterial({
            color:0xffffff,
            clearcoat:true,
        });
        let geom = new SphereGeometry(0.1,32,16);

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

    update(posArray){
        for(let i=0; i<this.N;i++){
            let x = posArray[i].x;
            let y = posArray[i].y;
            let z = posArray[i].z;
            this.balls[i].position.set(x,y,z);
        }
    }

}

export default BallString;
