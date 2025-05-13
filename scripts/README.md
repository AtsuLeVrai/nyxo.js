# 🛠️ @nyxojs/scripts

Internal build tooling for Nyxo.js framework.

## 📋 About

`@nyxojs/scripts` is an internal, non-published package that handles the building process for Nyxo.js. It transforms
TypeScript source code into optimized production-ready bundles.

## ✨ Features

- **TypeScript Compilation** with SWC for optimal performance
- **Type Declarations** generation with API Extractor
- **ESM/CJS Bundles** for maximum compatibility
- **Smart Logging** with colorized output

## 🔧 Usage

This package is for internal use only and is called by the main Nyxo.js build process.

```bash
# Usually called through the main package scripts
pnpm run build:prod
```

## 📦 How It Works

The build script:

1. Cleans output directories
2. Compiles TypeScript with Rollup + SWC
3. Generates and bundles type declarations
4. Creates ESM and CJS bundles

## 📜 License

This package is [Apache 2.0 licensed](LICENSE).