var gl;
var shaderProgram;
var canvas;


function initGL(canvas) {
    try {
        gl = canvas.getContext("webgl");
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
    } catch (e) {
    }
    if (!gl) {
        alert("Could not initialise WebGL, sorry :-(");
    }
}

// --------------------------------------------------------------------------------------------------------------------------------
var pMatrix;
var vMatrix;
var nMatrix;
var playerMatrix;

var togglePlayer = false;
var sceneObjects = [];

var light_ambient;
var light_diffuse;
var light_specular;
var light_pos;

var mat_ambient;
var mat_diffuse;
var mat_specular;
var mat_shine;


// control user input
function onKeyDown(event) {

    // player movement
    if (event.key == 'W') {
        playerMatrix = multiply(translation(-0.01,  0.00,  0.00), playerMatrix);
    }
    if (event.key == 'A') {
        playerMatrix = multiply(translation( 0.00,  0.00,  0.01), playerMatrix);
    }
    if (event.key == 'S') {
        playerMatrix = multiply(translation( 0.01,  0.00,  0.00), playerMatrix);
    }
    if (event.key == 'D') {
        playerMatrix = multiply(translation( 0.00,  0.00, -0.01), playerMatrix);
    }

    var primitive = sceneObjects.find(primitive => {return primitive.name == "centroid"});
    if (event.key == 'ArrowRight') {
        primitive.localMatrix = multiply(primitive.localMatrix, rotation(0,  10, 0));
    }
    if (event.key == 'ArrowLeft') {
        primitive.localMatrix = multiply(primitive.localMatrix, rotation(0, -10, 0));
    }
    if (event.key == 'ArrowUp') {
        playerMatrix = multiply(translation( 0.00,  0.01,  0.00), playerMatrix);
    }
    if (event.key == 'ArrowDown') {
        playerMatrix = multiply(translation( 0.00, -0.01,  0.00), playerMatrix);
    }

    // light movement
    var primitive = sceneObjects.find(primitive => {return primitive.name == "light"});
    if (event.key == 'L') {
        primitive.localMatrix = multiply(translation( 0.01,  0.00,  0.00), primitive.localMatrix);
        light_pos[0] += 0.01;
    }
    if (event.key == 'l') {
        primitive.localMatrix = multiply(translation(-0.01,  0.00,  0.00), primitive.localMatrix);
        light_pos[0] -= 0.01;
    }
    if (event.key == 'K') {
        primitive.localMatrix = multiply(translation( 0.00,  0.01,  0.00), primitive.localMatrix);
        light_pos[1] += 0.01;
    }
    if (event.key == 'k') {
        primitive.localMatrix = multiply(translation( 0.00, -0.01,  0.00), primitive.localMatrix);
        light_pos[1] -= 0.01;
    }
    if (event.key == 'J') {
        primitive.localMatrix = multiply(translation( 0.00,  0.00,  0.01), primitive.localMatrix);
        light_pos[2] += 0.01;
    }
    if (event.key == 'j') {
        primitive.localMatrix = multiply(translation( 0.00,  0.00, -0.01), primitive.localMatrix);
        light_pos[2] -= 0.01;
    }

    // camera pitch / yaw / roll
    if (event.key == 'p') {
        vMatrix = multiply(rotation( 5, 0, 0), vMatrix);
    }
    if (event.key == 'P') {
        vMatrix = multiply(rotation(-5, 0, 0), vMatrix);
    }
    if (event.key == 'y') {
        vMatrix = multiply(rotation(0,  5, 0), vMatrix);
    }
    if (event.key == 'Y') {
        vMatrix = multiply(rotation(0, -5, 0), vMatrix);
    }
    if (event.key == 'r') {
        vMatrix = multiply(rotation(0, 0,  5), vMatrix);
    }
    if (event.key == 'R') {
        vMatrix = multiply(rotation(0, 0, -5), vMatrix);
    }
}


// setup camera position
function initCamera() {   

    pMatrix = mat4.ortho(-1.0, 1.0, -1.0, 1.0, 0.1, 100);
	// pMatrix = mat4.perspective(60, 1.0, 0.1, 100, pMatrix);
	vMatrix = mat4.lookAt([1.0, 0.5, -1], [0, 0, 0], [0, 1, 0], vMatrix);
    nMatrix = identity();
    playerMatrix = identity();

}


// setup lighting conditions
function initLighting() {

    light_ambient   = [ 0.00,  0.00,  0.00,  1.00];
    light_diffuse   = [ 1.00,  1.00,  1.00,  1.00];
    light_specular  = [ 1.00,  1.00,  1.00,  1.00];
    light_pos       = [ 0.50, -0.50,  0.00,  1.00];
    
    mat_ambient     = [0.0, 0.0, 0.0, 1.0];
    mat_diffuse     = [0.5, 0.5, 0.5, 1.0];
    mat_specular    = [0.9, 0.9, 0.9, 1.0];
    mat_shine       = [50];

}


// create scene objects
function initBuffers() {
    
    // create objects
    sceneObjects.push(

        new Primitive("light",      initSphere(gl, radius=0.035, vSlices=10, hSlices=10, color=[1.00, 1.00, 1.00]), []),
        new Primitive("centroid",   initSphere(gl, radius=0.005, vSlices=1, hSlices=1, color=[1.00, 1.00, 1.00]), ["nucleus_1", "nucleus_2", "nucleus_3"]),

        new Primitive("floor",      initCube(gl, size=0.10, colors=[[1.0, 1.0, 1.0], [1.0, 1.0, 1.0], [0.5, 0.2, 0.1],
                                                                    [0.2, 0.6, 0.1], [1.0, 1.0, 1.0], [1.0, 1.0, 1.0]]), ["left_wall", "back_wall"]),
        new Primitive("left_wall",  initCube(gl, size=0.10, colors=[[1.0, 1.0, 1.0], [1.0, 1.0, 1.0], [0.2, 0.2, 0.1],
                                                                    [0.2, 0.6, 0.1], [1.0, 1.0, 1.0], [1.0, 1.0, 1.0]]), []),
        new Primitive("back_wall",  initCube(gl, size=0.10, colors=[[1.0, 1.0, 1.0], [1.0, 1.0, 1.0], [0.4, 0.3, 0.2],
                                                                    [0.2, 0.6, 0.1], [1.0, 1.0, 1.0], [1.0, 1.0, 1.0]]), []),

        new Primitive("arm_base",   initCube(gl, size=0.10, colors=[[0.1, 0.1, 0.1], [0.1, 0.1, 0.1], [0.7, 0.7, 0.7],
                                                                    [0.7, 0.7, 0.7], [0.2, 0.2, 0.2], [0.2, 0.2, 0.2]]), ["arm_body", "arm_head"]),
        new Primitive("arm_body",   initCube(gl, size=0.10, colors=[[0.1, 0.1, 0.1], [0.1, 0.1, 0.1], [0.7, 0.7, 0.7],
                                                                    [0.7, 0.7, 0.7], [0.2, 0.2, 0.2], [0.2, 0.2, 0.2]]), []),
        new Primitive("arm_head",   initCube(gl, size=0.10, colors=[[0.1, 0.1, 0.1], [0.1, 0.1, 0.1], [0.7, 0.7, 0.7],
                                                                    [0.7, 0.7, 0.7], [0.2, 0.2, 0.2], [0.2, 0.2, 0.2]]), []),

        new Primitive("grab_head",  initCube(gl, size=0.10, colors=[[0.1, 0.1, 0.1], [0.1, 0.1, 0.1], [0.7, 0.7, 0.7],
                                                                    [0.7, 0.7, 0.7], [0.2, 0.2, 0.2], [0.2, 0.2, 0.2]]), ["grab_top_1", "grab_top_2"]),
        new Primitive("grab_top_1", initCube(gl, size=0.10, colors=[[0.1, 0.1, 0.1], [0.1, 0.1, 0.1], [0.7, 0.7, 0.7],
                                                                    [0.7, 0.7, 0.7], [0.2, 0.2, 0.2], [0.2, 0.2, 0.2]]), ["grab_1", "grab_2"]),
        new Primitive("grab_top_2", initCube(gl, size=0.10, colors=[[0.1, 0.1, 0.1], [0.1, 0.1, 0.1], [0.7, 0.7, 0.7],
                                                                    [0.7, 0.7, 0.7], [0.2, 0.2, 0.2], [0.2, 0.2, 0.2]]), ["grab_3", "grab_4"]),
        new Primitive("grab_1",     initCube(gl, size=0.10, colors=[[0.1, 0.1, 0.1], [0.1, 0.1, 0.1], [0.7, 0.7, 0.7],
                                                                    [0.7, 0.7, 0.7], [0.2, 0.2, 0.2], [0.2, 0.2, 0.2]]), []),
        new Primitive("grab_2",     initCube(gl, size=0.10, colors=[[0.1, 0.1, 0.1], [0.1, 0.1, 0.1], [0.7, 0.7, 0.7],
                                                                    [0.7, 0.7, 0.7], [0.2, 0.2, 0.2], [0.2, 0.2, 0.2]]), []),
        new Primitive("grab_3",     initCube(gl, size=0.10, colors=[[0.1, 0.1, 0.1], [0.1, 0.1, 0.1], [0.7, 0.7, 0.7],
                                                                    [0.7, 0.7, 0.7], [0.2, 0.2, 0.2], [0.2, 0.2, 0.2]]), []),
        new Primitive("grab_4",     initCube(gl, size=0.10, colors=[[0.1, 0.1, 0.1], [0.1, 0.1, 0.1], [0.7, 0.7, 0.7],
                                                                    [0.7, 0.7, 0.7], [0.2, 0.2, 0.2], [0.2, 0.2, 0.2]]), []),


        new Primitive("stand",      initCylinder(gl, radiusTop=0.07, radiusBottom=0.20, height=0.40, slices=50, stacks=2, colors=[[0.10, 0.40, 0.50], [0.30, 0.40, 0.50]]), []),

        new Primitive("nucleus_1",  initCylinder(gl, radiusTop=0.03, radiusBottom=0.03, height=0.2, slices=10, stacks=2, colors=[[0.00, 0.75, 0.50], [0.40, 0.20, 0.70]]), ["orbit_1"]),
        new Primitive("nucleus_2",  initCylinder(gl, radiusTop=0.03, radiusBottom=0.03, height=0.2, slices=10, stacks=2, colors=[[0.00, 1.00, 1.00], [0.40, 0.20, 0.70]]), ["orbit_2"]),
        new Primitive("nucleus_3",  initCylinder(gl, radiusTop=0.03, radiusBottom=0.03, height=0.2, slices=10, stacks=2, colors=[[0.00, 0.75, 0.75], [0.40, 0.20, 0.70]]), ["orbit_3"]),

        new Primitive("orbit_1",    initSphere(gl, radius=0.045, vSlices=15, hSlices=15, color=[1.00, 0.50, 0.25]), []),
        new Primitive("orbit_2",    initSphere(gl, radius=0.045, vSlices=15, hSlices=15, color=[1.00, 0.25, 0.25]), []),
        new Primitive("orbit_3",    initSphere(gl, radius=0.045, vSlices=15, hSlices=15, color=[1.00, 0.25, 0.50]), []),

    );
}


// apply hierarchical transformation
function updateChildren(node) {
    node.children.forEach((name) => {
        var child = sceneObjects.find(primitive => {return primitive.name == name});
        mat4.multiply(node.mMatrix, child.mMatrix, child.mMatrix);
        updateChildren(child);
    });

}


// set initial scene layout
function setScene() {

    // function to apply transform to model model matrix
    function transformConstructor(transforms) {
        var transformMatrix = identity();
        transforms.slice().reverse().forEach((transform) => { transformMatrix = multiply(transform, transformMatrix) });
        return transformMatrix;
    }

    // define room size
    var scaleRoomX = 5.50;
    var scaleRoomY = 5.50;
    var scaleRoomZ = 5.50;

    // apply setup transforms to each primitive
    sceneObjects.filter(primitive => {

        if (primitive.name == "light") {
            primitive.localMatrix = transformConstructor([translation(0.5, -0.5, 0.0)])
        }

        if (primitive.name == "model") {
            primitive.localMatrix = transformConstructor([translation(0.5, -0.5, 0.0), rotation(0, 180, 0), scale(0.00, 0.00, 0.00)])
        }
        if (primitive.name == "centroid") {
            primitive.mMatrix = translation(0.00, 0.05, -0.25);
        }

        if (primitive.name == "floor") {
            primitive.localMatrix = transformConstructor([translation(0.0, -0.30, 0.0), scale(1.00, 0.01, 1.00)])
            primitive.mMatrix = multiply(translation(0.00, 1.00, 0.00), scale(scaleRoomX, scaleRoomY, scaleRoomZ));
        }
        if (primitive.name == "left_wall") {
            primitive.localMatrix = transformConstructor([translation(-1.00 / 10, -0.2, 0.0), rotation(0, 0, 270), scale(1.00, 0.01, 1.00)]);
        }
        if (primitive.name == "back_wall") {
            primitive.localMatrix = transformConstructor([translation( 0.0, -0.2, 1.00 / 10), rotation(270, 0, 0), scale(1.00, 0.01, 1.00)]);
        }

        if (primitive.name == "arm_base") {
            primitive.localMatrix = transformConstructor([translation(0.00, -0.70, 0.30), scale(1.5, 0.5, 1.5)]);
            primitive.mMatrix = translation(0.00, 0.10, 0.00);
        }
        if (primitive.name == "arm_body") {
            primitive.localMatrix = transformConstructor([translation(0.00, -0.05, 0.30), scale(0.5, 6.0, 0.5)]);
        }
        if (primitive.name == "arm_head") {
            primitive.localMatrix = transformConstructor([translation(0.00,  0.55, 0.10), scale(6.0, 0.05, 6.0)]);
        }

        if (primitive.name == "grab_head") {
            primitive.localMatrix = transformConstructor([translation(0.0,  0.45, 0.00), scale(0.25, 1.00, 0.25)]);
            primitive.mMatrix = translation(0.00, 0.10, -0.25);
        }
        if (primitive.name == "grab_top_1") {
            primitive.localMatrix = transformConstructor([translation( 0.000, 0.35, 0.000), scale(2.00, 0.25, 0.25)]);
        }
        if (primitive.name == "grab_top_2") {
            primitive.localMatrix = transformConstructor([translation( 0.000, 0.35, 0.000), scale(0.25, 0.25, 2.00)]);
        }
        if (primitive.name == "grab_1") {
            primitive.localMatrix = transformConstructor([translation( 0.000, 0.20, 0.075), scale(0.25, 0.25, 0.25)]);
        }
        if (primitive.name == "grab_2") {
            primitive.localMatrix = transformConstructor([translation( 0.000, 0.20, 0.425), scale(0.25, 0.25, 0.25)]);
        }
        if (primitive.name == "grab_3") {
            primitive.localMatrix = transformConstructor([translation( 0.175, 0.20, 0.250), scale(0.25, 0.25, 0.25)]);
        }
        if (primitive.name == "grab_4") {
            primitive.localMatrix = transformConstructor([translation(-0.175, 0.20, 0.250), scale(0.25, 0.25, 0.25)]);
        }

        if (primitive.name == "stand") {
            primitive.localMatrix = transformConstructor([translation(0.0, -0.45, -0.25), rotation(0, 180, 0)]);
        }

        if (primitive.name == "nucleus_1") {
            primitive.localMatrix = rotation(90, 0, 0);
        }
        if (primitive.name == "nucleus_2") {
            primitive.localMatrix = rotation(0, 90, 0);
        }
        if (primitive.name == "nucleus_3") {
            primitive.localMatrix = rotation(0, 0, 90);
        }

    });

    // apply hierarchical transformation and set player initial position
    sceneObjects.forEach(primitive => updateChildren(primitive));
    playerMatrix = translation(0, 0.10, -0.25);

}


// draw scene
function drawScene() {

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.enable(gl.DEPTH_TEST);

    // iterate over objects in scene
    sceneObjects.forEach((primitive) => {
        
        // get object and calculate model matrix
        var obj = primitive.obj;
        var mMatrix = multiply(primitive.mMatrix, primitive.localMatrix);

        // setup normal matrix
        nMatrix = identity(); 
        nMatrix = mat4.multiply(nMatrix, vMatrix);
        nMatrix = mat4.multiply(nMatrix, mMatrix); 	
        nMatrix = mat4.inverse(nMatrix);
        nMatrix = mat4.transpose(nMatrix); 

        // bind mat4 matrices
        // ================================================================================================================
        gl.uniformMatrix4fv(shaderProgram.mMatrixUniform, false, mMatrix);
        gl.uniformMatrix4fv(shaderProgram.vMatrixUniform, false, vMatrix);
        gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
        gl.uniformMatrix4fv(shaderProgram.nMatrixUniform, false, nMatrix);

        // bind lighting matrices
        // ================================================================================================================
        gl.uniform4f(shaderProgram.light_posUniform, light_pos[0], light_pos[1], light_pos[2], light_pos[3]); 	
        gl.uniform4f(shaderProgram.ambient_coefUniform, mat_ambient[0], mat_ambient[1], mat_ambient[2], 1.0); 
        gl.uniform4f(shaderProgram.diffuse_coefUniform, mat_diffuse[0], mat_diffuse[1], mat_diffuse[2], 1.0); 
        gl.uniform4f(shaderProgram.specular_coefUniform, mat_specular[0], mat_specular[1], mat_specular[2],1.0); 
        gl.uniform1f(shaderProgram.shininess_coefUniform, mat_shine[0]); 
    
        gl.uniform4f(shaderProgram.light_ambientUniform, light_ambient[0], light_ambient[1], light_ambient[2], 1.0); 
        gl.uniform4f(shaderProgram.light_diffuseUniform, light_diffuse[0], light_diffuse[1], light_diffuse[2], 1.0); 
        gl.uniform4f(shaderProgram.light_specularUniform, light_specular[0], light_specular[1], light_specular[2], 1.0); 
    
        // draw object
        // ================================================================================================================
        gl.bindBuffer(gl.ARRAY_BUFFER, obj.normalBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, obj.normalBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, obj.vertexBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, obj.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, obj.colorBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexColorAttribute,obj.colorBuffer.itemSize, gl.FLOAT, false, 0, 0);

        if(obj.textureBuffer != null) {
            gl.bindBuffer(gl.ARRAY_BUFFER, obj.textureBuffer);
            gl.vertexAttribPointer(shaderProgram.vertexTexCoordsAttribute, obj.textureBuffer.itemSize, gl.FLOAT, false, 0, 0);
            gl.uniform1i(shaderProgram.use_textureUniform, 1);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, obj.textureBuffer.texture);
        } else {
            gl.uniform1i(shaderProgram.use_textureUniform, 0);
        }

        
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indexBuffer);
        gl.drawElements(gl.TRIANGLES, obj.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

        // gl.drawArrays(gl.LINE_LOOP, 0, obj.vertexBuffer.numItems);
        // gl.drawArrays(gl.POINTS, 0, obj.vertexBuffer.numItems);

    });
}


// loop to update automatic object movement
function animationLoop() {

    var nucleus_degree = 0;
    var orbit_degree = 0;
    var d1;
    var d2;

    // function to calculate position for orbiting primitives
    function calculateOrbitPosition(offset) {
        var radian = (orbit_degree + offset) * Math.PI / 180;
        d1 = Math.cos(radian) / 5;
        d2 = Math.sin(radian) / 5;
        return d1, d2;
    }

    // execute every n milliseconds
    function updateAnimation() {
        
        // update angles
        orbit_degree += 5;
        orbit_degree = orbit_degree % 360;

        nucleus_degree += 0.25;
        nucleus_degree = nucleus_degree % 360;

        // get object root node
        var particleRoot = sceneObjects.find(primitive => {return primitive.name == "centroid"});

        // apply automatic movements to primitives
        sceneObjects.filter(primitive => {

            if (primitive.name.includes("centroid")) {
                primitive.mMatrix = playerMatrix;
            }

            if (primitive.name.includes("nucleus")) {
                primitive.mMatrix = rotation(nucleus_degree, -nucleus_degree, 2 * nucleus_degree);
            }

            if (primitive.name == "orbit_1") {
                d1, d2 = calculateOrbitPosition(45);
                primitive.mMatrix = translation(d1, 0, d2);
            }

            if (primitive.name == "orbit_2") {
                d1, d2 = calculateOrbitPosition(90);
                primitive.mMatrix = translation(0, d1, d2);
            }
            
            if (primitive.name == "orbit_3") {
                d1, d2 = calculateOrbitPosition(135);
                primitive.mMatrix = translation(d1, d2, 0);
            }
            
        });

        // apply hierarchical transformation to player controlled object
        updateChildren(particleRoot);
        drawScene();
        window.requestAnimationFrame(updateAnimation);
    }

    window.requestAnimationFrame(updateAnimation);
}


// control resizing
function onResize(event) {

    // calculate dimensions for largest possible square canvas
    var dimension = Math.min(window.innerWidth, window.innerHeight)
    gl.canvas.width = dimension * 0.9;
    gl.canvas.height = dimension * 0.9;

    // adjust viewport size and re-render
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    drawScene();
}


// setup webGL
function webGLStart() {

    // initialize
    canvas = document.getElementById("code00-canvas");
    initGL(canvas);
    initShaders();
    initCamera();
    initLighting();
    initBuffers();

    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize);

    // link shader variables
    shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
    shaderProgram.vertexTexCoordsAttribute = gl.getAttribLocation(shaderProgram, "aVertexTexCoords");
    gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
    gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);
    gl.enableVertexAttribArray(shaderProgram.vertexTexCoordsAttribute);

    shaderProgram.mMatrixUniform = gl.getUniformLocation(shaderProgram, "uMMatrix");
    shaderProgram.vMatrixUniform = gl.getUniformLocation(shaderProgram, "uVMatrix");
    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix");

    shaderProgram.light_posUniform = gl.getUniformLocation(shaderProgram, "light_pos");
    shaderProgram.ambient_coefUniform = gl.getUniformLocation(shaderProgram, "ambient_coef");
    shaderProgram.diffuse_coefUniform = gl.getUniformLocation(shaderProgram, "diffuse_coef");
    shaderProgram.specular_coefUniform = gl.getUniformLocation(shaderProgram, "specular_coef");
    shaderProgram.shininess_coefUniform = gl.getUniformLocation(shaderProgram, "mat_shininess");

    shaderProgram.light_ambientUniform = gl.getUniformLocation(shaderProgram, "light_ambient");
    shaderProgram.light_diffuseUniform = gl.getUniformLocation(shaderProgram, "light_diffuse");
    shaderProgram.light_specularUniform = gl.getUniformLocation(shaderProgram, "light_specular");

    shaderProgram.textureUniform = gl.getUniformLocation(shaderProgram, "texture");
    shaderProgram.use_textureUniform = gl.getUniformLocation(shaderProgram, "use_texture");

    // clear buffers
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);

    // destroy loading screen
    document.getElementById("loading").style.display = "none";

    // create scene
    setScene();
    animationLoop();
    window.sceneObjects = sceneObjects;

}