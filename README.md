# MC animation converter

![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/Unofficial-BlossomCraft-Wikis/mc-animation-converter/release.yml)![NPM Version](https://img.shields.io/npm/v/%40altie122-studios%2Fmc-animation-converter)![NPM Unpacked Size](https://img.shields.io/npm/unpacked-size/%40altie122-studios%2Fmc-animation-converter)![NPM Last Update](https://img.shields.io/npm/last-update/%40altie122-studios%2Fmc-animation-converter)


Takes .png and .png.mcmeta files and converts them into one of a growing number of animation formats.

APNG export is recommended for most use cases, as it is lossless and supports transparency better than GIFs.

## Installation

```sh
npm i @altie122-studios/mc-animation-converter
```

## Usage

### APNG
```ts
import { convert } from "@altie122-studios/mc-animation-converter";

const input = {
  png: fs.readFileSync("path/to/image.png"),
  mcmeta: fs.readFileSync("path/to/image.png.mcmeta"),
};

const output = await convert(input);

fs.writeFileSync("path/to/output.apng", output.export);
```

### GIF
```ts
import { convert } from "@altie122-studios/mc-animation-converter";

const input = {
  png: fs.readFileSync("path/to/image.png"),
  mcmeta: fs.readFileSync("path/to/image.png.mcmeta"),
};

const output = await convert({
  ...input,
  exportType: "gif",
});

fs.writeFileSync("path/to/output.gif", output.export);
```

working example in /test/test.js

## License

MIT

## Credits

- [UPNG.js](https://github.com/photopea/UPNG.js) (seen at /src/dep/UPNG.js/UPNG.js)
- [DefinitelyTyped/upng-js](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/upng-js) (types in the /src/dep/UPNG.js/UPNG.js folder)

Big thanks to [this Minecraft Forum post](https://www.minecraftforum.net/forums/mapping-and-modding-java-edition/resource-packs/resource-pack-discussion/1256350-animation-in-resource-packs-a-minecraft-1-6) for helping make understanding how minecraft animations work way more possible.