import { f32, u32 } from "kokage";
import { compute } from "kokage";

const main = compute(function main(x: u32): u32 {
  return (x + u32(f32(1 as f32))) as u32;
});
const result = await main(41 as u32);
console.log(result);
