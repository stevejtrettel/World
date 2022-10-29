
class AmbientSpace{
    constructor(geometry,model,obstacle){
        this.geometry = geometry;
        this.model = model;
        this.obstacle = obstacle;
    }

    //if we add a force field; this gets updated!
    acceleration(state){
        return this.geometry.covariantAcceleration(state);
    }

    dot(state1, state2){
        return this.geometry.dot(state1,state2);
    }

    gradient(fn,pos){
        return this.geometry.gradient(fn,pos);
    }


    toR3(pos){
        return this.model.toR3(pos);
    }


    distance(pos1, pos2){
        return this.geometry.distance(pos1, pos2);
    }

    distToObstacle(pos){
        return this.obstacle.distance(pos);
    }

}


export { AmbientSpace };