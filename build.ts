import * as esbuild from "esbuild";
import { denoPlugins } from "@luca/esbuild-deno-loader";

async function build() {
  try {
    const _result = await esbuild.build({
      plugins: [...denoPlugins()],
      entryPoints: [
        "./src/content.ts",
        "./src/config_popup.ts",
        "./src/config_popup_data.ts",
        "./src/background.ts",
      ],
      outdir: "./dist",
      bundle: true,
      minify: true,
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
