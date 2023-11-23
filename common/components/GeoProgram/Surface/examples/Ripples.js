import {Vector3} from "../../../../../3party/three/build/three.module.js";

import Surface from "../Surface.js";

class Ripples extends Surface {
    constructor(domain) {
        super(domain);
    }



    setParamData(){
        this.params = {
            a: 0.5,
            b: 1.75,
        };

        this.paramData = {
            a: {
                min: 0,
                max: 2,
                step: 0.01,
                name: 'Amplitude'
            },
            b: {
                min: 0,
                max: 5,
                step: 0.01,
                name: 'Frequency'
            },
        };
    }

    setFunctionData() {
        super.setFunctionData();

        const a = this.params.a;
        const b = this.params.b;

        let amp = function(r){
            return 1./(Math.cosh(3*r)*Math.cosh(3*r))-0.2*(Math.tanh(3*r)-1);
        }
        let vibe = function(r){
            return 0.2*Math.cos(10*r);
        }
        let wave = function(r){
            return amp(r)*vibe(r)+amp(2*r);
        }
        let ripple = function(x,y,t){
            return 0.5*wave(Math.sqrt(x*x+y*y)-t)/(t+1);
        }

        this.F = function (u, v) {
            //let r = Math.sqrt(u*u+v*v);
            return  ripple(u,v,1.5)+ripple(u-2,v-3,3)+0.5*ripple(u+3,v+1,2);
        }

        this.name ='Ripples';
        this.Ftxt = `
        amp(r)=sech(3r_^2-0.2(tanh(3r)-1);
        wave(r)=amp(r)(1+0.2*cos(10*r));
        ripple(u,v,t)=0.5*wave(sqrt(u^2+v^2)-t)/(t+1);
        f(u,v)=ripple(u,v,1.5)+ripple(u-2,v-3,3)+0.5*ripple(u+3,v+1,2);`;
    }
}


export default Ripples;