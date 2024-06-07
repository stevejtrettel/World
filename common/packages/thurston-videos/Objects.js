
class TVec{
    constructor(pos,dir){
        this.pos = pos;
        this.dir = dir.normalize();
    }

    updatePos(newPos){
        this.pos=newPos;
    }

    updateDir(newDir){
        this.dir = newDir;
    }
}


class Sphere{
    constructor(center,radius){
        this.center=center;
        this.radius=radius;
    }
    dist(pos){
        let dist = pos.clone().sub(this.center).length()-this.radius;
        console.log(dist);
        return dist;
    }

    normal(pos){
        return pos.clone().sub(this.center).normalize();
    }
}


class Box{
    constructor(center, sides){

    }

    dist(pos){

    }

    normal(pos){

    }
}

class Plane{
    constructor(point,normal){

    }

    dist(pos){

    }

    normal(pos){

    }
}


export{
    TVec,
    Sphere,
    Box,
    Plane,
};