import * as esbuild from "npm:esbuild";
import { denoPlugins } from "jsr:@luca/esbuild-deno-loader";

async function build() {
  try {
    const _result = await esbuild.build({
      plugins: [...denoPlugins()],
      entryPoints: [
        "./src/content.ts",
        "./src/popup.ts",
        "./src/background.ts",
      ],
      outdir: "./dist",
      bundle: true,
      format: "iife",
      platform: "browser",
      target: "es2020",
    });

    console.log("Build completed successfully");
  } catch (error) {
    console.error("Build failed:", error);
    Deno.exit(1);
  } finally {
    esbuild.stop();
  }
}

await build();
