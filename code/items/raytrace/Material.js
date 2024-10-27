
//raymarching material: list of properties
//and some methods to make basic ones?

class Material{

    constructor() {
        //material properties
        this.color = 0xffffff;
        this.ior = 1;
        this.roughness = 0;

        //chance of different rays (must add to 1)
        this.refractChance = 0;
        this.specularChance = 0;
        this.diffuseChance = 1;
        this.subsurfaceChance = 0;

        //stuff about subsurface scattering
        this.isotropy = 1;
        this.mfp = 1;
        this.subsurface = false;
    }

    //modify these properties by calling a method below
    //to make specific materials

    makeMirror(color){

        //material properties
        this.color = color;
        this.ior = 1;
        this.roughness = 0;

        //chance of different rays (must add to 1)
        this.refractChance = 0;
        this.specularChance = 1;
        this.diffuseChance = 0;
        this.subsurfaceChance = 0;

        //stuff about subsurface scattering
        this.subsurface = false;
        this.isotropy = 1;
        this.mfp = 1;

    }

    makeDielectric(color,roughness=0.1, spec=0.5, ){

        //material properties
        this.color = color;
        this.ior = 1;
        this.roughness = roughness;

        //chance of different rays (must add to 1)
        this.refractChance = 0;
        this.specularChance = spec;
        this.diffuseChance = 1-spec;
        this.subsurfaceChance = 0;

        //stuff about subsurface scattering
        this.subsurface = false;
        this.isotropy = 1;
        this.mfp = 1;

    }

    makeGlass(color,ior=1.5, refractivity=0.95, roughness=0.){

        //material properties
        this.color = color;
        this.ior = ior;
        this.roughness = roughness;

        //chance of different rays (must add to 1)
        this.refractChance = refractivity;
        this.specularChance = 0.9*(1-refractivity);
        this.diffuseChance = 0.1*(1-refractivity);
        this.subsurfaceChance = 0;

        //stuff about subsurface scattering
        this.subsurface = false;
        this.isotropy = 1;
        this.mfp = 1;

    }


    makeSubsurface(color, isotropy=1, mfp=1, ior=1,roughness=0, spec=0.1,){

        //material properties
        this.color = color;
        this.ior = ior;
        this.roughness = roughness;

        //chance of different rays (must add to 1)
        this.refractChance = 0;
        this.diffuseChance = 0;
        this.specularChance = spec;
        this.subsurfaceChance = 1-spec;

        //stuff about subsurface scattering
        this.subsurface = true;
        this.isotropy = isotropy;
        this.mfp = mfp;

    }

}

export default Material;
