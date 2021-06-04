# Tetris implemented with tiny-graphics.js
This is the Github repository for UCLA CS174A Spring 2021 team project Tetris.

Table of contents
  * [Introduction](#Introduction)
  * [Group members](#Group-members)
  * [Demo](#Demo)
  * [Install and Usage](#Install-and-Usage)
  * [Player guide](#Player-guide)
  * [Advance features and solutions](#Advance-features-and-solutions)


## Introduction
Everyone has played a basic version of Tetris. Our team wants to improve its graphics into a more moden and advanced scale. After a five week development, we have achieved  many features such as light and shadow effects on each block, more detailed textures on the blocks, and collision effects when two blocks touch. Our project demo and feature explaination will be presnted below.

### Group members
Jingchen Tang, Siyu Qian, Wenjie Mo, Zihao Dong

## Demo
#### Game play:  

<img src="https://github.com/intro-graphics/team-project-untitled/raw/master/assets/gameplay.png" alt="gameplay" width="512"/>

#### Game over: 

<img src="https://github.com/intro-graphics/team-project-untitled/raw/master/assets/gameover.png" alt="gameplay" width="512"/>

## Install and Usage
In a terminal window, run the following commands:

```shell
Chmod 777 host.bat
./host.bash
```

Then open the browser and type `localhost:8000` in the address line to open this project
**Important notice: upon entering the localhost, if the screen is blank white, please hard reload the page** 

## Player guide
### Game play
- The first loading may take up to five seconds due to 3D model loading
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
The overall interface of the game has a 3D shape which also requires shading and illumination. There will be a shadowing effect on each falling block of Tereis. The shadows will appear at the ground as well as each block below the falling blocks, which enhances the reality aspect of the project. The details of shadowing effects are shown below.
#### Shadowing effects when blocks are on the ground or on other blocks
<img src="https://github.com/intro-graphics/team-project-untitled/raw/master/assets/stationary_shadow.png" alt="gameplay" width="256"/>

#### Shadowing effects when blocks are falling

<img src="https://github.com/intro-graphics/team-project-untitled/raw/master/assets/falling_shadow.jpeg" alt="gameplay" width="256"/>

### Collision Detection
Since the falling polygon needs to be placed above the existing polygons, we achieved collision detection to detect the intersection of the falling object and the existing objects at the bottom by tracking blocks with a 2D array. Once the bottom of a falling object comes in contact with one of the existing objects, it will stop the motion of the falling object and will stay in its current position. Collision detection can also be applied to restrict the falling object in a frame. The falling object can only be moved left and right within the frame. The effect of collision detection is presented below with a gif image.
#### Collision detection demo
<img src="https://github.com/intro-graphics/team-project-untitled/raw/master/assets/collision.gif" alt="gameplay" width="350"/>

### Physics-based simulation
The downward acceleration of blocks when pressed down button will be based on the real world acceleration. Two kinds of different accelerations could be applied by pressing 'switch drop style' button in control panel. The effect of Physics-based simulation is presented below with a gif image.
#### Acceleration of falling blocks
<img src="https://github.com/intro-graphics/team-project-untitled/raw/master/assets/physics.gif" alt="gameplay" width="350"/>

## Acknowledgement
Thanks for Prof. Law, TA. Guo, and TA. Lu for helpng us during the project development!

## References
[Softbody Tetris](www.youtube.com/watch?v=RfNlhw8FK74)  
[Tetris shadow](www.bilibili.com/video/BV1m64y1m77R)  
[Scoreboard](piazza.com/class/kmdt175ut4zth?cid=219)  
[Background](https://stock.adobe.com/images/ocean-waves-backdrop-sea-water-storm-wave-and-aqua-seamless-cartoon-vector-background-illustration/268551323?prev_url=detail)  
[Beach 3D models](https://free3d.com/3d-models/obj-beach)  


