set shell := ["bash", "-c"]

# Build TypeScript files
build:
    deno run -A build.ts

# Create distribution ZIP
package: clean build
    zip -r extension.zip manifest.json popup/ dist/ assets/logo.svg

# Clean built files
clean:
    rm -rf dist/
    rm -f extension.zip

# Watch for changes and rebuild
watch:
    deno run --watch -A build.ts
