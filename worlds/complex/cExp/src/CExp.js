import {Vector2, Vector3} from "../../../../3party/three/build/three.module.js";
import RodChain from "../../../../code/items/basic-shapes/RodChain.js";
import {Rod} from "../../../../code/items/basic-shapes/Rod.js";


function toVec3(z){
    return new Vector3(z.x,z.y,0);
}

function cMult(z,w){
    let re = z.x*w.x-z.y*w.y;
    let im = z.x*w.y+z.y*w.x;
    return new Vector2(re, im);
}



let defaultParams={

}

class CExp{
    constructor(params=defaultParams) {
        this.animate=true;
        this.N=30;
        this.z=new Vector2(1,1);
        this.vectors=[];
        this.hypotenuse=[];
        this.computeVectors();
        this.chain = new RodChain(this.vectors);
        this.spokes = new RodChain(this.hypotenuse);
        this.rod = new Rod({end1:new Vector3(0,0,0), end2:toVec3(this.z),color:0x44f71b});
    }

    computeVectors(){
        this.vectors=[];
        this.hypotenuse=[];
        let base = new Vector2(1,0).add(this.z.clone().divideScalar(this.N));
        let term = new Vector2(1,0);
        for(let i=0;i<this.N;i++){
            this.vectors.push(toVec3(term));
            this.hypotenuse.push(toVec3(term));
            this.hypotenuse.push(new Vector3(0,0,0));
            term = cMult(term,base);
        }
    }


    resizeRods(){
        this.chain.update(this.vectors);
        this.spokes.update(this.hypotenuse);
        this.rod.resize(new Vector3(0,0,0),toVec3(this.z));
    }

    setPosition(x,y,z){
        this.chain.setPosition(x,y,z);
        this.spokes.setPosition(x,y,z);
        this.rod.setPosition(x,y,z);
    }

    addToScene(scene){
        this.chain.addToScene(scene);
        this.spokes.addToScene(scene);
        this.rod.addToScene(scene);
    }

    addToUI(ui){
        let thisObj=this;
        ui.add(thisObj,'animate');
        ui.add(thisObj.z,'x',-3,3,0.01).name('x').onChange(function(value){
            thisObj.z.x=value;
            thisObj.computeVectors();
            thisObj.resizeRods();
        });
        ui.add(thisObj.z,'y',-3,3,0.01).name('y').onChange(function(value){
            thisObj.z.y=value;
            thisObj.computeVectors();
            thisObj.resizeRods();
        });
    }

    tick(time,dTime){
        if(this.animate) {
            this.z = new Vector2(0, 4. * Math.sin(time));
            this.computeVectors();
            this.resizeRods();
        }
    }
}


export default CExp;
