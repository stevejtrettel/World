
import Surface from "./Surface.js";

class SinxSiny extends Surface {
    constructor(domain) {
        super(domain);
    }

    setFunctionAndDerivatives() {
        super.setFunctionAndDerivatives();

        const c = 0.5;
        const k=3.14159/1.5;


        let F = function (u, v) {
            return  c*Math.sin(k*u)*Math.sin(k*v);
        }
        this.F = F;

        this.name = 'Sinusoid';
        this.Ftxt = `f(u,v)=${c}*sin(${k}*u)*sin(${k}*v)`;

        this.derivatives = function (uv) {
            let u = uv.x;
            let v = uv.y;
            return {
                fu: c*k*Math.cos(k*u)*Math.sin(k*v),
                fv: c*k*Math.sin(k*u)*Math.cos(k*v),
                fuu: -k*k*F(u,v),
                fvv: -k*k*F(u,v),
                fuv: -k*k*c*Math.cos(k*u)*Math.cos(k*v)
            };

        }

    }
}


export default SinxSiny;