{
  "targets": [
    {
      "target_name": "zstd",
      "sources": [
        "native/zstd.cpp",
        "deps/zstd/lib/common/entropy_common.c",
        "deps/zstd/lib/common/error_private.c",
        "deps/zstd/lib/common/fse_decompress.c",
        "deps/zstd/lib/common/xxhash.c",
        "deps/zstd/lib/common/zstd_common.c",
        "deps/zstd/lib/decompress/huf_decompress.c",
        "deps/zstd/lib/decompress/zstd_ddict.c",
        "deps/zstd/lib/decompress/zstd_decompress.c",
        "deps/zstd/lib/decompress/zstd_decompress_block.c"
      ],
      "include_dirs": [
        "<!@(node -p \"require('node-addon-api').include\")",
        "deps/zstd/lib",
        "deps/zstd/lib/common",
        "deps/zstd/lib/decompress"
      ],
      "defines": [
        "NAPI_DISABLE_CPP_EXCEPTIONS",
        "NAPI_VERSION=<(napi_build_version)"
      ],
      "cflags!": ["-fno-exceptions"],
      "cflags_cc!": ["-fno-exceptions"],
      "msvs_settings": {
        "VCCLCompilerTool": {
          "ExceptionHandling": 1,
          "EnableFunctionLevelLinking": "true",
          "EnableIntrinsicFunctions": "true",
          "FavorSizeOrSpeed": 1,
          "OmitFramePointers": "true",
          "Optimization": 3,
          "WholeProgramOptimization": "true",
          "AdditionalOptions": ["/std:c++20"]
        },
        "VCLinkerTool": {
          "LinkTimeCodeGeneration": 1,
          "OptimizeReferences": 2,
          "EnableCOMDATFolding": 2
        }
      },
      "conditions": [
        ["OS=='linux'", {
          "cflags_cc": ["-std=c++20", "-O3", "-ffast-math"],
          "cflags": ["-O3", "-ffast-math"]
        }],
        ["OS=='mac'", {
          "xcode_settings": {
            "GCC_ENABLE_CPP_EXCEPTIONS": "YES",
            "CLANG_CXX_LIBRARY": "libc++",
            "MACOSX_DEPLOYMENT_TARGET": "10.15",
            "GCC_OPTIMIZATION_LEVEL": "3",
            "CLANG_CXX_LANGUAGE_STANDARD": "c++20",
            "OTHER_CFLAGS": ["-O3", "-ffast-math"]
          }
        }],
        ["OS=='win'", {
          "defines": ["WIN32", "_WINDOWS", "NDEBUG"]
        }]
      ]
    }
  ]
}