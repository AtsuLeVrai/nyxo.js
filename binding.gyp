{
  "targets": [
    {
      "target_name": "nyxojs",
      "sources": [
        "src/native/zlib.cpp",
        "src/native/zstd.cpp",
        "deps/zstd/lib/common/entropy_common.c",
        "deps/zstd/lib/common/error_private.c",
        "deps/zstd/lib/common/fse_decompress.c",
        "deps/zstd/lib/common/xxhash.c",
        "deps/zstd/lib/common/zstd_common.c",
        "deps/zstd/lib/decompress/huf_decompress.c",
        "deps/zstd/lib/decompress/zstd_ddict.c",
        "deps/zstd/lib/decompress/zstd_decompress.c",
        "deps/zstd/lib/decompress/zstd_decompress_block.c",
        "deps/zlib/adler32.c",
        "deps/zlib/crc32.c",
        "deps/zlib/inffast.c",
        "deps/zlib/inflate.c",
        "deps/zlib/inftrees.c",
        "deps/zlib/zutil.c"
      ],
      "include_dirs": [
        "<!@(node -p \"require('node-addon-api').include\")",
        "deps/zstd/lib",
        "deps/zstd/lib/common",
        "deps/zstd/lib/decompress",
        "deps/zlib"
      ],
      "defines": [
        "NAPI_VERSION=<(napi_build_version)",
        "ZSTD_STATIC_LINKING_ONLY",
        "XXH_NAMESPACE=ZSTD_",
        "NDEBUG"
      ],
      "cflags!": ["-fno-exceptions"],
      "cflags_cc!": ["-fno-exceptions"],
      "cflags": [
        "-Wall",
        "-Wextra",
        "-Wno-unused-parameter"
      ],
      "cflags_cc": [
        "-Wall",
        "-Wextra",
        "-Wno-unused-parameter"
      ],
      "msvs_settings": {
        "VCCLCompilerTool": {
          "ExceptionHandling": 1,
          "EnableFunctionLevelLinking": "true",
          "EnableIntrinsicFunctions": "true",
          "FavorSizeOrSpeed": 1,
          "OmitFramePointers": "true",
          "Optimization": 3,
          "WholeProgramOptimization": "true",
          "RuntimeLibrary": 0,
          "AdditionalOptions": [
            "/std:c++20",
            "/guard:cf",
            "/Qspectre"
          ],
          "PreprocessorDefinitions": [
            "WIN32",
            "_WINDOWS",
            "NDEBUG",
            "_CRT_SECURE_NO_WARNINGS"
          ]
        },
        "VCLinkerTool": {
          "LinkTimeCodeGeneration": 1,
          "OptimizeReferences": 2,
          "EnableCOMDATFolding": 2,
          "GenerateDebugInformation": "false"
        }
      },
      "xcode_settings": {
        "GCC_ENABLE_CPP_EXCEPTIONS": "YES",
        "CLANG_CXX_LIBRARY": "libc++",
        "MACOSX_DEPLOYMENT_TARGET": "10.15",
        "GCC_OPTIMIZATION_LEVEL": "3",
        "CLANG_CXX_LANGUAGE_STANDARD": "c++20",
        "LLVM_LTO": "YES",
        "DEAD_CODE_STRIPPING": "YES",
        "GCC_INLINES_ARE_PRIVATE_EXTERN": "YES",
        "GCC_SYMBOLS_PRIVATE_EXTERN": "YES",
        "OTHER_CFLAGS": [
          "-O3",
          "-ffast-math",
          "-fvisibility=hidden",
          "-Wall",
          "-Wextra",
          "-Wno-unused-parameter"
        ],
        "OTHER_CPLUSPLUSFLAGS": [
          "-O3",
          "-ffast-math",
          "-fvisibility=hidden",
          "-fvisibility-inlines-hidden",
          "-Wall",
          "-Wextra",
          "-Wno-unused-parameter"
        ]
      },
      "conditions": [
        ["OS=='linux'", {
          "sources": [
            "deps/zstd/lib/decompress/huf_decompress_amd64.S"
          ],
          "cflags_cc": [
            "-std=c++20",
            "-O3",
            "-ffast-math",
            "-fvisibility=hidden",
            "-fvisibility-inlines-hidden",
            "-march=native",
            "-mtune=native",
            "-flto"
          ],
          "cflags": [
            "-O3",
            "-ffast-math",
            "-fvisibility=hidden",
            "-march=native",
            "-mtune=native"
          ],
          "ldflags": [
            "-flto",
            "-Wl,--strip-all",
            "-Wl,--gc-sections"
          ],
          "defines": [
            "_GNU_SOURCE"
          ]
        }],
        ["OS=='mac'", {
          "sources": [
            "deps/zstd/lib/decompress/huf_decompress_amd64.S"
          ],
          "conditions": [
            ["target_arch=='arm64'", {
              "xcode_settings": {
                "OTHER_CFLAGS": [
                  "-O3",
                  "-ffast-math",
                  "-mcpu=apple-m1",
                  "-fvisibility=hidden"
                ],
                "OTHER_CPLUSPLUSFLAGS": [
                  "-O3",
                  "-ffast-math",
                  "-mcpu=apple-m1",
                  "-fvisibility=hidden",
                  "-fvisibility-inlines-hidden"
                ]
              }
            }],
            ["target_arch=='x64'", {
              "xcode_settings": {
                "OTHER_CFLAGS": [
                  "-O3",
                  "-ffast-math",
                  "-march=native",
                  "-mtune=native",
                  "-fvisibility=hidden"
                ],
                "OTHER_CPLUSPLUSFLAGS": [
                  "-O3",
                  "-ffast-math",
                  "-march=native",
                  "-mtune=native",
                  "-fvisibility=hidden",
                  "-fvisibility-inlines-hidden"
                ]
              }
            }]
          ]
        }],
        ["OS=='win'", {
          "defines": [
            "WIN32",
            "_WINDOWS",
            "NDEBUG",
            "_CRT_SECURE_NO_WARNINGS"
          ]
        }]
      ]
    }
  ]
}
