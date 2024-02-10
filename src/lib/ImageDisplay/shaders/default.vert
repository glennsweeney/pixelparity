#version 300 es
precision highp float;

uniform mat4 viewTransform;

in vec4 aVertexPosition;
in vec2 aTextureCoordinate;

out vec2 vTextureCoordinate;

void main() {
    gl_Position = viewTransform * aVertexPosition;
    vTextureCoordinate = aTextureCoordinate;
}