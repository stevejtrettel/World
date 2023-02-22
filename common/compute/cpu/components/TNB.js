//the state type for Tangent Normal Binormal frames
//used in integrating the Frenet Serret Equations:

import{ Vector3 } from "../../../../3party/three/build/three.module.js";


class TNB {
    constructor(){
        this.T = new Vector3().set(1,0,0);
        this.N = new Vector3().set(0,1,0);
        this.B = new Vector3().set(0,0,1);
        this.s = 0;
    }

    setT( tVec ){
        this.T = tVec.clone();
    }

    setN( nVec ){
        this.N = nVec.clone();
    }

    setB( bVec ){
        this.B = bVec.clone();
    }

    setS( s ){
        this.s = s;
    }

    incrementS( ds ){
        this.s = this.s + ds;
    }

    getT(){
        return this.T.clone();
    }

    getN(){
        return this.N.clone();
    }

    getB(){
        return this.B.clone();
    }

    getS(){
        return this.s;
    }

    add( other ){
        this.T.add(other.T);
        this.N.add(other.N);
        this.B.add(other.B);
        return this;
    }

    sub( other ){
        this.add(other.multiplyScalar(-1));
        return this;
    }

    multiplyScalar( c ){
        this.T.multiplyScalar(c);
        this.N.multiplyScalar(c);
        this.B.multiplyScalar(c);
        return this;
    }

    clone(){
        let copy = new TNB();
        copy.setS(this.getS());
        copy.setT(this.getT());
        copy.setN(this.getN());
        copy.setB(this.getB());
        return copy;
    }

}


export{ TNB };
