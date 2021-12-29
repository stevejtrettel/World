


class CSDisplay {

     constructor( computeSystem ){

         this.compute = computeSystem;
         this.compute.initialize();

         this.name = null;

         this.ui = {chooseDisplay: this.compute.variables[0]};

         //what needs to get filled in for each extension:
         this.display = null;

     }

    setName(name){
        this.name= name;
    }

    addToUI( ui ){
        //need a real way of doing this!
        ui.add(this.ui, 'chooseDisplay',{'pos' : `${this.compute.variables[0]}`, 'vel' : `${this.compute.variables[1]}`});
    }

    selectedDisplay(){
         return this.ui.chooseDisplay;
    }

    addToScene( scene ){
        scene.add(this.display);
    }

    //the only method that needs to get overwritten is tick()!
    tick() {}




}




export { CSDisplay };
