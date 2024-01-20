#version 300 es
precision highp float;

uniform sampler2D uSampler;

uniform vec2 uTexCenter;
uniform vec2 uTexScale;

in vec2 vTextureCoordinate;
out vec4 fragColor;

void main() {

    // Scale texture coordinates
    vec2 texCoord = ((vTextureCoordinate - uTexCenter) * uTexScale) + uTexCenter;

    // Lookup texture
    if (texCoord.s < 0.0 || texCoord.s > 1.0 || texCoord.t < 0.0 || texCoord.t > 1.0) {
        fragColor = vec4(0.0, 0.0, 0.0, 0.0); // Set color to transparent
    } else {
        vec3 color = texture(uSampler, texCoord).xyz;

        // Scale from float texture to [0, 1]
        color = color / 255.0;

        fragColor = vec4(color, 1.0);
    }





}