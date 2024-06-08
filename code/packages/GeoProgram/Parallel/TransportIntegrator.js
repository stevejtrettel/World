import {Vector2} from "../../../../3party/three/build/three.module.js";

class TransportIntegrator{
    constructor(curve, surface, ep) {
        this.curve = curve;
        this.surface = surface;
        this.ep = ep;

        this.tangent = function(t){
            let eps=0.01;
            let pos1 = curve.getPoint(t+eps);
            let pos2 = curve.getPoint(t);
            let ds = pos1.add(pos2.multiplyScalar(-1));
            return ds.divideScalar(eps);
        };

        this.initialize();


    }

    initialize(){

        let curve = this.curve;
        let tangVec = this.tangent;
        let derivatives = this.surface.derivatives;

        let derive = function(vec,t){

            let Xu = vec.x;
            let Xv = vec.y;

            let uv = curve.getPoint(t);

            let tang = tangVec(t);
            let uP = tang.x;
            let vP = tang.y;

            let D = derivatives(uv);
            let fu = D.fu;
            let fv = D.fv;
            let fuu = D.fuu;
            let fvv = D.fvv;
            let fuv = D.fuv;

            let denom = 1+ fu*fu + fv*fv;

            let Guuu = (fu*(fuu-fu*fv*fuv+fv*fv*fvv))/denom;
            let Gvvv = (fv*(fvv-fu*fv*fuv+fu*fu*fuu))/denom;
            let Guvu = (fu*fuv)/denom;
            let Guvv = (fv*fuv)/denom;
            let Guuv = (fuu*fv)/denom;
            let Gvvu = (fvv*fu)/denom;

            let XuP = -uP*(Guuu*Xu + Guvu*Xv) - vP*(Guvu*Xu + Gvvu*Xv);
            let XvP = -uP*(Guuv*Xu + Guvv*Xv) - vP*(Guvv*Xu + Gvvv*Xv);
            return new Vector2(XuP,XvP);
        }

        this.derive = derive;
    }




    //step forwards one timestep
    step(vec,t){

        let k1,k2,k3,k4;
        let temp;

        //get the derivative
        k1 = this.derive(vec,t);
        k1.multiplyScalar(this.ep);

        //get k2
        temp=vec.clone().add(k1.clone().multiplyScalar(0.5));
        k2=this.derive(temp,t+0.5*this.ep);
        k2.multiplyScalar(this.ep);

        //get k3
        temp=vec.clone().add(k2.clone().multiplyScalar(0.5));
        k3=this.derive(temp,t+0.5*this.ep);
        k3.multiplyScalar(this.ep);

        //get k4
        temp=vec.clone().add(k3.multiplyScalar(1.));
        k4=this.derive(temp,t+this.ep);
        k4.multiplyScalar(this.ep);

        //add up results:
        let total = k1;//scale factor 1
        total.add(k2.multiplyScalar(2));
        total.add(k3.multiplyScalar(2));
        total.add(k4);//scale factor 1
        total.multiplyScalar(1/6);

        //move ahead one step
        let nextState = vec.clone().add(total);

        return nextState;
    }

}

export default TransportIntegrator;