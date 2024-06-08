function setSize( container, camera, renderer ) {

    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( container.clientWidth, container.clientHeight );
    renderer.setPixelRatio( container.devicePixelRatio );

}


export {setSize};
