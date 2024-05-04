export default class IndexCounter {
  constructor(private index: number = 0) { }

  count() { return this.index; }

  next() { return this.index++; }
}
