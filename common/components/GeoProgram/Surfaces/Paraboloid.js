
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
        const c = 1/(U*U+V*V);

        let F = function (u, v) {
            return -c*(u*u+v*v);
        }
        this.F = F;

        this.name = 'Paraboloid';
        this.Ftxt = `f(u,v)=-${c}*(u*u+v*v)`;

        this.derivatives = function (uv) {
            let u = uv.x;
            let v = uv.y;
            return {
                fu: -2*c*u,
                fv: -2*c*v,
                fuu: -2*c,
                fvv: -2*c,
                fuv: 0
            };
        }

    }
}


export default Paraboloid;