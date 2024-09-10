import {Mesh, MeshPhysicalMaterial, SphereGeometry} from "../../../3party/three/build/three.module.js";


let defaultBallOptions = {
    radius:0.35,

};


// a string of balls, that can be placed anywhere by giving a 1D array of vec3 to update()

class BallGrid {
    constructor(N,M, ballOptions=defaultBallOptions) {
        this.N = N;
        this.M = M;

        //this will be an array of arrays: N different arrays each of length  M
        this.pos = [];
        //this will be an array of arrays: N different arrays each of length  M
        this.balls = [];
        for(let i=0; i< this.N;i++){
            this.pos.push([]);
            this.balls.push([]);
        }

        let mat = new MeshPhysicalMaterial({
            color:0xffffff,
            clearcoat:true,
        });
        let geom = new SphereGeometry(0.2,32,16);
        let ball = new Mesh(geom,mat);


        for(let i=0; i<this.N; i++){
            for(let j=0; j<this.M;j++) {
                this.balls[i].push(ball.clone());
            }
        }

    }




    addToScene(scene){
        for(let i=0; i<this.N; i++) {
            for (let j = 0; j < this.M; j++) {
                scene.add(this.balls[i][j]);
            }
        }
    }

//index is an array [i,j]
    updatePosition(index, pos){
        this.balls[index[0]][index[1]].position.set(pos.x,pos.y,pos.z);
    }

//index is an array [i,j]
    updateColor(index,color){
        this.balls[index[0]][index[1]].material.color.set(color);
    }

//index is an array [i,j]
    updateScale(index,height){
        this.balls[index[0]][index[1]].scale.set(1,height,1);
    }

}

export default BallGrid;
