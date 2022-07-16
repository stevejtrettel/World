
const fetch = `
    vec4 fetch(sampler2D tex, ivec2 ij) {
        return texelFetch(tex, ij, 0);
    }
    `;

const setIJ = `
    ivec2 setIJ(){
        return ivec2(int(gl_FragCoord.x),int(gl_FragCoord.y));
    }
`;



const onEdges =    `
      bool onTop( ivec2 ij ){
        return ij.y == int(res.y)-1;
      }
      
      bool onBottom( ivec2 ij ){
        return ij.y == 0;
      }
      
      bool onLeft( ivec2 ij ){
        return ij.x == 0;
      }
      
      bool onRight( ivec2 ij ){
        return ij.x == int(res.x)-1;
      }
      
     bool onEdge(ivec2 ij){
        if( ij.x == 0 || ij.y == 0 || ij.x == int(res.x)-1 || ij.y == int(res.y)-1 ){
            return true;
        }
        return false;
    }
    
    bool onCorner( ivec2 ij ){
        bool top = onTop(ij);
        bool left = onLeft(ij);
        bool right = onRight(ij);
        bool bottom = onBottom(ij);
        
        return top&&left || top&&right || bottom&&left || bottom&&right;
    }
`;






export{
    fetch,
    setIJ,
    onEdges,
};
