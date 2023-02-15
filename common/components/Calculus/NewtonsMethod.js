import{ Vector3, Color } from "../../../3party/three/build/three.module.js";
import { Rod } from "../basic-shapes/Rod.js";

//f is a function that takes in x; and parameters
//x0 is a point:

class NewtonStep{
    constructor(f,x0,params={}){
        this.f = f;
        this.xStart = x0;

        //do newton's method with the original value of the parameters (if any)
        //to get the points p0,p1 and p2 for the stage of the method.
        //leaving out params will set it to whatever is the default argument in this.f

        this.compute();

        let derivRad = Math.min(0.03,this.p1.clone().sub(this.p2).length()/2.);
        let valRad = Math.min(0.03,this.p0.clone().sub(this.p1).length()/2.);


        let hue = Math.random();
        let color =  new Color().setHSL(hue, 0.4, 0.6);

        //create the rods that we display for each:
        let derivRodOptions = {
            end1: this.p1,
            end2: this.p2,
            color: color,
            radius: derivRad,
        };

        let valueRodOptions = {
            end1: this.p0,
            end2: this.p1,
            //transmission:0.5,
            color: color,
            radius: valRad,
        };

        this.derivativeRod = new Rod(derivRodOptions);
        this.valueRod = new Rod(valueRodOptions);
    }

    addToScene(scene){
        this.derivativeRod.addToScene(scene);
        this.valueRod.addToScene(scene);
    }


    compute(params){
        //what is already set: xStart and f.
        //point on x axis and point on curve:
        this.p0 = new Vector3(this.xStart,0,0);
        this.p1 = new Vector3(this.xStart, this.f(this.xStart, params),0);

        //calculate new point:
        //find the derivative at xStart
        let fPrime = (this.f(this.xStart+0.0001, params)-this.f(this.xStart, params))/0.0001;

        //find x1 using Newton's method:
        this.xEnd = this.xStart - this.f(this.xStart, params)/fPrime;
        this.p2 = new Vector3(this.xEnd, 0,0);
    }

    setF(f){
        this.f=f;
    }

    setXStart(xStart){
        this.xStart = xStart;
    }

    resetRods(){
        let newDerivRad = Math.min(0.03,this.p1.clone().sub(this.p2).length()/2.);
        this.derivativeRod.resize(this.p1,this.p2,newDerivRad);
        let newValRad = Math.min(0.03,this.p0.clone().sub(this.p1).length()/2.);
        this.valueRod.resize(this.p0,this.p1,newValRad);
    }

    update(params){
        this.compute(params);
        this.resetRods();
    }

}


class NewtonsMethod{
    constructor(f,x0,numSteps ) {
        this.f = f;
        this.x0 = x0;
        this.numSteps = numSteps;

        //make an array of all the steps:
        this.steps = [];

        let iterate;
        let currentX = this.x0;
        for(let i=0; i<this.numSteps; i++){
            iterate = new NewtonStep( this.f, currentX );
            this.steps.push(iterate);
            //set currentX to the new position that has been found
            currentX = iterate.xEnd;
        }
    }

    addToScene( scene ){
        for(let i=0; i<this.numSteps; i++){
            this.steps[i].addToScene(scene);
        }
    }

    setF(f){
        this.f=f;
        for(let i=0;i<this.numSteps;i++){
            this.steps[i].f=f;
        }
    }

    setX0(x0){
        this.x0 = x0;
        //all the others need updating too: but this will happen below when we run update
    }

    update( params ){
        let currentX = this.x0;
        for(let i=0; i<this.numSteps; i++){
            this.steps[i].setXStart(currentX);
            this.steps[i].update(params);
            currentX = this.steps[i].xEnd;
        }
    }
}


export default NewtonsMethod;
