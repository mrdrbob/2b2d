// Vertex buffer
struct Vertex {
    @location(0) vertex: vec2f,
    @location(1) rg: vec2f,
    @location(2) ba: vec2f,
}

// Context that applies to all sprites in all frames
struct WorldContext {
    texel: vec2f, // Size of a texel
}

// Context shared between all sprites in a given frame
struct FrameContext {
    camera: vec2f, // Position of the camera
}

@group(0) @binding(0) var<uniform> world:WorldContext;
@group(0) @binding(1) var<uniform> frame:FrameContext;

// Position and color
struct VertexOutput {
    @builtin(position) position:vec4f,
    @location(0) color:vec4f, 
}

@vertex
fn vs (
    input:Vertex
) -> VertexOutput {
    let pos = -frame.camera + input.vertex;
    let world_space = pos * world.texel;
    
    var output:VertexOutput;
    output.position = vec4f(world_space, 0, 1);
    output.color = vec4f(input.rg, input.ba);
    return output;
}

@fragment
fn fs(vertex:VertexOutput) -> @location(0) vec4f {
    return vertex.color;
}
