import {Vector3} from "../../../../3party/three/build/three.module.js";

import Surface from "./Surface.js";

class CosR extends Surface {
    constructor(domain) {
        super(domain);
    }

    setFunctionDerivatives() {
        super.setFunctionDerivatives();

        const c = 0.1;
        const pi=3.14159;

        let F = function (u, v) {
            let r2 = u*u+v*v;
            return  c*Math.cos(pi*r2);
        }
        this.F = F;

        this.derivatives = function (uv) {
            let u = uv.x;
            let v = uv.y;
            let r2 = u*u+v*v;
            return {
                fu: -c*(2*u*pi)*Math.sin(pi*r2),
                fv: -c*(2*v*pi)*Math.sin(pi*r2),
                fuu: -c*(2*pi)*Math.sin(pi*r2)-c*(2*pi*u)*(2*pi*u)*Math.cos(pi*r2),
                fvv: -c*(2*pi)*Math.sin(pi*r2)-c*(2*pi*v)*(2*pi*v)*Math.cos(pi*r2),
                fuv: -c*(2*u*pi)*(2*pi*v)*Math.cos(pi*r2)
            };

        }

    }
}


export default CosR;