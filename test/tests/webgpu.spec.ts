import { test, expect } from "@playwright/test";
import * as kokage from "kokage";

test("webgpu supported", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async () => {
    const adapter = await navigator.gpu.requestAdapter();
    const device = await adapter.requestDevice();
    const encoder = device.createCommandEncoder();
    const pass = encoder.beginComputePass();
    const pipeline = device.createComputePipeline({
      layout: "auto",
      compute: {
        module: device.createShaderModule({
          code: `
            @group(0) @binding(0) var<storage, read_write> output : array<u32>;
            @compute @workgroup_size(1)
            fn main(@builtin(global_invocation_id) gid : vec3<u32>) {
              output[gid.x] = gid.x;
            }
          `,
        }),
      },
    });
    pass.setPipeline(pipeline);
    const count = 4;
    const outputBuffer = device.createBuffer({
      size: count * Uint32Array.BYTES_PER_ELEMENT,
      usage: GPUBufferUsage.COPY_SRC | GPUBufferUsage.STORAGE,
    });
    pass.setBindGroup(0, device.createBindGroup({
      layout: pipeline.getBindGroupLayout(0),
      entries: [{ binding: 0, resource: { buffer: outputBuffer } }],
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
    return readData;
  });

  expect(result).toEqual(new Uint32Array([0, 1, 2, 3]));
});
