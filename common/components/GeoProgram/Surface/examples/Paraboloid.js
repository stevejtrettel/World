
import Surface from "../Surface.js";


class Paraboloid extends Surface {
    constructor(domain) {
        super(domain);

        // this.stop = function(uv){
        //     if(uv.length()>2.){
        //         return true;
        //     }
        //     return false;
        // }
    }

    setParamData(){
        this.settingsAndParams = {
            a: 1,
            b: 1,
            c: 1
        };

        this.paramData = {
            a: {
                min: 0,
                max: 2,
                step: 0.01,
                name: 'Amplitude'
            },
        };
    }

    setFunctionData() {
        super.setFunctionData();

        let a = this.params.a;

        let F = function (u, v) {
            return  2.-a*(u*u+v*v);
        }
        this.F = F;

        this.name = 'Paraboloid';
        this.Ftxt = `f(u,v)=2.-${a}*(u^2+v^2)`;

    }
}


export default Paraboloid;