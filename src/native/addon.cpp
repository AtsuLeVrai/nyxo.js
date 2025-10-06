#include <napi.h>

Napi::Object InitZlib(Napi::Env env, Napi::Object exports);
Napi::Object InitZstd(Napi::Env env, Napi::Object exports);

Napi::Object Init(Napi::Env env, Napi::Object exports) {
    InitZlib(env, exports);
    InitZstd(env, exports);

    return exports;
}

NODE_API_MODULE(nyxojs, Init)