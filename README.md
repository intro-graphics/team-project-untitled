# Tetris with tiny-graphics.js

####This is the Github repository for UCLA CS174A team project Tetris.

## **Group Members:**

##### Jingchen Tang & Siyu Qian & Wenjie Mo & Zihao Dong

### **Introduction:**

##### Everyone has played a basic version of Tetris. Our team wants to improve its graphics into a more modem and advanced scale. In Particular, we want to give light and shadow effects on each block and add more details on the blocks such as different textures, collision effects when two blocks touch. The goal of our project is to make a Tetris game with more advanced graphics effects.

#**screenshots**

##**Advance features and solutions**

###Shadowing
#####To achieve the effect of 3D aesthetics, shadowing could be applied onto the cubes while falling down and impose a shade on the cubes below, as well as the overall interface of the game could have a 3D shape which also requires shading in there, which enhances the reality aspect of the project. The details of shadows can be referred from Figure 2. Although the final shadowing work has not been completed. We want to achieve the shadowing effect like figure 2

###Collision Detection
##### Since the falling polygon needs to be placed above the existing polygons,  we will use collision detection to detect the intersection of the falling object and the existing objects at the bottom. Once the bottom of the falling object  comes in contact with one of the existing objects, we will stop the motion of the falling object and let it stay in its current position. Collision detection can also be applied to restrict the falling object in a frame. The falling object can only be moved left and right within the frame. The effect of collision detection is presented in Figure 3.

###Physics-based simulation
#####The downward acceleration of blocks when pressed down button will be based on the real world acceleration. Also, when the blocks touch each other, there will be a light bounce effect which will be based on our physics modeling of the blocks.


**References**