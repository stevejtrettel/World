import {default as Stats} from "../../../3party/three/examples/jsm/libs/stats.module.js"



//if you have made a place in the document called statsFolder, put it there
//otherwise, just throw it at the top of the screen
function placeStats(stats){
    if(document.getElementById('statsFolder')){
        document.getElementById('statsFolder').appendChild(stats.domElement);
    }
    else {
        document.body.appendChild(stats.domElement);
    }
}



function styleStats(stats){

    //stats.domElement.style.position = "static";
    //stats.domElement.height = '48px';

    stats.domElement.style.position = 'relative';
    stats.domElement.style.left = '0';
    stats.domElement.style.top = '0';
    stats.domElement.style.opacity =0.67;

}



function createStats(container) {
    const stats = new Stats();

    //display a single panel
    stats.setMode(0);

    //display all three panels next to one another
    //[].forEach.call(stats.domElement.children, (child) => (child.style.display = ''));

    styleStats(stats);

    return stats;
}





export{ createStats, placeStats };
