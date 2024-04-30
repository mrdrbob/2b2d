import { Entity } from "../Entity";
import Future from "../Util/Future";
import Component from "./Component";

export default class Parent implements Component {
  static readonly NAME: string = 'Parent';
  readonly name: string = Parent.NAME;

  constructor(
    public entity: Entity | Future<Entity>
  ) { }
}