import {Vector3} from "../../../../3party/three/build/three.module.js";

import Surface from "./Surface.js";

let cosrParams = {
    a: 1,
    b: 1,
    c:0
};


class CosR extends Surface {
    constructor(domain) {
        super(cosrParams, domain);
    }

    setFunctionData() {
        super.setFunctionData();

        const a = this.params.a;
        const b = this.params.b;
        const c = this.params.c;

        this.F = function (u, v) {
            let r = Math.sqrt(u*u+v*v);
            return  a*Math.cos(b*r);
        }

        this.name ='CosR';
        this.Ftxt = `f(u,v)=${a}*cos(${b}*sqrt(u^2+v^2))`;

    }
}


export default CosR;