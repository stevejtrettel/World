import {
    MeshPhysicalMaterial,
    DoubleSide,
} from "../../../3party/three/build/three.module.js";
import {colorConversion} from "../../../code/shaders/colors/colorConversion.js";
import ContourPlot2D from "../../../code/items/vector-calculus/ContourPlot2D.js";


class LevelSets{
    constructor() {

        this.range = {
            u:{min:-10, max:10},
            v:{min:-10, max:10}
        };

        this.params = {
            animate:true,
            slice: 0,
            eqn: '(v*v-u*u*u+4.*u-2.)/100.',
        }

        this.uniforms = {
            slice:{type:'float',value:this.params.slice}
        };

        this.contourColor =  `
        float grid(float z, float size){

                float brightness = 1./(5.*sqrt(size));
    
                float gridPattern = abs(sin(3.14*size*z));
    
                //invert and increase contrast:
                gridPattern = 1.-pow(gridPattern,0.05);
    
                return gridPattern*brightness;
            }

            vec3 colorFn(float z){
            
            float grid1 = grid(z,0.5);
            float grid2 = grid(z,2.);
            float grid3 = grid(z,6.);
            float grid = grid1+grid2+grid3;
            grid *=4.;
                    
            vec3 base = hsb2rgb(vec3(z/6.28,0.8,0.7-grid));
            vec3 col = base + 2.*vec3(grid);
             
            if(abs(z-slice)<0.05){
            col=vec3(0);
            }
            return col;
            }
        `;

        this.contour = new ContourPlot2D(this.params.eqn,this.range,this.uniforms,this.contourColor);
        // this.contour.setPosition(0,0,3);
        // this.contour.plane.rotateY(Math.Pi/2.);

    }

    setSlice(slice){

        this.params.slice=slice;

        //update uniforms to highlight the slice:
        this.contour.update({slice:slice});
    }


    addToScene(scene){
        this.contour.addToScene(scene);
    }

    addToUI(ui){

        let thisObj = this;

        ui.add(thisObj.params,'animate').name('Animate');

        ui.add(thisObj.params,'eqn').name('Equation').onFinishChange(function(val){
            thisObj.contour.setFunction(val);
        });

        ui.add(thisObj.params, 'slice',-5,5,0.01).name('Slice').onChange(function(val){
            thisObj.setSlice(val);
        });



    }

    tick(time,dTime){
        if(this.params.animate ){
            let val = 5. * Math.sin(time / 3.);
            this.setSlice(val);
        }
    }
}




let ex = new LevelSets();

export default {ex};
