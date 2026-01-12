export type i32 = number & { __brand: "i32" };
export type u32 = number & { __brand: "u32" };
export type f32 = number & { __brand: "f32" };

export type WgslAny = i32 | u32 | f32;
