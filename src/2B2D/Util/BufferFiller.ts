
export default class BufferFiller {
  offset = 0;

  constructor(public buffer: Float32Array) { }

  push(...value: number[]) {
    this.buffer.set(value, this.offset);
    this.offset += value.length;
  }
}
