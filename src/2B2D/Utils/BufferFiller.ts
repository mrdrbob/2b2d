import Vec2 from "../Math/Vec2";

export default class BufferFiller {
  offset = 0;

  constructor(public buffer: Float32Array) { }

  push(value: number[] | Vec2) {
    if (Array.isArray(value)) {
      this.buffer.set(value, this.offset);
      this.offset += value.length;
    } else {
      this.buffer.set([value.x, value.y], this.offset);
      this.offset += 2;
    }
  }
}
