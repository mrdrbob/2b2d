export default interface LdtkData {
  defs: {
    tilesets: {
      uid: number,
      __cWid: number,
      __cHei: number,
      tileGridSize: number,
      spacing: number
    }[]
  },
  levels: {
    identifier: string,
    pxWid: number,
    pxHei: number,
    layerInstances: {
      __identifier: string,
      __tilesetDefUid: number,
      __cWid: number,
      __cHei: number,
      __gridSize: number,
      intGridCsv: number[],
      entityInstances: {
        __identifier: string,
        __grid:[number, number],
        px: [number, number],
      }[],
      gridTiles: {
        px: [number, number], 
        src: [number, number], 
      }[],
    }[]
  }[]
}
