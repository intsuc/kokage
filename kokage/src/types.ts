export type bool = boolean & { __brand: "bool" };

export type i32 = number & { __brand: "i32" };

export type u32 = number & {
  __brand: "u32",
  add(other: u32): u32;
};

export type f32 = number & { __brand: "f32" };

export type f16 = number & { __brand: "f16" };

type Scaler = bool | i32 | u32 | f32 | f16;

export type WgslAny = bool | i32 | u32 | f32;

function stub(): never {
  throw new Error("This function must not be called at runtime.");
}

// @const @must_use
export function u32(e: Scaler): u32 {
  stub();
}
