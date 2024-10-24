

class ThreeBody{
    constructor(a,b,c) {
        this.a = a;
        this.b = b;
        this.c = c;
    }

    clone(){
        let a = this.a.clone();
        let b = this.b.clone();
        let c = this.c.clone();

        return new ThreeBody(a,b,c);
    }

    multiplyScalar(k){
        this.a.multiplyScalar(k);
        this.b.multiplyScalar(k);
        this.c.multiplyScalar(k);
        return this;
    }

    add(obj){
        this.a.add(obj.a);
        this.b.add(obj.b);
        this.c.add(obj.c);
        return this;
    }

    sub(obj){
        this.a.sub(obj.a);
        this.b.sub(obj.b);
        this.c.sub(obj.c);
        return this;
    }
}






class ThreeBodyState{
    constructor(mass, pos, vel) {
        this.mass = mass;
        this.pos = new ThreeBody(pos.a,pos.b,pos.c);
        this.vel = new ThreeBody(vel.a,vel.b,vel.c);
    }

    add( dState ){

        this.pos.add(dState.vel);
        this.vel.add(dState.acc);
        return this;
    }

    clone(){
        return new ThreeBodyState(this.mass, this.pos.clone(),this.vel.clone());
    }
}






class ThreeBodyDState{
    constructor(vel, acc) {
        this.vel = new ThreeBody(vel.a,vel.b,vel.c);
        this.acc = new ThreeBody(acc.a,acc.b,acc.c);
    }

    add( dstate ){
        this.acc.add(dstate.acc);
        return this;
    }

    sub( dstate ){
        this.acc.sub(dstate.acc);
        return this;
    }

    multiplyScalar( k ){
        this.acc.multiplyScalar(k);
        return this;
    }

    clone(){
        return new ThreeBodyDState(this.vel.clone(),this.acc.clone());
    }
}



export {ThreeBodyState,ThreeBodyDState, ThreeBody};
