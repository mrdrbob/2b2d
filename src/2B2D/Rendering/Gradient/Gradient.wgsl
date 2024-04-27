// Vertex buffer
struct Vertex {
    @location(0) vertex: vec2f,
    @location(1) rg: vec2f,
    @location(2) ba: vec2f,
    @location(3) pos:vec2f,
    @location(4) size:vec2f,
    @location(5) depth:vec2f
}

struct GlobalContext {
    @location(0) texel: vec2f, // Size of a texel
    @location(1) camera: vec2f, // Position of the camera
}

@group(0) @binding(0) var<uniform> world:GlobalContext;

// Position and color
struct VertexOutput {
    @builtin(position) position:vec4f,
    @location(0) color:vec4f, 
}

@vertex
fn vs (
    input:Vertex
) -> VertexOutput {
    let pos = (input.vertex * input.size) + input.pos - world.camera;
    let world_space = pos * world.texel;

    var output:VertexOutput;
    output.position = vec4f(world_space, input.depth.x, 1);
    output.color = vec4f(input.rg, input.ba);
    return output;
}

@fragment
fn fs(vertex:VertexOutput) -> @location(0) vec4f {
    return vertex.color;
}
