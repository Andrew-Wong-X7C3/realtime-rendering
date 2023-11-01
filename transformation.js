function identity() {
    return mat4.identity(mat4.create());
}

function translation(dx, dy, dz) {
    matrix = mat4.translate(identity(), [dx, dy, dz]);
    return matrix;

}

function scale(sx, sy, sz) {
    matrix = mat4.scale(identity(), [sx, sy, sz]);
    return matrix;
}

function rotation(rx, ry, rz) {
    rx *= Math.PI / 180
    ry *= Math.PI / 180
    rz *= Math.PI / 180

    var matrix = identity();
    matrix = mat4.rotateX(matrix, rx);
    matrix = mat4.rotateY(matrix, ry);
    matrix = mat4.rotateZ(matrix, rz);
    return matrix;
}

function multiply(m1, m2) {
    var matrix = identity();
    mat4.multiply(m1, m2, matrix);
    return matrix;
}