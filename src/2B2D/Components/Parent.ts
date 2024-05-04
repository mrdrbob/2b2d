import { Entity } from "../Entity";
import Future from "../Util/Future";
import Component from "./Component";

export default class Parent implements Component {
  static readonly NAME: string = 'Parent';
  readonly name: string = Parent.NAME;

  /** Some properties can be inherited (or offset from) a parent entity. For exmaple:
   * `Position` values will be offset from the `Parent` entity's position.
   * `Visibility` values will be inherited from any ancestor entity.
   */
  constructor(
    public entity: Entity | Future<Entity>
  ) { }
}