// Vertex buffer (triangle verticies)
struct Vertex {
    @location(0) vertex: vec2f
}

// Context that applies to all sprites in all frames
struct GlobalContext {
    texel: vec2f, // Size of a texel
    camera: vec2f, // Position of the camera
}

// Specific to the tilemap
struct DestinationQuad {
    pos: vec2f, // Position of the quad
    size: vec2f, // Size of the quad (in tiles), so to get pixel size: size * tile_size
    depth_grid: vec2f // Depth, Grid size
}

struct VertexOutput {
    @builtin(position) position:vec4f, // Vertex position translated to screen space (-1 .. 1)
    @location(0) uv: vec2f,  // UV coordinates on the texture (0..1)
}

// Shared between all objects
@group(0) @binding(0) var<uniform> world:GlobalContext;
@group(0) @binding(1) var fragment_sampler: sampler;

// Specific to this texture
@group(1) @binding(0) var<uniform> quad:DestinationQuad; // Info about the quad
@group(1) @binding(1) var atlas_texture: texture_2d<u32>; // Tiny texture of atlas values
@group(1) @binding(2) var sprite_texture: texture_2d<f32>; // Source sprite texture

const invisible: u32 = 2147483647;

@vertex
fn vs (
    input:Vertex
) -> VertexOutput {
    // Tilesize is in the y value of depth_grid. Make it a vec2f
    let tile_size = vec2f(quad.depth_grid.y, quad.depth_grid.y);

    // Put the vertex in the appropriate corner and scale for the map.
    let corner = (input.vertex * quad.size * tile_size);
    // Offset it to the correct position in the world.
    let pos = corner + quad.pos + -world.camera;
    // Scale it for the zoom / texel size
    let world_space = pos * world.texel;

    // Move from -0.5..0.5 to 0..1
    let uv = input.vertex + vec2(0.5, 0.5); 

    // Output everything
    var output:VertexOutput;
    output.position = vec4f(world_space, quad.depth_grid.x, 1.0);
    output.uv = vec2f(uv.x, 1.0 - uv.y); // Output flipped Y
    return output;
}


@fragment fn fs(vertex:VertexOutput) -> @location(0) vec4f {
    // Find the position in the atlas
    let atlas_pos = vertex.uv * vec2f(textureDimensions(atlas_texture));
    // Round to uint
    let tile_coords = vec2u(atlas_pos);
    // Get the x,y values from the appropriate tile in the atlas
    let texture_tile = textureLoad(atlas_texture, tile_coords, 0).xy;

    // Disgard invisible tiles
    if (texture_tile.x == invisible && texture_tile.y == invisible) {
        discard;
    }

    // Tilesize is in the y value of depth_grid. Make it a vec2f
    let tile_size = vec2f(quad.depth_grid.y, quad.depth_grid.y);

    let base_source_pos = vec2f(texture_tile) * tile_size;

    // Now the how far into the tile to go using remaining fractional part of atlas_pos
    let fractional = fract(atlas_pos); 

    // Limit it to within 0.5 pixels of the edge
    let min_offset = (1.0 / quad.depth_grid.y) * 0.5;
    let max_offset = quad.depth_grid.y - min_offset;
    let fractional_fixed = vec2f(
        min(max(min_offset, fractional.x), max_offset),
        min(max(min_offset, fractional.y), max_offset)
    );
    
    // Finalize how far into the tile to grab
    let remainder = fractional_fixed * tile_size;
    // Final position in texture space
    let texture_pos = (base_source_pos + remainder);

    // Now convert to textel space (0..1)
    let final_pos = texture_pos / vec2f(textureDimensions(sprite_texture));

    // Return sample
    let sample = textureSample(sprite_texture, fragment_sampler, final_pos);

    if (sample.a < 0.01) {
        discard;
    }

    return sample;
}
