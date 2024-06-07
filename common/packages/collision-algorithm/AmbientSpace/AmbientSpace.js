

//the class representing the ambient space of the geometry
//implementing what we have in the paper (except; I've left out potential energy for now, easy to come back and add)
//will just require a .potential()
//and an update to .acceleration() to not just be geodesic acceleration but also use this.gradient(this.potential(pos))
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

    //the dot product of the geometry
    dot(state1, state2){
        return this.geometry.dot(state1,state2);
    }

    //the gradient with respect to the geometry
    gradient(fn,pos){
        return this.geometry.gradient(fn,pos);
    }


    //projection from our chosen model so we can see it
    toR3(pos){


        let posR3 = this.model.toR3(pos);

        return{
            pos: posR3,
            scaling: this.model.relativeScaling(posR3)
        };
    }


    //the distance function of our geometry
    distance(pos1, pos2){
        return this.geometry.distance(pos1, pos2);
    }

    //the distance function to the obstacle / bounding box of the simulation
    distToObstacle(pos){
        return this.obstacle.distance(pos);
    }

}


export { AmbientSpace };