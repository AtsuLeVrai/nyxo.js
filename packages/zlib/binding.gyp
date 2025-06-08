{
  "targets": [
    {
      "target_name": "zlib",
      "sources": [
        "native/zlib.cpp",
        "deps/zlib/adler32.c",
        "deps/zlib/compress.c",
        "deps/zlib/crc32.c",
        "deps/zlib/deflate.c",
        "deps/zlib/gzclose.c",
        "deps/zlib/gzlib.c",
        "deps/zlib/gzread.c",
        "deps/zlib/gzwrite.c",
        "deps/zlib/infback.c",
        "deps/zlib/inffast.c",
        "deps/zlib/inflate.c",
        "deps/zlib/inftrees.c",
        "deps/zlib/trees.c",
        "deps/zlib/uncompr.c",
        "deps/zlib/zutil.c"
      ],
      "include_dirs": [
        "<!@(node -p \"require('node-addon-api').include\")",
        "deps/zlib"
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
          "cflags_cc": [
            "-std=c++20",
            "-O3",
            "-ffast-math",
            "-march=native",
            "-mtune=native"
          ],
          "cflags": [
            "-O3",
            "-ffast-math"
          ]
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
          "defines": [
            "WIN32",
            "_WINDOWS",
            "NDEBUG"
          ]
        }]
      ]
    }
  ]
}