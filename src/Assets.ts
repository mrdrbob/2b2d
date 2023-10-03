
export default {
  MENU_TEXTURE: 'asset:menu-texture',
  MENU_ATLAS: 'asset:menu-atlas',

  CHARACTERS_TEXTURE: 'asset:characters-texture',
  CHARACTERS_ATLAS: 'asset:characters-atlas',

  PLATFORM_BG_TEXTURE: 'asset:platform-bg-texture',
  PLATFORM_TILES_TEXTURE: 'asset:platform-tiles-texture',
  PLATFORM_JSON: 'asset:platform-json',

  // I'm sure there's a better way to do this.
  PLATFORM_TILEMAPS: [
    {
      BG_TILES: 'assets:bg-tiles-0',
      TILES: 'assets:tiles-0',
      ENTITIES: 'assets:entities-0'
    },
    {
      BG_TILES: 'assets:bg-tiles-1',
      TILES: 'assets:tiles-1',
      ENTITIES: 'assets:entities-1'
    }
  ],
  PLATFORM_ATLAS: {
    BG: 'assets:platform-bg-atlas',
    TILES: 'assets:platform-tiles-atlas',
  }
};
