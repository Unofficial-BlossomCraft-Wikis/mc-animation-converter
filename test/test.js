import { convert } from "../dist/index.cjs";
import fs from "fs";
import path from "path";

function main() {
  const dir = "test/assets";
  const files = fs.readdirSync(dir).filter((file) => file !== "README");
  console.log(files);
  let name = files
    .filter((file) => file.endsWith(".png") && !file.endsWith(".mcmeta"))
    .map((file) => file.slice(0, -".png".length))
    .find((base) => files.includes(`${base}.png.mcmeta`));
  console.log(name);
  const input = {
    png: fs.readFileSync(path.join(dir, `${name}.png`)),
    mcmeta: fs.readFileSync(path.join(dir, `${name}.png.mcmeta`)),
  };

  // Test APNG export
  convert({
    png: input.png,
    mcmeta: input.mcmeta,
    exportType: "apng",
  })
    .then((output) => {
      fs.writeFileSync(path.join(dir, `${name}.apng`), output.export);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
  // Test GIF export
  convert({
    png: input.png,
    mcmeta: input.mcmeta,
    exportType: "gif",
  })
    .then((output) => {
      fs.writeFileSync(path.join(dir, `${name}.gif`), output.export);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

main();
