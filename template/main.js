

//set the objects that will run in this simulation
import item from "../common/items/computeSurface.js";
let objects = {...item};

let options = {
    color: 0x343757,
    // 0x2f508a,
    //0x303030,
}

//the function which builds a world from the default template,
//using these objects
import { mainFromTemplate } from "./mainFromTemplate.js";
//call the function to run the app
mainFromTemplate(objects, options);
