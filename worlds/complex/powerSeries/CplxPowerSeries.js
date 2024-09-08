import {Vector2,Vector3} from "../../../3party/three/build/three.module.js";
import RodChain from "../../../code/items/basic-shapes/RodChain.js";
import ParametricCurve from "../../../code/compute/parametric/ParametricCurve.js";



function toVec3(z){
    return new Vector3(z.x,z.y,0);
}

function cMult(z,w){
    let re = z.x*w.x-z.y*w.y;
    let im = z.x*w.y+z.y*w.x;
    return new Vector2(re, im);
}


//let coef be a function taking an integer n to the coefficient of z^n
//the points partial sums are output into R3 as (x,y,0);
class PowerSeries{
    constructor(coef,n=10.) {
        this.coef=coef;
        this.n=n;
    }

    updateCoef(coef){
        this.coef=coef;
    }

    getPartialSums(z){
        let zn = z;

        let partialSums = [];
        partialSums.push(this.coef(0));

        for(let i=1;i<this.n;i++){
            let term = cMult(this.coef(i),zn);
            let sumToDate = partialSums[i-1].clone();
            term.add(sumToDate);
            partialSums.push(term);
            zn = cMult(zn,z);
        }
        return partialSums;
    }
}






class CplxPowerSeries{
    constructor(fn,n=10) {

        this.params ={
            animate:true,
            x: 0,
            y:1,
        }

        this.n=n;
        this.z = new Vector2(this.params.x,this.params.y);
        this.series = new PowerSeries(fn,n);

        this.compute(this.z);
        this.chain = new RodChain(this.vectors,0.05);

    }

    compute(z){
        this.z=z;
        //these are now points in the complex plane:
        this.pts = this.series.getPartialSums(this.z);
        this.vectors = [];
        for(let i=0;i<this.n;i++){
            this.vectors.push(toVec3(this.pts[i]));
        }
    }

    resizeRods(){
        this.chain.update(this.vectors);
    }

    setPosition(x,y,z){
        this.chain.setPosition(x,y,z);
    }

    addToScene(scene){
        this.chain.addToScene(scene);
    }

    addToUI(ui){
        let thisObj = this;
        ui.add(thisObj.params,'x',-3,3,0.01).onChange(function(value){
            thisObj.z=new Vector2(value,thisObj.params.y);
            thisObj.compute(thisObj.z);
            thisObj.resizeRods();
        });
        ui.add(thisObj.params,'y',-3,3,0.01).onChange(function(value){
            thisObj.z = new Vector2(thisObj.params.x, value);
            thisObj.compute(thisObj.z);
            thisObj.resizeRods();
        });
        ui.add(thisObj.params, 'animate');
    }

    tick(time,dTime){
        if(this.params.animate) {
            let z = new Vector2(0, 6.29 * (1 + Math.sin(time / 4.)) / 2);
            this.compute(z);
            this.resizeRods();
        }
    }
}











//BUILDING OUR EXAMPLE:

let factorial = function(n){
    let val = 1;
    for(let i=1;i<n+1;i++){
        val *= i;
    }
    return val;
}

let exp = function(n){
    return new Vector2(1/factorial(n),0);
}

let ex = new CplxPowerSeries(exp,30);


//want to also add a circle to the plot
const circEqn = `
    vec3 eqn( float s ){
        return vec3(cos(s),sin(s),0);
    }
`;
const circleColor = `
            vec3 colorFn(float s, vec3 xyz){
             
             float grid1 = (1.-pow(abs(sin(10.*3.14*s)),0.1))/10.;
             float grid2 = (1.-pow(abs(sin(50.*3.14*s)),0.1))/25.;
             float grid3 = (1.-pow(abs(sin(100.*3.14*s)),0.1))/50.;
             float grid = grid1+grid2+grid3;
             
             vec3 base =  0.6 + 0.4*cos(2.*3.14*vec3(s,1.-s,s)+vec3(0,2,4));
             
             return base + 2.*vec3(grid);
            }
        `;
let circlePlot = new ParametricCurve(circEqn,{min:0,max:6.29},{},circleColor,{},0.02);
circlePlot.addToUI=function(ui){};
circlePlot.tick=function(time,dTime){};

export default {circle:circlePlot, complex:ex};
