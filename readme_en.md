Imagine that you are a person live in 4D, your eyes can see 3D images instead of 2D because the additional 4th direction makes your retina 3 dimensional.
The poor 3D creatures (we) only have 2D visions, 3D images can only be seen by making voxels transparent, and this is what 4DViewer does. But we face a problem: Too many overlapping colors could make all things very blur, like a fog cluster. In order to solve this, we can select some cross sections(eg. cross sections in the direction of x, y and z through retina's center) to cut the 3D retina, and show those cross sections separetly.

## Guide：[Experience 4Der's visions and sence of direction (in Chinese)](https://wxyhly.github.io/archives/eye3d/)

## First meet

### A simple example: Hypercube [examples/hypercube.html](https://wxyhly.github.io/4dViewer/examples/hypercube.html?en)

Use left and right button to drag to rotate camera, scroll mouse wheel to zoom in / out. Now you are inside the hypercube. Try to zoom out to get out of it and you can see the entire hypercube from outside.
Hypercube(Also called tesseract) is made of 8 equillavent cubic cells(3D face). There are different spherical patterns painted at the center of each cell in order to distinguish them.

### Regular polychora and other fundamental 4D shapes [examples/polychora.html](https://wxyhly.github.io/4dViewer/examples/polychora.html?en)

You can select different shapes from the control panel.

## Start walking in 4D

After understanding some basical 4D shapes, let us experience *First-person perspective*。
**How to control:** 
- Move front, back, left, right, ana and kata(two new 4th directions) by pressing key `W` `S` `A` `D` `Q` `E`.
- Move upward/downward by holding `space`, when you relieve it you will fall down to the ground.
- Move your mouse around or press key `J` `L` `U` `O` to look around horizontally(eg. look around left-right and ana-kata)
- Scroll mouse wheel or press key `I` `K` to look upward/downward.
- Press `Z` `X` to rotate the 3D retina.
- Press `C` to toggle wireframe overlay, and press `H` to hide the control panel.

**Examples：**

### Slope [examples/slope.html](https://wxyhly.github.io/4dViewer/examples/slope.html?en)

This is a simple scene with some slopes, a platform and a tunel.
- Goal: Walk up to the platform, get through to the other side of the tunel.

### Game Tetraspace remake [examples/tetraspace.html](https://wxyhly.github.io/4dViewer/examples/tetraspace.html?en)
([Tetraspace](https://rantonels.itch.io/brane) is a free 4D game. Here I remade first 12 levels from tetraspace in the example.

+ Primary goal: Find the small white hypercube floating in the air without jumping, and touch it to get to the next level. Note: The blue hypercube block can be pushed by walking toward it, and the green hypercube is a laser emitter. You cannot touch the emitter and the laser beam.
+ Advanced goal: Pass through all levels with 3D retina only (without three cross section thumbnails' help)  (you can press the keyboard `C` to turn on the wireframe mode)

## Make progress in 4D

### 4D version of Minecraft [minecraft4d/](https://wxyhly.github.io/4dViewer/minecraft4d/?en)

### [Minecraft4D detail tutorial(in Chinese)](https://wxyhly.github.io/programs/mc4tutorial.html)

infinity 4D Minecraft world based on random seeds, in which you can explore different biomes, build and destroy blocks.

## 4D rigid body physics engine

### Some scenes

- 4D car [physique/car.html](https://wxyhly.github.io/4dViewer/physique/car.html?en)
- Dicone gyro[physique/gyro.html](https://wxyhly.github.io/4dViewer/physique/gyro.html?en)
- 4D chains
 + Spheritorus-Spheritorus link（Can be broken by moving easily）[physique/unlink.html](https://wxyhly.github.io/4dViewer/physique/unlink.html?en)
 + Spheritorus-Torisphere link[physique/st_ts_link.html](https://wxyhly.github.io/4dViewer/physique/st_ts_link.html?en)
 + Spheritorus-Tiger link[physique/st_tiger_link.html](https://wxyhly.github.io/4dViewer/physique/st_tiger_link.html?en)
 + Torisphere-Tiger link[physique/tiger_ts_link.html](https://wxyhly.github.io/4dViewer/physique/tiger_ts_link.html?en)
 + Tiger-Tiger link (one biger and one smaller)[physique/tiger_tiger_link.html](https://wxyhly.github.io/4dViewer/physique/tiger_tiger_link.html?en)

## Parameters in control panel
### Camera settings
- ***Fov***  Field of view, which can be also adjusted by key `9` `0`.

### Render settings

Note: In 4DViewer, the 3D retina is actually realised by layers of 2D cross sections.
- ***Thickness***  Adjust gaps between 2D cross sections layers, you can also use key `+` `-`.
- ***Flow***  Adjust layer opacity. It is recommended to keep the value moderate. A too large value will cause only the surface of the 3D retina to be visible. You can also use key `[` `]` to adjust it.
- ***ThumbSize***  Adjust the size of the cross section thumbnail, you can also use key `;` `'`.
- ***WireFrameMode***  Toggle wireframe mode by press key `C`, use `Ctrl+[` and `Ctrl+]` or `Alt+[` and `Alt+]` to adjust the thickness.
- ***bgColor4***  Background color of the 4D scene (like the color of 4D sky)
- ***bgColor3***  Background color of the 2D screen on which 3D retina is projected. Use key `,` `.` to adjust th color in the range of black, gray and white.
- ***Transparency***  When the scene is complex, we hope that some part of the 3D image could be more transparent. Hold on `Alt+1`, `Alt+2`, `Alt+3` or `Alt+4`, and right click the color you want.(There aree 4 color slots to be transparent) Click anywhere while holding `Alt` will remove all the transparent colors.
- if the FPS is too low, you can adjust the resolution by key`Ctrl+,` or `Alt+,` (decrease) and `Ctrl+.` or `Alt+.` (increase).

### Solar control

- ***Latitude*** Set latitude value from 0 to 90 degree (in Hopf coordination)
- ***SouthernTime*** and ***NorthernTime*** Two different timing systems related to 2 longitude values in Hopf coordination. 
- ***Season*** The orbit phase angle of the planet；
- ***SouthernTropic*** and ***NorthernTropic*** 
the minimum and the maximum latitude value on which sunlight can cast perpendicularly. eg. two obliquities of the ecliptic.
- ***M-G Periode***  and ***W-E Periode***  are hours for one rotation at south and north pole respectively.
- ***SunAngle*** and ***SunLatitude*** are only readable.
- ***TimeStep***  adjust the time passing speed.

## Inspiration (Thanks to)
- [4DToys](http://4dtoys.com/)
- [4DBlock](http://www.urticator.net/blocks/)
- [Tetraspace](https://rantonels.itch.io/brane)

## Further probable works

- 4D ray tracing offline renderer
- 4D fluid?