class Primitive {
    constructor(name, obj, children) {
        this.name = name;
        this.obj = obj;
        this.mMatrix = identity();
        this.localMatrix = identity();
        this.children = children;
    }
}


function computeSurfaceNormals(vertices, faces) {
    var surfaceNormals = new Float32Array(faces.length);
    const npts = vertices.length / 3;
    const ntris = faces.length / 3;
    for (var i = 0; i < ntris; i ++) {
        var tri = [faces[i*3], faces[i*3+1], faces[i*3+2]];
        // var tri = [faces[i*11+1], faces[i*11+2], faces[i*11+3]];
        var p0 = [vertices[tri[0]*3], vertices[tri[0]*3+1], vertices[tri[0]*3+2]];
        var p1 = [vertices[tri[1]*3], vertices[tri[1]*3+1], vertices[tri[1]*3+2]];
        var p2 = [vertices[tri[2]*3], vertices[tri[2]*3+1], vertices[tri[2]*3+2]];

        var u = [p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]];
        var v = [p2[0] - p0[0], p2[1] - p0[1], p2[2] - p0[2]];

        surfaceNormals[i*3] = u[1]*v[2] - u[2]*v[1];
        surfaceNormals[i*3+1] = u[2]*v[0] - u[0]*v[2];
        surfaceNormals[i*3+2] = u[0]*v[1] - u[1]*v[0];
    }
    return surfaceNormals;
}


function computeVertexNormals(vertices, faces, surfaceNormals) {
    var vertexNormals = new Float32Array(vertices.length);
    const npts = vertices.length / 3;
    const ntris = faces.length / 3;
    for (var i = 0; i < ntris; i++) {
        // var tri = [faces[i*11+1], faces[i*11+2], faces[i*11+3]];
        var tri = [faces[i*3], faces[i*3+1], faces[i*3+2]];

        for (var t = 0; t < 3; t ++) {
            for (var j = 0; j < 3; j ++) {
                vertexNormals[tri[t]*3+j] = vertexNormals[tri[t]*3+j] + surfaceNormals[i*3+j];
            }
        }
    }

    for (var i = 0; i < npts; i ++) {
        var n = [vertexNormals[i*3], vertexNormals[i*3+1], vertexNormals[i*3+2]];
        var mag = Math.sqrt(n[0]*n[0] + n[1]*n[1] + n[2]*n[2]);
        for (var j = 0; j < 3; j ++)
            vertexNormals[i*3+j] = vertexNormals[i*3+j] / mag;
    }
    return vertexNormals;
}


function loadTexture(gl, url) {

    function isPowerOf2(value) {
        return (value & (value - 1)) === 0;
      }
    
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    const pixel = new Uint8Array([0, 0, 255, 255]);
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border, srcFormat, srcType, pixel);
  
    var image = new Image();
    image.src = url;
    image.onload = () => {
    
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, image);

        if (isPowerOf2(image.width) && isPowerOf2(image.height)) {

            gl.generateMipmap(gl.TEXTURE_2D);

        } else {

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

        }

    };
    
    return texture;
}


function initCube(gl, size, colors) {

    var cube = new Object();

    // ========================================================================================
    var cubeVertexPositionBuffer = gl.createBuffer();  
    var cubeVertices = [
        -1.0, -1.0,  1.0,
         1.0, -1.0,  1.0,
         1.0,  1.0,  1.0,
        -1.0,  1.0,  1.0,
      
        -1.0, -1.0, -1.0,
        -1.0,  1.0, -1.0,
         1.0,  1.0, -1.0,
         1.0, -1.0, -1.0,
      
        -1.0,  1.0, -1.0,
        -1.0,  1.0,  1.0,
         1.0,  1.0,  1.0,
         1.0,  1.0, -1.0,

        -1.0, -1.0, -1.0,
         1.0, -1.0, -1.0,
         1.0, -1.0,  1.0,
        -1.0, -1.0,  1.0,

         1.0, -1.0, -1.0,
         1.0,  1.0, -1.0,
         1.0,  1.0,  1.0,
         1.0, -1.0,  1.0,
      
        -1.0, -1.0, -1.0,
        -1.0, -1.0,  1.0,
        -1.0,  1.0,  1.0,
        -1.0,  1.0, -1.0,
    ].map((x) => x * size);

    cubeVertexPositionBuffer.itemSize = 3;
    cubeVertexPositionBuffer.numItems = 24;
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeVertices), gl.STATIC_DRAW);
    // ========================================================================================

    // ========================================================================================
    var cubeVertexIndexBuffer = gl.createBuffer();  
    var cubeIndices = [
        0,  1,  2,      0,  2,  3,
        4,  5,  6,      4,  6,  7,
        8,  9,  10,     8,  10, 11,
        12, 13, 14,     12, 14, 15,
        16, 17, 18,     16, 18, 19,
        20, 21, 22,     20, 22, 23,
    ];

    cubeVertexIndexBuffer.itemSize = 1;
    cubeVertexIndexBuffer.numItems = 36;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer); 
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeIndices), gl.STATIC_DRAW);  
    // ========================================================================================

    // ========================================================================================
    var cubeVertexColorBuffer = gl.createBuffer();
    var cubeColors = [];

    colors.forEach((face_color) => {
        cubeColors = cubeColors.concat(face_color, face_color, face_color, face_color)
    });

    cubeVertexColorBuffer.itemSize = 3;
    cubeVertexColorBuffer.numItems = 24;
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeColors), gl.STATIC_DRAW);
    // ========================================================================================

    // ========================================================================================
    var cubeVertexNormalBuffer =  gl.createBuffer();
    var surfaceNormals = computeSurfaceNormals(cubeVertices, cubeIndices);
    var vertexNormals = computeVertexNormals(cubeVertices, cubeIndices, surfaceNormals);

    cubeVertexNormalBuffer.itemSize = 3;
    cubeVertexNormalBuffer.numItems = vertexNormals.length / 3;
    gl.bindBuffer(gl.ARRAY_BUFFER,  cubeVertexNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormals), gl.STATIC_DRAW);
    // ========================================================================================

    cube = {
        vertexBuffer:   cubeVertexPositionBuffer,
        indexBuffer:    cubeVertexIndexBuffer,
        colorBuffer:    cubeVertexColorBuffer,
        normalBuffer:   cubeVertexNormalBuffer,
        textureBuffer:  null
    }

    return cube;
}


function initCylinder(gl, radiusTop, radiusBottom, height, slices, stacks, colors) {

    var cylinder = new Object();

    // ========================================================================================
    var cylinderVertexPositionBuffer = gl.createBuffer();  
    var cylinderVertices = [];

    // sides
    for (var i = 0; i <= slices; i++) {

        var angle = i * 2 * Math.PI / slices;
        
        var topX = radiusTop * Math.cos(angle);
        var topZ = radiusTop * Math.sin(angle);

        var botX = radiusBottom * Math.cos(angle);
        var botZ = radiusBottom * Math.sin(angle);

        cylinderVertices.push(topX, -height / 2, topZ);
        cylinderVertices.push(botX,  height / 2, botZ);
    }

    cylinderVertexPositionBuffer.itemSize = 3;
    cylinderVertexPositionBuffer.numItems = cylinderVertices.length / 3;
    gl.bindBuffer(gl.ARRAY_BUFFER, cylinderVertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cylinderVertices), gl.STATIC_DRAW);
    // ========================================================================================

    // ========================================================================================
    var cylinderVertexIndexBuffer = gl.createBuffer();  
    var cylinderIndices = [];

    for (var i = 0; i < stacks * slices; i++) {

        // ends
        if (i % 2 == 0) {
            cylinderIndices.push(0, i + 2, i);
        } else {
            cylinderIndices.push(i, i + 2, 1);
        }

        // sides
        cylinderIndices.push(i, i + 1, i + 2);
        cylinderIndices.push(i, i + 2, i + 1);

    }

    cylinderVertexIndexBuffer.itemSize = 1;
    cylinderVertexIndexBuffer.numItems = cylinderIndices.length;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cylinderVertexIndexBuffer); 
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cylinderIndices), gl.STATIC_DRAW);  
    // ========================================================================================

    // ========================================================================================
    var cylinderVertexColorBuffer = gl.createBuffer();
    var cylinderColors = [];

    for (var i = 0; i < cylinderVertices.length; i++) {
        if (i % 2 == 0) {
            cylinderColors = cylinderColors.concat(colors[0]);
        } else {
            cylinderColors = cylinderColors.concat(colors[1]);
        }
    }

    cylinderVertexColorBuffer.itemSize = 3;
    cylinderVertexColorBuffer.numItems = cylinderVertices.length;
    gl.bindBuffer(gl.ARRAY_BUFFER, cylinderVertexColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cylinderColors), gl.STATIC_DRAW);
    // ========================================================================================

    // ========================================================================================
    var cylinderVertexNormalBuffer =  gl.createBuffer();
    var surfaceNormals = computeSurfaceNormals(cylinderVertices, cylinderIndices);
    var vertexNormals = computeVertexNormals(cylinderVertices, cylinderIndices, surfaceNormals);

    cylinderVertexNormalBuffer.itemSize = 3;
    cylinderVertexNormalBuffer.numItems = vertexNormals.length / 3;
    gl.bindBuffer(gl.ARRAY_BUFFER,  cylinderVertexNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormals), gl.STATIC_DRAW);
    // ========================================================================================

    cylinder = {
        vertexBuffer:   cylinderVertexPositionBuffer,
        indexBuffer:    cylinderVertexIndexBuffer,
        colorBuffer:    cylinderVertexColorBuffer,
        normalBuffer:   cylinderVertexNormalBuffer,
        textureBuffer:  null
    }

    return cylinder;
}


function initSphere(gl, radius, vSlices, hSlices, color) {

    var sphere = new Object();

    // ========================================================================================
    var sphereVertexPositionBuffer = gl.createBuffer();    
    var sphereVertices = [];

    for (var vPos = 0; vPos <= vSlices; vPos++) {
        var vTheta = vPos * Math.PI / vSlices;
    
        for (var hPos = 0; hPos <= hSlices; hPos++) {
            var hTheta = hPos * 2 * Math.PI / hSlices;

            var x = Math.cos(hTheta) * Math.sin(vTheta);
            var y = Math.cos(vTheta);
            var z = Math.sin(hTheta) * Math.sin(vTheta);
            sphereVertices.push(x * radius, y * radius, z * radius);
            
        }
    }

    sphereVertexPositionBuffer.itemSize = 3;
    sphereVertexPositionBuffer.numItems = sphereVertices.length / 3;
    gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sphereVertices), gl.STATIC_DRAW);
    // ========================================================================================

    // ========================================================================================
    var sphereVertexIndexBuffer = gl.createBuffer();    
    var sphereIndices = [];

    for (var vPos = 0; vPos < vSlices; vPos++) {
        for (var hPos = 0; hPos < hSlices; hPos++) {
          var first = (vPos * (hSlices + 1)) + hPos;
          var second = first + hSlices + 1;
          sphereIndices.push(first, second, first + 1);
          sphereIndices.push(second, second + 1, first + 1);
        }
    }

    sphereVertexIndexBuffer.itemSize = 1;
    sphereVertexIndexBuffer.numItems = sphereIndices.length;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereVertexIndexBuffer); 
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(sphereIndices), gl.STATIC_DRAW);  
    // ========================================================================================

    // ========================================================================================
    var sphereVertexColorBuffer = gl.createBuffer();
    var sphereColors = [];

    for (var i = 0; i < sphereVertices.length; i++) {
        sphereColors = sphereColors.concat(color);
    }

    sphereVertexColorBuffer.itemSize = 3;
    sphereVertexColorBuffer.numItems = sphereColors.length / 3;
    gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sphereColors), gl.STATIC_DRAW);
    // ========================================================================================

    // ========================================================================================
    var sphereVertexNormalBuffer =  gl.createBuffer();
    var vertexNormals = [];

    for (var vPos = 0; vPos <= vSlices; vPos++) {
        var vTheta = vPos * Math.PI / vSlices;
    
        for (var hPos = 0; hPos <= hSlices; hPos++) {
            var hTheta = hPos * 2 * Math.PI / hSlices;

            var x = Math.cos(hTheta) * Math.sin(vTheta);
            var y = Math.cos(vTheta);
            var z = Math.sin(hTheta) * Math.sin(vTheta);
            vertexNormals.push(x / radius, y / radius, z / radius);
        }
    }

    sphereVertexNormalBuffer.itemSize = 3;
    sphereVertexNormalBuffer.numItems = vertexNormals.length / 3;
    gl.bindBuffer(gl.ARRAY_BUFFER,  sphereVertexNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormals), gl.STATIC_DRAW);
    // ========================================================================================

    sphere = {
        vertexBuffer:   sphereVertexPositionBuffer,
        indexBuffer:    sphereVertexIndexBuffer,
        colorBuffer:    sphereVertexColorBuffer,
        normalBuffer:   sphereVertexNormalBuffer,
        textureBuffer:  null
    }

    return sphere;
}