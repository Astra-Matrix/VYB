export const MESH_SHADER_WGSL = /* wgsl */ `
struct Uniforms {
  viewProjection: mat4x4<f32>,
  model: mat4x4<f32>,
  lightDir: vec4<f32>,
  lightColor: vec4<f32>,
  cameraPos: vec4<f32>,
  params: vec4<f32>,
};

@group(0) @binding(0) var<uniform> u: Uniforms;

struct VSOut {
  @builtin(position) position: vec4<f32>,
  @location(0) normal: vec3<f32>,
  @location(1) worldPos: vec3<f32>,
};

@vertex
fn vs_main(@location(0) position: vec3<f32>, @location(1) normal: vec3<f32>) -> VSOut {
  var out: VSOut;
  let world = u.model * vec4<f32>(position, 1.0);
  out.position = u.viewProjection * world;
  out.normal = normalize((u.model * vec4<f32>(normal, 0.0)).xyz);
  out.worldPos = world.xyz;
  return out;
}

@fragment
fn fs_main(in: VSOut) -> @location(0) vec4<f32> {
  let unlit = u.params.x > 0.5;
  let wireTint = u.params.y > 0.5;
  let base = vec3<f32>(0.36, 0.55, 0.94);
  if (unlit) {
    let c = select(base, vec3<f32>(0.2, 0.85, 0.55), wireTint);
    return vec4<f32>(c, 1.0);
  }
  let n = normalize(in.normal);
  let l = normalize(-u.lightDir.xyz);
  let diff = max(dot(n, l), 0.0);
  let ambient = vec3<f32>(0.08, 0.09, 0.12);
  let lit = ambient + base * diff * u.lightColor.rgb * u.lightColor.a;
  let viewDir = normalize(u.cameraPos.xyz - in.worldPos);
  let spec = pow(max(dot(reflect(-l, n), viewDir), 0.0), 32.0) * 0.15;
  return vec4<f32>(lit + spec, 1.0);
}
`;

export const GRID_SHADER_WGSL = /* wgsl */ `
struct GridUniforms {
  viewProjection: mat4x4<f32>,
  params: vec4<f32>,
};

@group(0) @binding(0) var<uniform> u: GridUniforms;

@vertex
fn vs_main(@location(0) position: vec3<f32>) -> @builtin(position) vec4<f32> {
  return u.viewProjection * vec4<f32>(position, 1.0);
}

@fragment
fn fs_main() -> @location(0) vec4<f32> {
  let major = u.params.x;
  let alpha = select(0.12, 0.28, major > 0.5);
  return vec4<f32>(0.36, 0.55, 0.94, alpha);
}
`;
