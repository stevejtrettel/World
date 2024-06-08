

//toR3 takes a point pos in coordinates and sends it to the point we wish to view in R3:
//relativeScaling gives the size things should be drawn:
//if an object is size S in real space, at position p=toR3(pos), we want to draw it with size relSize at p;
class Model{
    constructor(toR3, relativeScaling){
        this.toR3=toR3;
        this.relativeScaling = relativeScaling;
    }

}




export { Model };