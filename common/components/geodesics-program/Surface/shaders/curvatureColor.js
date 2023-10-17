

//shader which computes the curvature of the function at the point uv:
//PROBLEM the uniform vPosition only records the CURRENT POSITION
// need nearest neighbors in 3x3 grid to do second derivative calculations


// ONE OPTION at least for pre-built choices of functions
//give the function to the shader, then we can just compute these things numerically no problem.