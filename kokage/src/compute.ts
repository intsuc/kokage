import type { u32, WgslAny } from "./types"
import { parseFunction } from "./parse"
import { emitWgslFunction } from "./wgsl";

const adapter = await navigator.gpu.requestAdapter();
const device = await adapter!.requestDevice();

export function compute<
  Fn extends (...args: never) => WgslAny,
>(
  fn: Fn,
): (...args: Parameters<Fn>) => Promise<ReturnType<Fn>> {
  const expression = parseFunction(fn);
  const wgsl = emitWgslFunction(expression);
  console.debug(wgsl);

  const pipeline = device.createComputePipeline({
    layout: "auto",
    compute: {
      module: device.createShaderModule({
        code: `
          @group(0) @binding(0) var<storage, read> input : array<u32>;
          @group(0) @binding(1) var<storage, read_write> output : array<u32>;
          @compute @workgroup_size(1)
          fn main(@builtin(global_invocation_id) gid : vec3<u32>) {
            output[gid.x] = input[gid.x] + 1;
          }
        `,
      }),
    },
  });

  return async (...args) => {
    const encoder = device.createCommandEncoder();
    const pass = encoder.beginComputePass();
    pass.setPipeline(pipeline);
    const count = 1;
    const inputBuffer = device.createBuffer({
      size: count * Uint32Array.BYTES_PER_ELEMENT,
      usage: GPUBufferUsage.STORAGE,
      mappedAtCreation: true,
    });
    new Uint32Array(inputBuffer.getMappedRange()).set([args[0] as u32]);
    inputBuffer.unmap();
    const outputBuffer = device.createBuffer({
      size: count * Uint32Array.BYTES_PER_ELEMENT,
      usage: GPUBufferUsage.COPY_SRC | GPUBufferUsage.STORAGE,
    });
    pass.setBindGroup(0, device.createBindGroup({
      layout: pipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: inputBuffer } },
        { binding: 1, resource: { buffer: outputBuffer } },
      ],
    }));
    pass.dispatchWorkgroups(count);
    pass.end();
    const readBuffer = device.createBuffer({
      size: count * Uint32Array.BYTES_PER_ELEMENT,
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
    });
    encoder.copyBufferToBuffer(outputBuffer, readBuffer);
    device.queue.submit([encoder.finish()]);
    await readBuffer.mapAsync(GPUMapMode.READ);
    const readData = new Uint32Array(readBuffer.getMappedRange());
    return readData[0] as ReturnType<Fn>;
  };
}
