
const dadras = `
            vec3 dadras( vec3 p){
                 float A = 3.0+a;
                 float B = 2.7+b;
                 float C = 1.7+c;
                 float D = 2.0+d;
                 float E = 9.0+e;
                
                float x = p.x;
                float y = p.y;
                float z = p.z;
                    
                float vx = y - A*x + B*y*z;
                float vy = C*y - x*z + z;
                float vz = D*x*y - E*z;
                
                return vec3(vx,vy,vz);
            }
`;



const chen = `
            vec3 chen( vec3 p){
            
            
                float A = 5.0+a;
                float B = -10.0+b;
                float D = -0.38+d;

                
                float x = p.x;
                float y = p.y;
                float z = p.z;
                    
                float vx = A*x - y*z;
                float vy = B*y + x*z;
                float vz = D*z + x*y/3.;
                
                return vec3(vx,vy,vz);
            }
`;



const aizawa = `
            vec3 aizawa( vec3 p){
                float A = 0.95+a;
                float B = 0.7+b;
                float C = 0.6+c;
                float D = 3.5+d;
                float E = 0.25+e;
                float F = 0.1+f;
                
                float x = p.x;
                float y = p.y;
                float z = p.z;
                    
                float vx = (z-B) * x - D*y;
                float vy = D*x + (z-B)*y;
                float vz = C + A*z - z*z*z/3. - (x*x+y*y)*(1.+E*z) + F*z*x*x*x;
                
                return vec3(vx,vy,vz);
            }
`;

const sprott = `
            vec3 sprott(vec3 p){
                float A = 2.07+a;
                float B = 1.79+b;
                
                float x = p.x;
                float y = p.y;
                float z = p.z;
                    
                float vx = y+A*x*y+x*z;
                float vy = 1.- B*x*x + y*z;
                float vz = x - x*x - y*y;
                
                return vec3(vx,vy,vz);
            }
`;


const thomas = `
           vec3 thomas( vec3 p ) {
                float B =0.208186+b;
                
                float x = p.x;
                float y = p.y;
                float z = p.z;
                    
                float vx = sin(y) - B*x;
                float vy = sin(z) - B*y;
                float vz = sin(x) - B*z;
                
                return vec3(vx,vy,vz);
           }
`;


const rossler = `
        vec3 rossler( vec3 p ) {
            float A = 0.2+a;
            float B = 0.2+b;
            float C = 5.7+c;
                
                float x = p.x;
                float y = p.y;
                float z = p.z;
                    
                float vx = -(y+z);
                float vy = x + A*y;
                float vz = B + z*(x-C);
                
                return vec3(vx,vy,vz);
            }
`;


const allAttractors = dadras + chen + aizawa + sprott + thomas + rossler;

export {
    dadras,
    chen,
    aizawa,
    sprott,
    thomas,
    rossler,
    allAttractors,
};
