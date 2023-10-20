
import Surface from "./Surface.js";

class SinxSiny extends Surface {
    constructor(domain) {
        super(domain);
    }

    setFunctionAndDerivatives() {
        super.setFunctionAndDerivatives();

        const a = 0.5;
        const kU = 3.5*3.14159/this.domain.u.max;
        const kV = kU;

        let F = function (u, v) {
            return  a*Math.cos(kU*u)*Math.sin(kV*v);
        }
        this.F = F;

        this.name = 'Sinusoid';
        this.Ftxt = `f(u,v)=${a}*cos(${kU}*u)*sin(${kV}*v)`;

        this.derivatives = function (uv) {
            let u = uv.x;
            let v = uv.y;
            return {
                fu: -a*kU*Math.sin(kU*u)*Math.sin(kV*v),
                fv: a*kV*Math.cos(kU*u)*Math.cos(kV*v),
                fuu: -kU*kU*F(u,v),
                fvv: -kV*kV*F(u,v),
                fuv: -a*kU*kV*Math.sin(kU*u)*Math.cos(kV*v)
            };

        }

    }
}


export default SinxSiny;