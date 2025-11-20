# Reusable Components Library Guide

A comprehensive catalog of general-purpose tools from the math demos codebase, organized for building a new modular system.

---

## 1. Core Framework Components

### World Management System
**Location**: `/code/World/`

**Essential Components**:
- **World.js** - Scene orchestrator with tick() pattern
- **Loop.js** - Animation loop with time/deltaTime management
- **Ui.js** - dat.GUI wrapper with consistent interface

**Key Patterns to Preserve**:
```javascript
// Object contract:
class ReusableObject {
    addToScene(scene) { }
    addToUI(ui) { }
    tick(time, deltaTime) { }  // Optional
}
```

**Why It's Valuable**:
- Consistent interface across all objects
- Easy composition of complex scenes
- Built-in animation system
- Automatic UI generation

---

## 2. Geometric Primitives & Basic Shapes

### Simple Shapes
**Location**: `/code/items/basic-shapes/`

**Must-Have Components**:

1. **Ball.js** - Configurable sphere with materials
   - Use case: Particles, celestial bodies, points in space
   - Features: Color, position, scale, materials

2. **StandardGrid.js** - XY/YZ/XZ plane grids
   - Use case: Reference planes, coordinate visualization
   - Features: Configurable size, divisions, colors

3. **Blackboard.js** - 2D plane for writing/annotations
   - Use case: Displaying equations, labels, diagrams
   - Features: Canvas texture integration, LaTeX support potential

4. **Chain.js** - Sequence of connected line segments
   - Use case: Paths, trajectories, sequences
   - Features: Point arrays, smooth curves

5. **Grid3D.js** - 3D lattice/grid structure
   - Use case: Crystal structures, 3D coordinate systems
   - Features: Volume grids, point clouds

### Coordinate Systems
**Location**: Various in `/code/items/`

**Key Components**:

6. **Axes.js** - XYZ coordinate axes with labels
   - Features: Arrow helpers, color coding, scale markers
   - Critical for: Every visualization needing orientation

7. **CoordinateGrid.js** - Labeled grid with tick marks
   - Features: Numeric labels, adaptive scaling
   - Use case: Graph paper, measurement references

---

## 3. Mathematical Surfaces & Curves

### Parametric Surfaces
**Location**: `/code/items/calculus/`, `/code/items/geometry/`

**General-Purpose Surface Tools**:

8. **ParametricSurface.js** - Generic (u,v) → (x,y,z) surfaces
   - **Critical**: Foundation for most geometry
   - Features: Custom shader materials, normal computation
   - Patterns: Mesh generation, UV mapping

9. **ParametricCurve.js** - Generic t → (x,y,z) curves
   - Use case: Space curves, trajectories, paths
   - Features: Tube geometry, varying radius, colors

10. **GraphSurface.js** - z = f(x,y) function plots
    - Use case: Function visualization, height maps
    - Features: Domain specification, adaptive resolution

11. **ImplicitSurface.js** - F(x,y,z) = 0 surfaces
    - Use case: Level sets, isosurfaces
    - Features: Marching cubes or GPU raymarching

### Frenet Frames & Differential Geometry
**Location**: `/code/items/geometry/FrenetFrames.js`

12. **FrenetFrames.js** - TNB frame along curves
    - Use case: Moving frames, parallel transport
    - Features: Tangent, normal, binormal vectors
    - Math: Curvature and torsion computation

---

## 4. Visualization Components

### Function Graphing
**Location**: `/code/items/calculus/`

13. **FunctionPlotter2D.js** - y = f(x) in 3D space
    - Use case: Single-variable functions
    - Features: Domain control, adaptive sampling

14. **VectorField2D.js** - Arrow field in plane
    - Use case: Gradient fields, flow fields
    - Features: Color by magnitude, adaptive density

15. **VectorField3D.js** - Arrow field in space
    - Use case: 3D fields, electromagnetic visualization
    - Features: Streamlines integration, density control

16. **ContourPlot.js** - Level curves of f(x,y)
    - Use case: Topographic maps, isolines
    - Features: Adaptive contouring, labeled levels

### Calculus Visualizations
**Location**: `/code/items/calculus/`

17. **RiemannSum.js** - Rectangle approximations
    - Use case: Integration visualization
    - Features: Left/right/midpoint rules, animations

18. **DiskWasherSolid.js** - Solids of revolution
    - Use case: Volume visualization
    - Features: Disk and washer methods

19. **CylindricalShell.js** - Shell method volumes
    - Use case: Alternative volume visualization

---

## 5. Shader Utilities (GLSL)

### Mathematical Functions
**Location**: `/code/shaders/math/`

**Essential Shader Modules**:

20. **complex.js** - Complex number arithmetic
    - Functions: `cmult`, `cdiv`, `cpow`, `cexp`, `csin`, etc.
    - Use case: Complex analysis, fractals, conformal maps

21. **factorial.js** - Factorial and gamma functions
    - Use case: Special functions, series expansions

22. **bessel.js** - Bessel function approximations
    - Use case: Wave equations, physics simulations

23. **hydrogen.js** - Hydrogen orbital wavefunctions
    - Use case: Quantum mechanics, chemistry viz

24. **laplace.js** - Laplace equation solutions
    - Use case: Harmonic functions, PDEs

### Geometric Shaders
**Location**: `/code/shaders/geometry/`

25. **differentialGeometry.js** - Surface properties
    - Functions: Normal computation, curvature, metric tensors
    - Use case: Differential geometry calculations

26. **rotations.js** - 3D rotation utilities
    - Functions: Quaternions, rotation matrices, axis-angle
    - Use case: Animation, orientation changes

27. **projections.js** - Map projections (stereographic, etc.)
    - Use case: Sphere-to-plane mappings

28. **euclideanGeometry.js** - Basic geometric primitives
    - Functions: Distance, angles, intersections
    - Use case: Raytracing, collision detection

### Color Utilities
**Location**: `/code/shaders/colors/`

29. **colorConversion.js** - Color space conversions
    - Functions: HSV↔RGB, wavelength to color
    - Use case: Data visualization, spectrum mapping

30. **colorVisionDeficiency.js** - Colorblind simulation
    - Functions: Protanopia, deuteranopia, tritanopia
    - Use case: Accessibility, vision science

---

## 6. Computational Tools

### GPU Compute Shaders
**Location**: `/code/compute/gpu/`

**Must-Have Patterns**:

31. **GPUComputeShader.js** - General GPU computation wrapper
    - Use case: Parallel processing, large datasets
    - Features: Texture-based computation, read/write buffers

32. **SpringSystem.js** - Mass-spring networks on GPU
    - Use case: Cloth simulation, soft bodies
    - Features: Grid-based springs, collision detection

33. **ParticleSystem.js** - GPU particle simulation
    - Use case: N-body, fluids, crowds
    - Features: Position/velocity updates, forces

### ODE Solvers
**Location**: `/code/items/odes/`, `/code/shaders/odes/`

34. **RK4Integrator.js** - Runge-Kutta 4th order solver
    - Use case: Numerical integration, trajectories
    - Features: CPU and GPU versions available

35. **FlowLine.js** - Integral curve computation
    - Use case: Streamlines, field lines
    - Features: Adaptive step size, bidirectional

36. **VectorFieldIntegrator.js** - General ODE solver
    - Use case: Dynamical systems, phase portraits
    - Features: Multiple methods (Euler, RK4, etc.)

### Attractor Systems
**Location**: `/code/compute/`, `/code/shaders/odes/`

37. **attractors.js** (shader) - Classic chaotic systems
    - Systems: Lorenz, Rössler, Thomas, etc.
    - Use case: Chaos visualization, dynamical systems

---

## 7. Interactive Parameter Systems

### Parameter Management
**Location**: Pattern repeated across all demos

38. **params.js Pattern** - Centralized configuration
    ```javascript
    const defaultParams = {
        // All configurable values
    };
    export default defaultParams;
    ```
    - **Why essential**: Single source of truth
    - **Features**: Default values, type documentation
    - **Use case**: Every configurable demo

### UI Patterns
**Common patterns in `addToUI()` methods**

39. **Folder Organization Pattern**
    ```javascript
    addToUI(ui) {
        const folder = ui.addFolder('Component Name');
        // Add controls to folder
    }
    ```

40. **Live Update Pattern**
    ```javascript
    ui.add(params, 'value').onChange((val) => {
        this.object.update({value: val});
    });
    ```

41. **Equation Input Pattern**
    - Real-time math.js parsing
    - Error handling wrappers needed
    - Use case: User-defined functions

---

## 8. Mathematical Utilities

### Vector Calculus
**Location**: `/code/items/vector-calculus/`

42. **GradientField.js** - ∇f visualization
    - Use case: Optimization, gradient descent
    - Features: Automatic differentiation or numeric gradients

43. **LevelSets.js** - Isosurfaces/contours
    - Use case: Implicit surfaces, data slicing
    - Features: Marching squares/cubes

44. **LineIntegral.js** - Path integration visualization
    - Use case: Work, circulation
    - Features: Path definition, numerical integration

45. **SurfaceIntegral.js** - Flux visualization
    - Use case: Flux through surfaces
    - Features: Normal field integration

### Differential Geometry Tools
**Location**: `/code/items/geometry/`, `/code/items/geodesic-program/`

46. **GeodesicCurve.js** - Shortest paths on surfaces
    - Use case: Curved space geometry
    - Features: Geodesic equation integration
    - **Complex**: Christoffel symbols computation

47. **CurvatureTorsion.js** - Curve invariants
    - Use case: Curve analysis, differential geometry
    - Features: κ and τ computation and visualization

48. **GaussianCurvature.js** - Surface curvature
    - Use case: Surface classification, geometry
    - Features: K = κ₁κ₂ visualization

---

## 9. Physics & Simulation

### Spring Systems
**Location**: `/code/shaders/springs/`

49. **springForce.js** (shader) - Hooke's law forces
    - Use case: Elastic systems, networks
    - Features: Rest length, stiffness

50. **springGrid2D.js/grid3D.js** - Lattice springs
    - Use case: Cloth, membranes
    - Features: Neighbor connectivity

51. **springCollision.js** - Obstacle interaction
    - Use case: Physical constraints
    - Features: Plane/sphere collisions

### N-Body & Dynamics
**Location**: `/worlds/dynam-sys/` patterns

52. **GravitationalSystem.js** - N-body gravity
    - Use case: Celestial mechanics, many-body
    - Features: Symplectic integrators

53. **PendulumSystem.js** - Coupled pendulums
    - Use case: Oscillators, chaos
    - Features: Multiple coupling types

---

## 10. Specialized Rendering

### Ray Tracing Components
**Location**: `/code/items/raytrace/`

54. **RayMarchObject.js** - SDF-based rendering
    - Use case: Implicit surfaces, CSG
    - Features: Signed distance functions
    - **Powerful**: Complex shapes without mesh

55. **PathTracingMaterial.js** - Monte Carlo rendering
    - Use case: Realistic lighting
    - Features: Multiple bounces, materials

56. **SubsurfaceScattering.js** - SSS shader
    - Use case: Translucent materials
    - Features: Light penetration

### Custom Materials
**Location**: `/code/compute/materials/`

57. **CustomShaderMaterial** - Extended THREE materials
    - Use case: Vertex + fragment customization
    - Features: Preserves built-in lighting
    - **From**: `/3party/three-csm.m.js`

58. **TimeVaryingMaterial.js** - Animated shaders
    - Pattern: Uniform time parameter
    - Use case: Dynamic effects, evolution

---

## 11. Map Projections & Transformations

**Location**: `/code/items/maps/`

59. **Stereographic.js** - Sphere ↔ plane
    - Use case: Conformal maps, complex analysis
    - Features: North/south pole projections

60. **Mercator.js** - Cylindrical projection
    - Use case: Geography, navigation

61. **Azimuthal.js** - Polar projections
    - Use case: Spherical data visualization

62. **CylindricalProjection.js** - General cylinders
    - Use case: Wrapping patterns onto surfaces

---

## 12. Specialized Mathematical Objects

### Topology Surfaces
**Location**: `/worlds/topology/` patterns

63. **MobiusStrip.js** - Non-orientable surface
    - Features: Parametric, with twist visualization

64. **KleinBottle.js** - 4D immersion in 3D
    - Features: Self-intersection handling

65. **TorusKnot.js** - (p,q)-torus knots
    - Use case: Knot theory, topology
    - Features: Parametric knots, tube rendering

### Complex Analysis
**Location**: `/worlds/complex/` patterns

66. **ComplexPlot.js** - Domain coloring
    - Use case: Visualizing f: ℂ → ℂ
    - Features: Phase/magnitude coloring

67. **RiemannSphere.js** - Extended complex plane
    - Use case: Complex analysis, stereographic

68. **ConformalMap.js** - Angle-preserving maps
    - Use case: Complex function visualization

---

## 13. Data Visualization Utilities

### Color Mapping
**Common patterns across all categories**

69. **ColorRamp.js** - Scalar → Color mapping
    - Use case: Heatmaps, data viz
    - Features: Multiple colormaps (viridis, rainbow, etc.)
    - **Critical**: Perceptually uniform options

70. **DiscreteColorMap.js** - Categorical coloring
    - Use case: Region labeling, classification

### Legend & Annotation
**Location**: Patterns in various demos

71. **ColorBar.js** - Legend for color maps
    - Use case: Every heatmap/field visualization
    - Features: Scale labels, orientation

72. **TextLabel3D.js** - Positioned text in 3D
    - Use case: Annotations, axis labels
    - Features: Billboard, LaTeX potential

---

## 14. Utility Classes & Helpers

### Geometry Utilities
**Location**: `/code/compute/parametric/`

73. **ParametricGeometry** helpers
    - UV grid generation
    - Normal computation
    - Texture coordinate mapping

### MeshLine
**Location**: `/3party/MeshLine.js`

74. **MeshLine** - Lines with thickness
    - Use case: Visible curves in 3D
    - Features: Uniform width, tapering
    - **Better than**: THREE.Line (which has inconsistent width)

### Environment & Lighting
**Location**: `/code/World/template/`

75. **createEnvironment.js** - Sky/background setup
    - Features: Solid color, cube maps, PMREM
    - Use case: Every scene

76. **lights.js** (fixed!) - Standard lighting setup
    - Features: Ambient + directional lights
    - Use case: Default illumination

---

## 15. Advanced Features Worth Preserving

### PMREM (HDR Environment)
**Location**: `/code/World/components/createRenderer.js`

77. **PMREMGenerator Integration**
    - Use case: Realistic reflections, IBL
    - Features: Environment map processing

### OrbitControls Patterns
**Location**: `/code/World/components/createControls.js`

78. **Enhanced OrbitControls**
    - Features: Min/max distance, auto-rotate
    - Use case: Every interactive camera

### Stats Integration
**Location**: `/code/World/components/createStats.js`

79. **Performance Monitoring**
    - Use case: Development, optimization
    - Features: FPS, memory usage

---

## 16. Organization Patterns for New System

### Recommended Structure

```
new-system/
├── core/                          # Framework (World equivalent)
│   ├── Scene.js
│   ├── Loop.js
│   └── UI.js
│
├── primitives/                    # #1-7 (basic shapes, grids, axes)
│   ├── shapes/
│   ├── grids/
│   └── coordinates/
│
├── surfaces/                      # #8-11 (parametric, implicit, curves)
│   ├── parametric/
│   ├── implicit/
│   └── curves/
│
├── visualization/                 # #13-19 (plotters, fields, contours)
│   ├── functions/
│   ├── fields/
│   └── calculus/
│
├── shaders/                       # #20-30 (GLSL utilities)
│   ├── math/                      # complex, bessel, etc.
│   ├── geometry/                  # rotations, projections
│   └── colors/                    # color spaces, vision
│
├── compute/                       # #31-37 (GPU, ODE solvers)
│   ├── gpu/
│   └── solvers/
│
├── math/                          # #42-48 (vector calc, diff geo)
│   ├── vector-calculus/
│   └── differential-geometry/
│
├── physics/                       # #49-53 (springs, n-body)
│   ├── springs/
│   └── dynamics/
│
├── rendering/                     # #54-58 (raytracing, materials)
│   ├── raytrace/
│   └── materials/
│
├── projections/                   # #59-62 (map projections)
│
├── specialized/                   # #63-68 (topology, complex)
│   ├── topology/
│   └── complex-analysis/
│
├── ui/                           # #38-41, #69-72 (params, legends)
│   ├── parameters/
│   └── visualization/
│
└── utils/                        # #73-79 (helpers, lights)
    ├── geometry/
    ├── environment/
    └── performance/
```

---

## 17. Critical Patterns to Maintain

### 1. Update Pattern
```javascript
class Component {
    update(options = {}) {
        // Merge new options
        Object.assign(this.params, options);
        // Regenerate geometry/material as needed
        this.rebuild();
    }
}
```

### 2. Tick Pattern
```javascript
tick(time, deltaTime) {
    // Time-based animation
    // Called every frame automatically
}
```

### 3. Disposal Pattern
```javascript
dispose() {
    // Clean up geometry
    this.geometry.dispose();
    // Clean up material
    this.material.dispose();
    // Remove from scene
    this.parent?.remove(this.mesh);
}
```

### 4. Builder Pattern
```javascript
class Surface {
    constructor(params) {
        this.params = {...defaultParams, ...params};
        this.build();
    }

    build() {
        this.geometry = this.createGeometry();
        this.material = this.createMaterial();
        this.mesh = new Mesh(this.geometry, this.material);
    }

    rebuild() {
        this.dispose();
        this.build();
    }
}
```

---

## 18. Dependencies to Vendor

### Essential Third-Party
1. **Three.js** - Obviously
2. **math.js** - Math expression parser (if keeping equation inputs)
3. **MeshLine.js** - Better line rendering
4. **dat.GUI** or equivalent - Parameter controls

### Consider Replacing
- **CustomShaderMaterial** - Might be outdated, check if THREE.js has better support now
- **ParametricGeometry** - THREE.js might have improved this

---

## 19. Features NOT to Port (Demo-Specific)

### These are too specialized:
- Specific surface equations (torus, Klein bottle, etc.) - Build on demand
- Hardcoded attractors (Lorenz, etc.) - Example data only
- Preset color schemes - User configurable
- Specific shader formulas - Composable instead
- Woodcuts rendering - Very specialized
- Blackhole geodesics - Physics package material

---

## 20. New Features to Add

### Based on gaps in current system:

**Testing Infrastructure**
- Unit tests for math functions
- Visual regression tests for surfaces
- Performance benchmarks

**Documentation**
- API documentation (JSDoc → docs)
- Examples gallery
- Migration guides

**Build System**
- Already have Vite ✓
- Tree-shaking for minimal bundles
- TypeScript support (optional)

**Error Handling**
- Graceful fallbacks for parser errors
- Validation for parameter ranges
- User-friendly error messages

**Accessibility**
- Keyboard controls
- Screen reader support
- High contrast modes

---

## Summary: Priority List for New System

### Tier 1: Core Infrastructure (Must Have)
1. World/Scene/Loop framework (#1)
2. Parametric surfaces & curves (#8, #9)
3. Basic shapes & grids (#1-7)
4. Shader math utilities (#20-24)
5. ODE solvers (#34-36)

### Tier 2: Visualization Essentials
6. Function plotters (#13-16)
7. Vector fields (#14-15)
8. Color mapping (#69-70)
9. Parameter system (#38)
10. UI patterns (#39-41)

### Tier 3: Advanced Math
11. Differential geometry (#25, #46-48)
12. Vector calculus (#42-45)
13. Complex analysis (#20, #66-68)
14. GPU compute (#31-33)

### Tier 4: Specialized Features
15. Ray tracing (#54-56)
16. Spring physics (#49-51)
17. Map projections (#59-62)
18. N-body systems (#52-53)

### Tier 5: Polish & Utilities
19. Labels & legends (#71-72)
20. Performance tools (#79)
21. Documentation & examples

---

## Final Thoughts

Your current codebase has **~70 truly reusable components** that form the foundation of mathematical visualization. The beauty is in how modular it already is - these components compose well.

For your new system:
- **Start with Tier 1** - Get the framework right
- **Add Tier 2 incrementally** - Build as you need them
- **Keep shader library intact** - It's already beautifully modular
- **Make everything tree-shakeable** - Only bundle what you use
- **Test as you go** - Each component should work standalone

The current codebase is an excellent reference architecture. The patterns are solid - you just need to extract them into a proper library structure.
