
import Surface from "./Surface.js";

class Gaussian extends Surface {
    constructor(domain) {
        super(domain);
    }

    setFunctionDerivatives() {
        super.setFunctionDerivatives();

        //parameters to help choose gaussian
        const a = 1;
        const b = 2;

        let F = function (u, v) {
            return  a*Math.exp(-b*(u * u + v * v));
        }
        this.F = F;

        this.derivatives = function (uv) {
            let u = uv.x;
            let v = uv.y;
            return {
                fu: -2 * u * b * F(u, v),
                fv: -2 * v * b * F(u, v),
                fuu: (4 * b * u * u - 2) * b * F(u, v),
                fvv: (4 * b * v * v - 2) * b * F(u, v),
                fuv: 4 * b * b * u * v * F(u, v)
            };

        }

    }
}


export default Gaussian;