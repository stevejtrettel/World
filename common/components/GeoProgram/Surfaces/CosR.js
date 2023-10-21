import {Vector3} from "../../../../3party/three/build/three.module.js";

import Surface from "./Surface.js";

class CosR extends Surface {
    constructor(domain) {
        super(domain);
    }



    setParamData(){
        this.params = {
            a: 1,
            b: 1,
        };

        this.paramData = {
            a: {
                min: 0,
                max: 5,
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

        this.F = function (u, v) {
            let r = Math.sqrt(u*u+v*v);
            return  a*Math.cos(b*r);
        }

        this.name ='CosR';
        this.Ftxt = `f(u,v)=${a}*cos(${b}*sqrt(u^2+v^2))`;

    }
}


export default CosR;