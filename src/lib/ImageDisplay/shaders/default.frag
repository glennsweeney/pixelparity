#version 300 es
precision highp float;

uniform sampler2D uSampler;

uniform vec2 uTexCenter;
uniform vec2 uTexScale;

in vec2 vTextureCoordinate;
out vec4 fragColor;

void main() {

        vec3 color = texture(uSampler, vTextureCoordinate).xyz;

        // Scale from float texture which is unnormalized to [0, 1]
        color = color / 255.0;

        fragColor = vec4(color, 1.0);

}