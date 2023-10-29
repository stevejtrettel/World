
import Surface from "../Surface.js";


class Norton extends Surface {
    constructor(domain={u:{min:-5.75,max:5.75},v:{min:-5.75,max:5.75}}) {
        super(domain);
    }

    setDomain(domain){
            this.domain=domain;
            this.stop = function(uv){
                let u = uv.x;
                let v = uv.y;
                if(u< domain.u.min || u> domain.u.max){
                    return true;
                }
                if(v< domain.v.min || v> domain.v.max){
                    return true;
                }
                if(u*u+v*v<0.001){
                    return true;
                }
                return false;
            }
    }

    setParamData(){
        this.gravity = 0.2957731724645785995;
        this.params = {
        };

        this.paramData = {
        };
    }


    setFunctionData() {
        super.setFunctionData();

        const b = 0.25;
        let F = function (u, v) {
            let r = Math.sqrt(u*u+v*v);
            return  1-2.*b/(3)*Math.pow(r,3/2);
        }
        this.F = F;

        this.name = 'Nortons Dome';
        this.Ftxt = `f(r)=2*${b}/(3)*r^(3/2)`;

    }
}


export default Norton;