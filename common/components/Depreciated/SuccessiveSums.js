import {RiemannSum} from "./RiemannSum.js";

class SuccessiveSums{
   constructor( options ){
       this.f = options.f;
       this.domain = options.domain;

       this.nMin = options.nMin;
       this.num = options.num;
       //use nMax to find the proportion:
       this.proportion = Math.pow((options.nMax-options.nMin)/options.nMin, 1/options.num);

       this.sum=[];
       let newSum;
       let newOptions;
       for(let i=0; i<this.num; i++) {
           newOptions = {
               f: this.f,
               domain: this.domain,
               posColor:0x244f30,
               negColor:0xc98018,
               borderColor:0x326ba8,
               n: Math.floor(this.nMin*Math.pow(this.proportion,i)),
           }
           newSum = new RiemannSum( newOptions );
           newSum.setPosition(0,0,this.num/2-i);
           this.sum.push(newSum);
       }

       // newOptions = {
       //     f: this.f,
       //     domain: this.domain,
       //     posColor:0x244f30,
       //     negColor:0xc98018,
       //     borderColor:0x326ba8,
       //     n: 500,
       // }
       // newSum = new RiemannSum( newOptions );
       // newSum.setPosition(0,0,-this.num/2);
       // this.sum.push(newSum);



   }

   addToScene( scene ){
       for(let i=0; i<this.num; i++){
           this.sum[i].addToScene(scene);
       }

       const color = 0x000000;
       const density = 0.03;
       scene.fog = new FogExp2(color, density);
   }

   addToUI( ui ){}
   tick(time,dTime){}
}


let data = {
    domain: { min:-5, max:3},
    f: (x)=> Math.cos(3*x)+Math.cos(x),
    nMin:5,
    nMax:300,
    num:15,
    posColor:0x244f30,
    negColor:0xc98018,
    borderColor:0xa8a032,
};

let example = new SuccessiveSums( data );

export default {example};