# Tetris implemented with tiny-graphics.js
This is the Github repository for UCLA CS174A Spring 2021 team project Tetris.

Table of contents
  * [Introduction](#Introduction)
  * [Group members](#Group%members)
  * [Demo](#Demo)
  * [Install and Usage](#Install%and%Usage)
  * [User's guide](#User's%guide)
  * [Advance features and solutions](#Advance%features%and%solutions)


## Introduction
Everyone has played a basic version of Tetris. Our team wants to improve its graphics into a more moden and advanced scale. After a five week development, we have achieved  many features such as light and shadow effects on each block, more detailed textures on the blocks, and collision effects when two blocks touch. Our project demo and feature explaination will be presnted below.

### Group members
Jingchen Tang & Siyu Qian & Wenjie Mo & Zihao Dong

## Demo

## Install and Usage
In a terminal window, run the following commands:

```shell
Chmod 777 host.bash
./host.bash
```

Then open the browser and type `localhost:8000` in the address line to open this project

## User's guide
### Game play
- The game will immediately start when the user enter `localhost:8000`
- The movemont of blocks could be controlled by arrow keys
  - Move left and right by pressing left and right arrow key
  - Accelerate block dropping by pressing down arrow key
  - Rotate block by pressing up arrow key
- The basic elimination and gameover rules will follow the original Tetris
### Extra controls
- The BGM could be turned on or turned off by clicking the Music start/mute button (music is muted by default)
- To restart the game, the user could click the restart button or refresh the page
- The field of view are free to be moved

## Advance features and solutions
### Shadowing
To achieve the effect of 3D aesthetics, shadowing could be applied onto the cubes while falling down and impose a shade on the cubes below, as well as the overall interface of the game could have a 3D shape which also requires shading in there, which enhances the reality aspect of the project. The details of shadows can be referred from Figure 2. Although the final shadowing work has not been completed. We want to achieve the shadowing effect like figure 2

### Collision Detection
Since the falling polygon needs to be placed above the existing polygons,  we will use collision detection to detect the intersection of the falling object and the existing objects at the bottom. Once the bottom of the falling object  comes in contact with one of the existing objects, we will stop the motion of the falling object and let it stay in its current position. Collision detection can also be applied to restrict the falling object in a frame. The falling object can only be moved left and right within the frame. The effect of collision detection is presented in Figure 3.

### Physics-based simulation
The downward acceleration of blocks when pressed down button will be based on the real world acceleration. Also, when the blocks touch each other, there will be a light bounce effect which will be based on our physics modeling of the blocks.

## References
