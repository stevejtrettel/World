
import Surface from "./Surface.js";

class Gaussian extends Surface {
    constructor(domain) {
        super(domain);
    }

    setFunctionAndDerivatives() {
        super.setFunctionAndDerivatives();

        let a = 1;
        let b = 0.25;
        let c = -1;

        let F = function (u, v) {
            return  a*Math.exp(-b*((u-c) * (u-c) + v * v));
        }
        this.F = F;

        this.name = 'Gaussian';
        this.Ftxt = `f(u,v)=${a}*exp(-${b}*((u-${c})^2 + v^2))`;

        this.derivatives = function (uv) {
            let u = uv.x;
            let v = uv.y;
            return {
                fu: -2 * (u-c) * b * F(u, v),
                fv: -2 * v * b * F(u, v),
                fuu: (4 * b * (u-c) * (u-c) - 2) * b * F(u, v),
                fvv: (4 * b * v * v - 2) * b * F(u, v),
                fuv: 4 * b * b * (u-c) * v * F(u, v)
            };

        }

    }
}


export default Gaussian;