import {Vector3} from "../../../../3party/three/build/three.module.js";

import Surface from "./Surface.js";

class Gaussian extends Surface {
    constructor(domain) {
        super(domain);
    }

    setFunctionDerivatives() {
        super.setFunctionDerivatives();

        let F = function (u, v) {
            return  Math.exp(-u * u - v * v);
        }
        this.F = F;

        this.derivatives = function (uv) {
            let u = uv.x;
            let v = uv.y;
            return {
                fu: -2 * u * F(u, v),
                fv: -2 * v * F(u, v),
                fuu: (4*u*u - 2) * F(u, v),
                fvv: (4*v*v - 2) * F(u, v),
                fuv: 4 * u * v * F(u, v)
            };
        }

    }
}


export default Gaussian;