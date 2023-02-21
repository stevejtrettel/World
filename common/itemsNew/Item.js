

//the base class for items: all items will be an extension of this
class Item{
    constructor(settings){

        //if the settings comes with a list of parameters, pop it off and save as this.params
        //otherwise, the whole thing is a list of parameters
        if (settings.hasOwnProperty('params')) {
            this.params=settings.params;
            delete settings.params;
            this.settings = settings;
        }
        else{
            this.params=settings;
        }

    }






    //need a method to addToScene
    addToScene(scene){

    }

    //need a method to addToUI
    addToUI(ui){

    }

    //need a method called each frame:
    tick(time,dTime){

    }

}



export default Item;