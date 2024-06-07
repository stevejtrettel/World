

const inDomain = `
  bool inDomain(vec2 uv, vec3 xyz){
  
   //allowable variables to use in coloring:
        float u = uv.x;
        float v = uv.y;
        float x = xyz.x;
        float y = xyz.y;
        float z = xyz.z;
        
     // need constants declared for uMin, uMax, vMin, vMax, edge;
     
     if(abs(x-uMin)<edge || abs(x-uMax)<edge){
        return true;
     }
     if(abs(z-vMin)<edge || abs(z-vMax)<edge){
        return true;
     }
     return false;
}`;

export default inDomain;