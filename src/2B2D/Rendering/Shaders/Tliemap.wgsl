// Vertex buffer (triangle verticies)
struct Vertex {
    @location(0) vertex: vec2f
}

// Context that applies to all sprites in all frames
struct WorldContext {
    texel: vec2f, // Size of a texel
}

// Context shared between all sprites in a given frame
struct FrameContext {
    camera: vec2f, // Position of the camera
}

// Specific to the texture
struct DestinationQuad {
    pos: vec2f, // Position of the quad
    size: vec2f, // Size of the quad (in tiles), so to get pixel size: size * tile_size
    tile_size: vec2f // Tile size on the source tile and destination quad
}

struct VertexOutput {
    @builtin(position) position:vec4f, // Vertex position translated to screen space (-1 .. 1)
    @location(0) uv: vec2f,  // UV coordinates on the texture (0..1)
}

// Shared between all objects
@group(0) @binding(0) var<uniform> world:WorldContext;
@group(0) @binding(1) var<uniform> frame:FrameContext;
@group(0) @binding(2) var fragment_sampler: sampler;

// Specific to this texture
@group(1) @binding(0) var<uniform> quad:DestinationQuad; // Info about the quad
@group(1) @binding(1) var atlas_texture: texture_2d<u32>; // Tiny texture of atlas values
@group(1) @binding(2) var sprite_texture: texture_2d<f32>; // Source sprite texture

@vertex
fn vs (
    input:Vertex
) -> VertexOutput {

    let pos = quad.pos - frame.camera + (input.vertex * quad.size * quad.tile_size);
    let world_space = pos * world.texel;

    let uv = input.vertex + vec2(0.5, 0.5); // Move from -0.5..0.5 to 0..1

    var output:VertexOutput;
    output.position = vec4f(world_space, 0.0, 1.0);
    output.uv = vec2f(uv.x, 1.0 - uv.y); // Output flipped Y
    return output;
}


@fragment fn fs(vertex:VertexOutput) -> @location(0) vec4f {

    let atlas_pos = vertex.uv * vec2f(textureDimensions(atlas_texture));
    let tile_coords = vec2u(atlas_pos);
    let base_source_pos = vec2f(textureLoad(atlas_texture, tile_coords, 0).xy);

    // 256 is invisible.
    if (base_source_pos.x == 256 && base_source_pos.y == 256) {
        discard;
    }

    let remainder = fract(atlas_pos);
    let texture_pos = ((base_source_pos + remainder) * quad.tile_size);

    let texel = vec2f(1.0) / vec2f(textureDimensions(sprite_texture));
    let final_pos = texture_pos * texel;
    return textureSample(sprite_texture, fragment_sampler, final_pos);
}
