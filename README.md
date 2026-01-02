# MC animation converter

Takes .png and .png.mcmeta files and converts them into one of a growing number of animation formats.

APNG export is recommended for most use cases, as it is lossless and supports transparency better than GIFs.

## NOTES
We don't currently support the frames array in the mcmeta file, this is a feature that will be added in a future version.

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
