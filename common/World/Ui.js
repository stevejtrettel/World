import {GUI} from "../../3party/gui/dat.gui.module.js";


class UI extends GUI {

    constructor () {
        super();
        this.close();
    }

    toggleHide(){
        GUI.toggleHide();
    }
}


export { UI };
