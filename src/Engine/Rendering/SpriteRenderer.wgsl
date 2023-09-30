// Triangle vertices
struct Vertex {
    @location(0) vertex: vec2f
}

// shared context between all sprites
struct SpriteContext {
    size: vec2f, // Size of the sprite
    texel: vec2f, // Size of a pixel in the -1 .. 1 space
}

struct FrameContext {
    camera: vec2f, // Position of the camera
}

// Individual sprite locations
struct Sprite {
    pos: vec2f,
    size: vec2f,
    offset: vec2f,
    atlasPos: vec2f,
}

@group(0) @binding(0) var<uniform> context:SpriteContext;
@group(0) @binding(1) var<storage, read> sprites:array<Sprite>;
@group(0) @binding(2) var<uniform> frameContext:FrameContext;

// Position and texture UV mappings
struct VertexOutput {
    @builtin(position) position:vec4f, // Vertex position translated to screen space (-1 .. 1)
    @location(0) uv: vec2f,  // UV coordinates on the texture (0..1)
}

@vertex
fn vs (
    input:Vertex,
    @builtin(instance_index) instance: u32
) -> VertexOutput {
    let sprite = sprites[instance];

    // Calcualte the vertex position in pixel space
    let pos = sprite.pos + -frameContext.camera + -(sprite.offset * 0.5) + (input.vertex * sprite.size);

    // Move that to world space
    let world_space = (pos * context.texel) * 1.0;

    // Now the UV coordinates
    let atlasVertex = input.vertex + vec2f(0.5, 0.5);
    let flippedAtlasVertex = vec2f(atlasVertex.x, 1 - atlasVertex.y);
    let uv = sprite.atlasPos + (flippedAtlasVertex * sprite.size);
    let uv_texel = uv / context.size;

    var output:VertexOutput;
    output.position = vec4f(world_space, 0.0, 1.0);
    output.uv = vec2f(uv_texel.x, uv_texel.y);
    
    return output;
}

@group(1) @binding(0) var text: texture_2d<f32>;
@group(1) @binding(1) var sampl: sampler;


@fragment 
fn fs(vertex:VertexOutput) -> @location(0) vec4f {
    return textureSample(text, sampl, vertex.uv);
    // return vec4f(1.0, 0.5, 0.0, 1.0);
}
