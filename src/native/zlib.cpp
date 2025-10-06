#include <napi.h>
#include <zlib.h>
#include <vector>
#include <memory>
#include <cstring>
#include <algorithm>

namespace ZlibConstants {
    static const uint8_t ZLIB_SUFFIX[] = {0x00, 0x00, 0xFF, 0xFF};
    static const size_t ZLIB_SUFFIX_SIZE = 4;
    static const size_t DEFAULT_CHUNK_SIZE = 32768;

    static const char* ERR_NOT_INITIALIZED = "Stream not initialized";
    static const char* ERR_STREAM_FINISHED = "Stream is finished";
    static const char* ERR_INVALID_BUFFER = "Expected Buffer or Uint8Array";
    static const char* ERR_NO_BUFFER_ARG = "Expected buffer argument";
}

class ZlibStream : public Napi::ObjectWrap<ZlibStream> {
public:
    static Napi::Object Init(Napi::Env env, Napi::Object exports);
    explicit ZlibStream(const Napi::CallbackInfo& info);
    ~ZlibStream();

private:
    static Napi::FunctionReference constructor;

    // Core Methods
    Napi::Value Push(const Napi::CallbackInfo& info);
    Napi::Value Flush(const Napi::CallbackInfo& info);
    Napi::Value Reset(const Napi::CallbackInfo& info);
    Napi::Value Close(const Napi::CallbackInfo& info);

    // Accessors
    Napi::Value GetError(const Napi::CallbackInfo& info);
    Napi::Value GetMessage(const Napi::CallbackInfo& info);
    Napi::Value IsFinished(const Napi::CallbackInfo& info);

    // Buffer Management
    Napi::Value GetBuffer(const Napi::CallbackInfo& info);
    Napi::Value ClearBuffer(const Napi::CallbackInfo& info);

    // Internal State
    z_stream stream_;
    std::vector<uint8_t> input_buffer_;
    std::vector<uint8_t> output_buffer_;
    bool initialized_;
    bool finished_;
    int last_error_;
    size_t chunk_size_;

    // Internal Methods
    bool InitializeStream(int window_bits, size_t chunk_size);
    bool ProcessBuffer();
    void UpdateErrorState(int error_code);
    bool HasZlibSuffix() const;
    void CleanupResources();
    std::pair<const uint8_t*, size_t> ExtractBufferData(const Napi::Value& value) const;
};

Napi::FunctionReference ZlibStream::constructor;

Napi::Object ZlibStream::Init(Napi::Env env, Napi::Object exports) {
    Napi::HandleScope scope(env);

    Napi::Function func = DefineClass(env, "ZlibStream", {
        InstanceMethod("push", &ZlibStream::Push),
        InstanceMethod("flush", &ZlibStream::Flush),
        InstanceMethod("reset", &ZlibStream::Reset),
        InstanceMethod("close", &ZlibStream::Close),
        InstanceMethod("getBuffer", &ZlibStream::GetBuffer),
        InstanceMethod("clearBuffer", &ZlibStream::ClearBuffer),
        InstanceAccessor("error", &ZlibStream::GetError, nullptr),
        InstanceAccessor("message", &ZlibStream::GetMessage, nullptr),
        InstanceAccessor("finished", &ZlibStream::IsFinished, nullptr)
    });

    constructor = Napi::Persistent(func);
    constructor.SuppressDestruct();

    exports.Set("ZlibStream", func);
    return exports;
}

ZlibStream::ZlibStream(const Napi::CallbackInfo& info)
    : Napi::ObjectWrap<ZlibStream>(info),
      initialized_(false),
      finished_(false),
      last_error_(Z_OK),
      chunk_size_(ZlibConstants::DEFAULT_CHUNK_SIZE) {

    Napi::Env env = info.Env();

    int window_bits = 15;
    size_t chunk_size = ZlibConstants::DEFAULT_CHUNK_SIZE;

    if (info.Length() > 0 && info[0].IsObject()) {
        Napi::Object options = info[0].As<Napi::Object>();

        if (options.Has("windowBits")) {
            window_bits = options.Get("windowBits").As<Napi::Number>().Int32Value();
        }

        if (options.Has("chunkSize")) {
            int32_t size = options.Get("chunkSize").As<Napi::Number>().Int32Value();
            if (size > 0) {
                chunk_size = static_cast<size_t>(size);
            }
        }
    }

    if (!InitializeStream(window_bits, chunk_size)) {
        Napi::Error::New(env, "Failed to initialize zlib stream").ThrowAsJavaScriptException();
    }
}

ZlibStream::~ZlibStream() {
    CleanupResources();
}

bool ZlibStream::InitializeStream(int window_bits, size_t chunk_size) {
    std::memset(&stream_, 0, sizeof(stream_));
    stream_.zalloc = Z_NULL;
    stream_.zfree = Z_NULL;
    stream_.opaque = Z_NULL;
    stream_.avail_in = 0;
    stream_.next_in = Z_NULL;

    int ret = inflateInit2(&stream_, window_bits);
    if (ret != Z_OK) {
        UpdateErrorState(ret);
        return false;
    }

    initialized_ = true;
    chunk_size_ = chunk_size;

    input_buffer_.reserve(chunk_size_ * 2);
    output_buffer_.reserve(chunk_size_ * 4);

    return true;
}

std::pair<const uint8_t*, size_t> ZlibStream::ExtractBufferData(const Napi::Value& value) const {
    if (value.IsBuffer()) {
        Napi::Buffer<uint8_t> buffer = value.As<Napi::Buffer<uint8_t>>();
        return {buffer.Data(), buffer.Length()};
    } else if (value.IsTypedArray()) {
        Napi::TypedArray typed_array = value.As<Napi::TypedArray>();
        const uint8_t* data = static_cast<const uint8_t*>(
            typed_array.ArrayBuffer().Data()) + typed_array.ByteOffset();
        return {data, typed_array.ByteLength()};
    }
    return {nullptr, 0};
}

Napi::Value ZlibStream::Push(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (!initialized_) {
        Napi::Error::New(env, ZlibConstants::ERR_NOT_INITIALIZED).ThrowAsJavaScriptException();
        return env.Null();
    }

    if (finished_) {
        Napi::Error::New(env, ZlibConstants::ERR_STREAM_FINISHED).ThrowAsJavaScriptException();
        return env.Null();
    }

    if (info.Length() < 1) {
        Napi::TypeError::New(env, ZlibConstants::ERR_NO_BUFFER_ARG).ThrowAsJavaScriptException();
        return env.Null();
    }

    if (!info[0].IsBuffer() && !info[0].IsTypedArray()) {
        Napi::TypeError::New(env, ZlibConstants::ERR_INVALID_BUFFER).ThrowAsJavaScriptException();
        return env.Null();
    }

    auto [data, length] = ExtractBufferData(info[0]);

    if (length == 0) {
        return Napi::Boolean::New(env, false);
    }

    input_buffer_.insert(input_buffer_.end(), data, data + length);

    bool processed = ProcessBuffer();

    return Napi::Boolean::New(env, processed);
}

bool ZlibStream::ProcessBuffer() {
    if (!HasZlibSuffix()) {
        return false;
    }

    stream_.avail_in = static_cast<uInt>(input_buffer_.size());
    stream_.next_in = input_buffer_.data();

    std::vector<uint8_t> temp_output;
    temp_output.reserve(chunk_size_);

    int ret;
    do {
        temp_output.resize(temp_output.capacity());
        stream_.avail_out = static_cast<uInt>(temp_output.size());
        stream_.next_out = temp_output.data();

        ret = inflate(&stream_, Z_SYNC_FLUSH);

        if (ret != Z_OK && ret != Z_BUF_ERROR) {
            UpdateErrorState(ret);
            break;
        }

        size_t produced = temp_output.size() - stream_.avail_out;
        if (produced > 0) {
            output_buffer_.insert(output_buffer_.end(),
                                temp_output.begin(),
                                temp_output.begin() + produced);
        }

        if (stream_.avail_out == 0 && stream_.avail_in > 0) {
            temp_output.reserve(temp_output.capacity() * 2);
        }

    } while (stream_.avail_in > 0 && ret == Z_OK);

    input_buffer_.clear();

    return true;
}

bool ZlibStream::HasZlibSuffix() const {
    if (input_buffer_.size() < ZlibConstants::ZLIB_SUFFIX_SIZE) {
        return false;
    }

    return std::equal(
        input_buffer_.end() - ZlibConstants::ZLIB_SUFFIX_SIZE,
        input_buffer_.end(),
        ZlibConstants::ZLIB_SUFFIX
    );
}

Napi::Value ZlibStream::Flush(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (!initialized_) {
        return env.Undefined();
    }

    if (!input_buffer_.empty()) {
        stream_.avail_in = static_cast<uInt>(input_buffer_.size());
        stream_.next_in = input_buffer_.data();

        std::vector<uint8_t> temp_output(chunk_size_);
        stream_.avail_out = static_cast<uInt>(temp_output.size());
        stream_.next_out = temp_output.data();

        int ret = inflate(&stream_, Z_FINISH);
        UpdateErrorState(ret);

        size_t produced = temp_output.size() - stream_.avail_out;
        if (produced > 0) {
            output_buffer_.insert(output_buffer_.end(),
                                temp_output.begin(),
                                temp_output.begin() + produced);
        }

        input_buffer_.clear();
        finished_ = (ret == Z_STREAM_END);
    }

    return env.Undefined();
}

Napi::Value ZlibStream::Reset(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (initialized_) {
        int ret = inflateReset(&stream_);
        UpdateErrorState(ret);

        input_buffer_.clear();
        output_buffer_.clear();
        finished_ = false;
    }

    return env.Undefined();
}

Napi::Value ZlibStream::Close(const Napi::CallbackInfo& info) {
    CleanupResources();
    return info.Env().Undefined();
}

Napi::Value ZlibStream::GetBuffer(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (output_buffer_.empty()) {
        return Napi::Buffer<uint8_t>::New(env, 0);
    }

    auto result = Napi::Buffer<uint8_t>::New(env, output_buffer_.size());
    std::memcpy(result.Data(), output_buffer_.data(), output_buffer_.size());

    return result;
}

Napi::Value ZlibStream::ClearBuffer(const Napi::CallbackInfo& info) {
    output_buffer_.clear();
    output_buffer_.shrink_to_fit();
    return info.Env().Undefined();
}

Napi::Value ZlibStream::GetError(const Napi::CallbackInfo& info) {
    return Napi::Number::New(info.Env(), last_error_);
}

Napi::Value ZlibStream::GetMessage(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    if (stream_.msg) {
        return Napi::String::New(env, stream_.msg);
    }
    return env.Null();
}

Napi::Value ZlibStream::IsFinished(const Napi::CallbackInfo& info) {
    return Napi::Boolean::New(info.Env(), finished_);
}

void ZlibStream::UpdateErrorState(int error_code) {
    last_error_ = error_code;
}

void ZlibStream::CleanupResources() {
    if (initialized_) {
        inflateEnd(&stream_);
        initialized_ = false;
    }

    input_buffer_.clear();
    input_buffer_.shrink_to_fit();
    output_buffer_.clear();
    output_buffer_.shrink_to_fit();
    finished_ = true;
}

Napi::Object InitZlib(Napi::Env env, Napi::Object exports) {
    ZlibStream::Init(env, exports);

    exports.Set("ZLIB_SUFFIX",
                Napi::Buffer<uint8_t>::Copy(env,
                                           ZlibConstants::ZLIB_SUFFIX,
                                           ZlibConstants::ZLIB_SUFFIX_SIZE));
    exports.Set("DEFAULT_CHUNK_SIZE",
                Napi::Number::New(env, ZlibConstants::DEFAULT_CHUNK_SIZE));
    exports.Set("ZLIB_VERSION",
                Napi::String::New(env, ZLIB_VERSION));

    return exports;
}