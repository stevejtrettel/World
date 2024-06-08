

function createContainer(name){
    //either fetch it, or make it!
    const existingContainer = document.getElementById(name);
    if(existingContainer){
        //return the existing div, and don't change any CSS styling attached to it
        return existingContainer;
    }
    else {
        //we need to create this div:
        const createdContainer = document.createElement("div");
        createdContainer.setAttribute("id", name);
        document.body.appendChild(createdContainer);

        //set the style of the DIV: TAKE UP THW WHOLE FRAME
        createdContainer.style.width = '100%';
        createdContainer.style.height = '100%';
        createdContainer.style.position = 'absolute';
        createdContainer.style['background-color'] = "#0f213d";

        return createdContainer;
    }
}


export {createContainer};
