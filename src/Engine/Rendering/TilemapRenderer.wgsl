// Triangle vertices
struct Vertex {
    @location(0) vertex: vec2f
}

struct VertexContext {
    pos: vec2f, // Position of the quad
    size: vec2f, // Size of the quad
    camera: vec2f, // Position of the camera
    texel: vec2f, // Size of a pixel in the -1 .. 1 space
}

@group(0) @binding(0) var<uniform> vertexContext:VertexContext;

@vertex
fn vs (
    input:Vertex
) -> VertexOutput {
    // Calcualte the vertex position in pixel space
    let pos = vertexContext.pos - vertexContext.camera + (input.vertex * vertexContext.size);

    // Move that to world space
    let world_space = pos * vertexContext.texel;
    let uv = input.vertex + vec2(0.5, 0.5);

    var output:VertexOutput;
    output.position = vec4f(world_space, 0.0, 1.0);
    output.uv = vec2f(uv.x, 1.0 - uv.y);
    return output;
    // return vec4f(world_space, 0.0, 1.0);
}

struct VertexOutput {
    @builtin(position) position:vec4f, // Vertex position translated to screen space (-1 .. 1)
    @location(0) uv: vec2f,  // UV coordinates on the texture (0..1)
}


@group(1) @binding(0) var atlas_texture: texture_2d<u32>;
@group(1) @binding(1) var sprite_texture: texture_2d<f32>;
@group(1) @binding(2) var fragment_sampler: sampler;
@group(1) @binding(3) var<uniform> fragment_context: FragmentContext;

struct FragmentContext {
    sprite_size: vec2f,
    atlas_size: vec2f,
    tile_size: vec2f
}

@fragment fn fs(vertex:VertexOutput) -> @location(0) vec4f {
    let atlas_pos = vertex.uv * fragment_context.atlas_size;
    let tile_coords = vec2u(atlas_pos);

    let values = vec2f(textureLoad(atlas_texture, tile_coords, 0).xy);
    let remainder = fract(atlas_pos);
    let texture_pos = ((values + remainder) * fragment_context.tile_size);

    let texel = vec2f(1.0) / fragment_context.sprite_size;
    let final_pos = texture_pos * texel;
    return textureSample(sprite_texture, fragment_sampler, final_pos);
}
