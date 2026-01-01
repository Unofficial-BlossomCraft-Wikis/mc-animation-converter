# MC animation converter

Takes .png and .png.mcmeta files and makes a .apng out of them

## Installation

```sh
npm install mc-animation-converter
```

## Usage

```ts
import { convert } from "mc-animation-converter";

const input = {
  png: fs.readFileSync("path/to/image.png"),
  mcmeta: fs.readFileSync("path/to/image.png.mcmeta"),
};

const output = await convert(input);

fs.writeFileSync("path/to/output.apng", output.apng);
```

working example in /test/test.js

## License

MIT

## Credits

- [UPNG.js](https://github.com/photopea/UPNG.js) (seen at /src/dep/UPNG.js/UPNG.js)
- [DefinitelyTyped/upng-js](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/upng-js) (types in the /src/dep/UPNG.js/UPNG.js folder)
