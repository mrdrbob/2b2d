
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
      TILES: [
        'assets:tiles-0-0',
        'assets:tiles-0-1'
      ],
      ENTITIES: 'assets:entities-0',
      FG_TILES: 'assets:fg-tiles-0'
    },
    {
      BG_TILES: 'assets:bg-tiles-1',
      TILES: [ 
        'assets:tiles-1-0',
        'assets:tiles-1-1'
       ],
      ENTITIES: 'assets:entities-1',
      FG_TILES: 'assets:fg-tiles-1'
    }
  ],
  PLATFORM_ATLAS: {
    BG: 'assets:platform-bg-atlas',
    TILES: 'assets:platform-tiles-atlas',
  },

  // Death screen
  DEAD_PLAYER_TEXTURE: 'asset:dead-player-texture',
  DEAD_PLAYER_ATLAS: 'asset:dead-player-atlas',

  DEATH_SCREEN_TEXTURE: 'asset:death-screen-texture',
  DEATH_SCREEN_ATLAS: 'asset:death-screen-atlas',

  YOU_DIED_TEXTURE: 'asset:you-died-texture',
  YOU_DIED_ATLAS: 'asset:you-died-atlas',

  YOU_WIN_TEXTURE: 'assets:you-win-texture',
  YOU_WIN_ATLAS: 'assets:you-win-asset',
};
