import loadJsonAsset from "../2B2D/Assets/JsonAsset";
import LdtkData from "../2B2D/Assets/LdtkData";
import loadSpriteAtlasAsset, { generateSingleSpriteAtlas, generateTiledSpriteAtlas } from "../2B2D/Assets/SpriteAtlasAsset";
import loadTextureAsset from "../2B2D/Assets/TextureAsset";
import createTilemapFromLdtkJson from "../2B2D/Assets/TilemapData";
import Vec2 from "../2B2D/Math/Vec2";
import { AssetsResource } from "../2B2D/Resources/AssetsResource";
import { AudioResource } from "../2B2D/Resources/AudioResource";

const GameAssets = {
  Menu: { 
    Texture:  {
      Handle: 'menu-texture', 
      Load: () => loadTextureAsset(GameAssets.Menu.Texture.Handle, 'assets/main-menu.png')
    },
    Atlas: {
      Handle: 'menu-atlas',
      Generate: () => generateSingleSpriteAtlas(GameAssets.Menu.Atlas.Handle, new Vec2(200, 150))
    }
  },
  Characters:  {
    Texture: {
      Handle: 'char-texture',
      Load: () => loadTextureAsset(GameAssets.Characters.Texture.Handle, 'assets/characters.png')
    },
    Atlas: {
      Handle: 'char-atlas',
      Load: () => loadSpriteAtlasAsset(GameAssets.Characters.Atlas.Handle, 'assets/characters.json')
    }
  },
  LevelData: {
    LdtkData: {
      Handle: 'ldtk-data',
      Load: () => loadJsonAsset<LdtkData>(GameAssets.LevelData.LdtkData.Handle, 'assets/platform.ldtk')
    },
    // The "background" are the cloud tiles that are sized differently from the normal tiles.
    Background: {
      Texture: {
        Handle: 'level-bg-texture',
        Load: () => loadTextureAsset(GameAssets.LevelData.Background.Texture.Handle, 'assets/platform-bg-tiles.png'),
      },
      Tilemap: {
        Handle: (id:number) => `level-bg-layer-${id}`
      }
    },
    // "Tiles" make up the platforms AND foreground tiles.
    Tiles: {
      Texture: {
        Handle: 'level-tiles-texture',
        Load: () => loadTextureAsset(GameAssets.LevelData.Tiles.Texture.Handle, 'assets/platform-tiles.png')
      },
      Atlas: {
        Handle: 'level-tiles-atlas',
        Generate: () => generateTiledSpriteAtlas(GameAssets.LevelData.Tiles.Atlas.Handle, new Vec2(18, 18), new Vec2(20, 9), new Vec2(0, 0))
      },
      Tilemap: {
        Handle: (level:number, frame:number) => `level-tiles-tilemap-${level}-${frame}`
      }
    },
    Foreground: {
      Texture: {
        JustUseTheTileTexture: () => { throw new Error('You should not call this.'); }
      },
      Tilemap: {
        Handle: (id:number) => `level-fg-layer-${id}`
      }
    }

  },
  Death: {
    BG: {
      Texture: {
        Handle: 'death-bg',
        Load: () => loadTextureAsset(GameAssets.Death.BG.Texture.Handle, 'assets/dead-bg.png')
      },
      Atlas: {
        Handle: 'death-bg-atlas',
        Generate: () => generateSingleSpriteAtlas(GameAssets.Death.BG.Atlas.Handle, new Vec2(200, 150))
      }
    },
    Guy: {
      Texture: {
        Handle: 'death-guy',
        Load: () => loadTextureAsset(GameAssets.Death.Guy.Texture.Handle, 'assets/dead-guy.png')
      },
      Atlas: {
        Handle: 'death-guy-atlas',
        Generate: () => generateSingleSpriteAtlas(GameAssets.Death.Guy.Atlas.Handle, new Vec2(24, 24))
      }
    },
    Message: {
      Texture: {
        Handle: 'death-message',
        Load: () => loadTextureAsset(GameAssets.Death.Message.Texture.Handle, 'assets/you-died.png')
      },
      Atlas: {
        Handle: 'death-message-atlas',
        Generate: () => generateSingleSpriteAtlas(GameAssets.Death.Message.Atlas.Handle, new Vec2(106, 21))
      }
    }
  },
  WinScreen: {
    Texture: {
      Handle: 'win-screen',
      Load: () => loadTextureAsset(GameAssets.WinScreen.Texture.Handle, 'assets/you-win.png')
    },
    Atlas: {
      Handle: 'win-screen-atlas',
      Generate: () => generateSingleSpriteAtlas(GameAssets.WinScreen.Atlas.Handle, new Vec2(200, 150))
    }
  },
  Sounds:{
    Jump: {
      Handle: 'jump-audio',
      Load: (audio:AudioResource) => audio.loadAudio(GameAssets.Sounds.Jump.Handle, 'assets/jump.opus')
    },
    Hurt: {
      Handle: 'hurt-audio',
      Load: (audio:AudioResource) => audio.loadAudio(GameAssets.Sounds.Hurt.Handle, 'assets/hurt.opus')
    },
    Died: {
      Handle: 'died-audio',
      Load: (audio:AudioResource) => audio.loadAudio(GameAssets.Sounds.Died.Handle, 'assets/died.opus')
    },
    Flag: {
      Handle: 'flag-audio',
      Load: (audio:AudioResource) => audio.loadAudio(GameAssets.Sounds.Flag.Handle, 'assets/flag.opus')
    },
    Drop: {
      Handle: 'drop-audio',
      Load: (audio:AudioResource) => audio.loadAudio(GameAssets.Sounds.Drop.Handle, 'assets/drop.opus')
    }
  },
  Init: (assets:AssetsResource, audio:AudioResource) => {
    assets.add(GameAssets.Menu.Texture.Load());
    assets.add(GameAssets.Menu.Atlas.Generate());
    assets.add(GameAssets.Characters.Texture.Load());
    assets.add(GameAssets.Characters.Atlas.Load());
    assets.add(GameAssets.LevelData.LdtkData.Load());
    assets.add(GameAssets.LevelData.Background.Texture.Load());
    assets.add(GameAssets.LevelData.Tiles.Texture.Load());
    assets.add(GameAssets.LevelData.Tiles.Atlas.Generate());
    assets.add(GameAssets.Death.BG.Texture.Load());
    assets.add(GameAssets.Death.BG.Atlas.Generate());
    assets.add(GameAssets.Death.Guy.Texture.Load());
    assets.add(GameAssets.Death.Guy.Atlas.Generate());
    assets.add(GameAssets.Death.Message.Texture.Load());
    assets.add(GameAssets.Death.Message.Atlas.Generate());
    assets.add(GameAssets.WinScreen.Texture.Load());
    assets.add(GameAssets.WinScreen.Atlas.Generate());
    assets.add(GameAssets.Sounds.Jump.Load(audio));
    assets.add(GameAssets.Sounds.Hurt.Load(audio));
    assets.add(GameAssets.Sounds.Died.Load(audio));
    assets.add(GameAssets.Sounds.Flag.Load(audio));
    assets.add(GameAssets.Sounds.Drop.Load(audio));
  },
  IsLoaded: (assets:AssetsResource) => {
    return assets.loaded([
      GameAssets.Menu.Texture.Handle,
      GameAssets.Menu.Atlas.Handle,
      GameAssets.Characters.Texture.Handle,
      GameAssets.Characters.Atlas.Handle,
      GameAssets.LevelData.LdtkData.Handle,
      GameAssets.LevelData.Background.Texture.Handle,
      GameAssets.LevelData.Tiles.Texture.Handle,
      GameAssets.Sounds.Jump.Handle,
      GameAssets.Sounds.Hurt.Handle,
      GameAssets.Sounds.Died.Handle,
      GameAssets.Sounds.Flag.Handle,
      GameAssets.Sounds.Drop.Handle,
    ]);
  },
  GenerateTilemaps: (assets:AssetsResource) => {
    const ldtk = assets.assume<LdtkData>(GameAssets.LevelData.LdtkData.Handle);

    for (let i = 0; i < ldtk.levels.length; i++) {
      // Background tiles
      assets.add(createTilemapFromLdtkJson(GameAssets.LevelData.Background.Tilemap.Handle(i), ldtk, `Level_${i}`, 'Background', 0));

      // Platform tiles (both frames)
      assets.add(createTilemapFromLdtkJson(GameAssets.LevelData.Tiles.Tilemap.Handle(i, 0), ldtk, `Level_${i}`, 'Tiles', 0));
      assets.add(createTilemapFromLdtkJson(GameAssets.LevelData.Tiles.Tilemap.Handle(i, 1), ldtk, `Level_${i}`, 'Tiles', 1));

      // Foreground layer
      assets.add(createTilemapFromLdtkJson(GameAssets.LevelData.Foreground.Tilemap.Handle(i), ldtk, `Level_${i}`, 'Foreground', 0));
    }
  }
};

export default GameAssets;
