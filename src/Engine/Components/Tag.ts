import Component from "../Component";

export default class Tag implements Component {
  private _name:string;
  name() { return this._name; }

  constructor(name:string) {
    this._name = name;
  }
}