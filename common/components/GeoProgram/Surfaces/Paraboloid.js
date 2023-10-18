
import Surface from "./Surface.js";

class Paraboloid extends Surface {
    constructor(domain) {
        super(domain);
    }

    setFunctionDerivatives() {
        super.setFunctionDerivatives();

        let F = function (u, v) {
            return (4-(u*u+v*v))/10.;
        }
        this.F = F;

        this.derivatives = function (uv) {
            let u = uv.x;
            let v = uv.y;
            return {
                fu: -2*u/10,
                fv: -2 *v/10,
                fuu: -2/10,
                fvv: -2/10,
                fuv: 0
            };
        }

    }
}


export default Paraboloid;