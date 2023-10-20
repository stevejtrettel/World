
import Surface from "./Surface.js";

class Paraboloid extends Surface {
    constructor(domain) {
        super(domain);
    }

    setFunctionAndDerivatives() {
        super.setFunctionAndDerivatives();

        //chose a constant so the farthest point is at most 1 inch below the middle:
        //farthest point is diagonal, value of function there is length of diagonal squared:
        const U = this.domain.u.max;
        const V = this.domain.v.max;
        const a = 4/(U*U+V*V);

        const c = 0;

        let F = function (u, v) {
            return -a*((u-c)*(u-c)+v*v);
        }
        this.F = F;

        this.name = 'Paraboloid';
        this.Ftxt = `f(u,v)=-${a}*((u-${c})^2+v^2)`;

        this.derivatives = function (uv) {
            let u = uv.x;
            let v = uv.y;
            return {
                fu: -2*a*(u-c),
                fv: -2*a*v,
                fuu: -2*a,
                fvv: -2*a,
                fuv: 0
            };
        }

    }
}


export default Paraboloid;