precision mediump float;

attribute vec2 aVertexPosition;
uniform vec2 position; // Center of the rectangle
uniform vec2 size;     // Size of the rectangle (width, height)
uniform float angle;   // Rotation angle in radians
uniform vec2 view;     // View dimensions for clip space translation
varying vec2 vuv;

void main()
{
    vuv = aVertexPosition + 0.5;
    // Rotate and scale the vertex
    mat2 rotation = mat2(
        cos(angle), -sin(angle),
        sin(angle),  cos(angle)
    );

    vec2 scaledVertex = aVertexPosition * size;     // Scale the vertex to the rectangle's size
    vec2 rotatedVertex = rotation * scaledVertex; // Rotate around the center

    // Translate to the rectangle's position
    vec2 worldPosition = position + rotatedVertex;

    // Transform to OpenGL clip space
    vec2 clipPosition = vec2(
        (worldPosition.x / view.x) * 2.0 - 1.0,
        (worldPosition.y / view.y) * 2.0 - 1.0
    );

    gl_Position = vec4(clipPosition, 0.0, 1.0);
}
