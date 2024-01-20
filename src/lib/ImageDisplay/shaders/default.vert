#version 300 es
precision highp float;

in vec4 aVertexPosition;
in vec2 aTextureCoordinate;

out vec2 vTextureCoordinate;

void main() {
    gl_Position = aVertexPosition;
    vTextureCoordinate = aTextureCoordinate;
}