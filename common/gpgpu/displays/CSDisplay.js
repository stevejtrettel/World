


class CSDisplay {

     constructor( computeSystem ){

         this.compute = computeSystem;
         this.compute.initialize();

         this.name = this.compute.name + ' Display';

         this.ui = {chooseDisplay: this.compute.variables[0]};

         //what needs to get filled in for each extension:
         this.display = null;

     }

    setName(name){
        this.name= name;
    }

    addToUI( ui ){
         //make a UI folder for this:
         let Folder = ui.addFolder(this.name);


        //list out the possible displays in a ui-friendly way
        let displayChoices = {};
        for( let displayVar of this.compute.variables ){
            displayChoices[displayVar]=displayVar;
        }
        Folder.add(this.ui, 'chooseDisplay',displayChoices);
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
