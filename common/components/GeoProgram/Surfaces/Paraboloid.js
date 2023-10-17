import {Vector3} from "../../../../3party/three/build/three.module.js";

import Surface from "./Surface.js";

class Paraboloid extends Surface {
    constructor(domain) {
        super(domain);
    }

    setFunctionDerivatives() {
        super.setFunctionDerivatives();

        let F = function (u, v) {
            return 4-(u*u+v*v);
        }
        this.F = F;

        this.derivatives = function (uv) {
            let u = uv.x;
            let v = uv.y;
            return {
                fu: -2*u,
                fv: -2 *v,
                fuu: -2,
                fvv: -2,
                fuv: 0
            };
        }

    }
}


export default Paraboloid;