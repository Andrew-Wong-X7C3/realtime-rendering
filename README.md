# CSE 5542: Real-Time Rendering - Lab 4
Andrew Wong <br>
Wong.816@osu.edu

![screenshot](screenshots/Capture.JPG)

---
## Files
---
The lab 4 project consists of the following files:

    - 3D_Model
        - default-grey.jpg
        - texture.jpg
        - model.json
    - demo.txt
    - index.html
    - glMatrix-0.9.5.min.js
    - shader_setup.js
    - init_buffers.js
    - transformation.js
    - lab_3.js

The code was developed on Windows 11 using Firefox.

---
## Usage
---
The scene is of a hazmat character in a room with a floating particle. The particle's nucleus has three sub-particles orbiting it.

The player controls the hazmat character. The controls are as follows:

    - W:            move forward
    - A:            move left
    - S:            move backward
    - D:            move right
    - Left-Arrow:   rotate left
    - Right-Arrow:  rotate right
    - Up-Arrow:     raise
    - Down-Arrow:   lower

The camera can be controlled using the following commands:

    - P/p:  pitch
    - Y/y:  yaw
    - R/r:  roll

The light source can be moved in the world space using the following commands:

    - J/j:  X-axis
    - K/k:  Y-axis
    - L/l:  Z-axis

---
## Local Server
---
The code does not use any packaging software and requires a local server to work.