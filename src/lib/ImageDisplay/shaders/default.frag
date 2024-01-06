#version 300 es
precision highp float;

uniform sampler2D uSampler;

in vec2 vTextureCoordinate;
out vec4 fragColor;

void main() {
    vec2 pixelSize = vec2(1.0) / vec2(textureSize(uSampler, 0));
    vec3 color = vec3(0.0);

    // Loop over neighboring pixels
    for(int x = -1; x <= 1; x++) {
        for(int y = -1; y <= 1; y++) {
                vec2 offset = vec2(float(x), float(y)) * pixelSize;
                color += texture(uSampler, vTextureCoordinate + offset).xyz;
        }
    }

    // Average the sum
    color = color / 9.0;

    // Scale from float texture
    color = color / 255.0;

    fragColor = vec4(color, 1.0);

}