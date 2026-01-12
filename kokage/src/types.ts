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

// https://www.w3.org/TR/WGSL/#bool-builtin
// @const @must_use
export function bool<T extends Scaler>(e: T): bool { stub(); }

// https://www.w3.org/TR/WGSL/#f16-builtin
// @const @must_use
export function f16<T extends Scaler>(e: T): f16 { stub(); }

// https://www.w3.org/TR/WGSL/#f32-builtin
// @const @must_use
export function f32<T extends Scaler>(e: T): f32 { stub(); }

// https://www.w3.org/TR/WGSL/#i32-builtin
// @const @must_use
export function i32<T extends Scaler>(e: T): i32 { stub(); }

// https://www.w3.org/TR/WGSL/#u32-builtin
// @const @must_use
export function u32<T extends Scaler>(e: T): u32 { stub(); }
