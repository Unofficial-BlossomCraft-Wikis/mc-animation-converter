import { convert } from "../dist/index.cjs";
import fs from "fs";
import path from "path";
import crypto from "crypto";

function getFiles(folder) {
  const baseDir = path.join(process.cwd(), "test/assets", folder);
  return {
    png: fs.readFileSync(path.join(baseDir, "wool_colored_yellow.png")),
    mcmeta: fs.readFileSync(
      path.join(baseDir, "wool_colored_yellow.png.mcmeta")
    ),
  };
}

function getBufferHash(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

async function main() {
  const tests = [
    {
      folder: "unorganized_frames",
      expectedHashes: {
        apng: "e70aa0bb387bc873adae635fa103c3e253ad60983b5d0c63f1aae6b6bef9a705",
        gif: "9315e35011b535498806f1d37d8888d4f2fa488c722b27b1d38e885b4d86488b",
      },
      receivedHashes: { apng: "", gif: "" },
      pass: { apng: false, gif: false },
    },
    {
      folder: "normal",
      expectedHashes: {
        apng: "f89ab2c7d39d2868f9540630f98a43fdfea5c3f7232f54dab8b25db1600ebbb2",
        gif: "b2b6303ac76ebf4fb8b17330933234c7b8e1d1d6e98b6f70ed4cc4667fc8a968",
      },
      receivedHashes: { apng: "", gif: "" },
      pass: { apng: false, gif: false },
    },
    {
      folder: "custom_delay",
      expectedHashes: { apng: "1814a61b1cd76e541e845231aa99427d9cac7dea30cfa754f31aab2be1e4fddc", gif: "3f82aabe5bb2965564904c990d9d14f23abcb89285245d80f2604572db07ac03" },
      receivedHashes: { apng: "", gif: "" },
      pass: { apng: false, gif: false },
    },
  ];

  let pass = true;

  for (const test of tests) {
    const { png, mcmeta } = getFiles(test.folder);

    for (const type of ["apng", "gif"]) {
      try {
        const output = await convert({
          png,
          mcmeta,
          exportType: type,
        });

        if (output) {
          const hash = getBufferHash(output.export);
          test.receivedHashes[type] = hash;

          if (test.expectedHashes[type] === hash) {
            test.pass[type] = true;
          }

          if (test.expectedHashes[type] === "") {
            console.log(`Skipping ${test.folder}.${type} hash check`);
            test.pass[type] = "SKIPPED";
          }

          if (test.expectedHashes[type] === "log") {
            console.log(`${test.folder}.${type} hash: ${hash}`);
            test.pass[type] = "Hash Logged";
          }
        }
      } catch (err) {
        console.error(`Error converting ${test.folder}.${type}: ` + err);
        test.pass[type] = false;
      }
    }
  }
  const FinalTestResults = [];
  for (const test of tests) {
    if (test.pass.apng && test.pass.gif) {
      FinalTestResults.push({
        folder: test.folder,
        pass: test.pass,
      });
    } else {
      pass = false;
      FinalTestResults.push(test);
    }
  }
  console.log("\n--- Final Test Results ---");
  console.dir(FinalTestResults, { depth: null });
  console.log(`All Tests Passed: ${pass}`);
  process.exit(pass ? 0 : 1);
}

main();
