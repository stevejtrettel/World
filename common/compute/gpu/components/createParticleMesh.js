
function createParticleMesh(width,height){

    const size = width * height;

    // //Set up the vertices of our mesh:
    let vertices = new Float32Array( size * 3 );

    //no idea what this is doing yet?
    for ( let i = 0; i < size; i++ ) {
        let i3 = i * 3;
        vertices[ i3 ] = ( i % width ) / width ;
        vertices[ i3 + 1 ] = ( i / width ) / height;
    }

    return vertices;

}




export default createParticleMesh;
