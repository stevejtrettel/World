import {GUI} from "../../3party/gui/dat.gui_Modified.module.js";


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
