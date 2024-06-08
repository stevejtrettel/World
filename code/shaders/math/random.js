

const randomFns = `
//a global variable which will get passed around
            //as a seed for the random number generators.
            uint seed;

            
            //--- the function we call in main() which sets seed
            uint randomSeed(vec2 fCoord,float frame){
            
                uint seed = uint(uint(fCoord.x) * uint(1973) + uint(fCoord.y) * uint(925277) + uint(frame) * uint(26699)) | uint(1);
                return seed;
            
            }

            
            //hash function that gets us our random numbers
            uint wang_hash()
            {
                seed = uint(seed ^ uint(61)) ^ uint(seed >> uint(16));
                seed *= uint(9);
                seed = seed ^ (seed >> 4);
                seed *= uint(0x27d4eb2d);
                seed = seed ^ (seed >> 15);
                return seed;
            }
            
            
            
            //return a random float in the interval [0,1]
            float randomFloat(){
                return float(wang_hash()) / 4294967296.0;
            }
            
            
            //return a random float in the interval [a,b]
            float randomFloat(float a,float b){
                return a+(b-a)*randomFloat();
            }
            
           
            
            //random unit vector at origin
            //this is thanks to archimedes sphere and the cylinder
            vec3 randomUnitVec3()
            {
                float z = randomFloat() * 2.0f - 1.0f;
                float a = randomFloat() * 6.28;
                float r = sqrt(1.0f - z * z);
                float x = r * cos(a);
                float y = r * sin(a);
                return vec3(x, y, z);
            }
            
            //gaussian random variable with mean 0 and stdev 1
            float gaussian(){
                float u = randomFloat(0.,1.);
                float r = sqrt(-2.*log(u));
                
                float theta = randomFloat(0.,6.29);
                
                float x = r*cos(theta);
                return x;
            }
`;


export { randomFns };
