// Vertex buffer (triangle verticies)
struct Vertex {
    @location(0) vertex: vec2f
}

struct GlobalContext {
    texel: vec2f, // Size of a texel
    camera: vec2f, // Position of the camera
}

// Individual sprites
struct Sprite {
    pos: vec2f, // Position in the world
    size: vec2f, // Size of the sprite (in the world)
    rg: vec2f, // RGBA color
    ba: vec2f, // RGBA color
    scale: vec2f, // Scale
    atlasPos: vec2f, // Position in the atlas,
    rotation: vec2f, // Rotation
    depth: vec2f, // Depth + 0
    repeat: vec2f // Repeat factor (x and y)
}

// Position and texture UV mappings and color adjustments
struct VertexOutput {
    @builtin(position) position:vec4f, // Vertex position translated to screen space (-1 .. 1)
    @location(0) uv: vec2f,  // UV coordinates on the texture (0..1)
    @location(1) color: vec4f, // Color to apply
    @location(2) atlasPos: vec2f, // Position in the atlas,
    @location(3) spriteSize: vec2f,
    @location(4) repeat: vec2f, // Repeat
}


// Shared between all objects
@group(0) @binding(0) var<uniform> world:GlobalContext;
@group(0) @binding(1) var sampl: sampler;

// Specific to a texture / batch
@group(1) @binding(0) var text: texture_2d<f32>;
@group(1) @binding(1) var<storage, read> sprites:array<Sprite>;

@vertex
fn vs (
    input:Vertex,
    @builtin(instance_index) instance: u32
) -> VertexOutput {
    let sprite = sprites[instance];

    // Calculate the vertex positions
    let scaled = input.vertex * sprite.size * sprite.scale * sprite.repeat;
    let rotated = vec2f(
        scaled.x * sprite.rotation.x - scaled.y * sprite.rotation.y,
        scaled.x * sprite.rotation.y + scaled.y * sprite.rotation.x
    );
    let pos = sprite.pos + -world.camera + rotated;
    let world_space = pos * world.texel;

    var output:VertexOutput;
    output.position = vec4f(world_space, sprite.depth.x, 1.0);
    output.uv =  input.vertex + vec2f(0.5, 0.5); // Move from -0.5..0.5 to 0..1;
    output.color = vec4f(sprite.rg, sprite.ba);
    output.atlasPos = sprite.atlasPos;
    output.spriteSize = sprite.size;
    output.repeat = sprite.repeat;

    return output;
}

@fragment 
fn fs(vertex:VertexOutput) -> @location(0) vec4f {
    // Apply repeat
    let repeatedUv = fract(vertex.uv * vertex.repeat);

    // Flip Y coord
    let flipped = vec2f(repeatedUv.x, 1 - repeatedUv.y);

    // Find position in pixels
    let atlasPos = vertex.atlasPos + (flipped * vertex.spriteSize);

    // Move to texture coordinate space
    let uv = atlasPos / vec2f(textureDimensions(text));

    // Sample and discard very transparent stuff
    let sample = textureSample(text, sampl, uv) * vertex.color;

    if (sample.a < 0.01) {
        discard;
    }

    return sample;
}