
export default interface NamedType {
  readonly name: string;
}

export interface NamedTypeClass<T extends NamedType = NamedType> {
  readonly NAME: string; // Static property

  new(...args: any[]): T;
}
