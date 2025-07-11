#include <napi.h>
#include <zlib.h>
#include <vector>
#include <memory>
#include <cstring>
#include <algorithm>

static const uint8_t ZLIB_SUFFIX[] = {0x00, 0x00, 0xFF, 0xFF};
static const size_t ZLIB_SUFFIX_SIZE = 4;
static const size_t DEFAULT_CHUNK_SIZE = 32768;

class DiscordZlibStream : public Napi::ObjectWrap<DiscordZlibStream> {
public:
    static Napi::Object Init(Napi::Env env, Napi::Object exports);
    DiscordZlibStream(const Napi::CallbackInfo& info);
    ~DiscordZlibStream();

private:
    static Napi::FunctionReference constructor;

    Napi::Value Push(const Napi::CallbackInfo& info);
    Napi::Value Flush(const Napi::CallbackInfo& info);
    Napi::Value Reset(const Napi::CallbackInfo& info);
    Napi::Value Close(const Napi::CallbackInfo& info);

    Napi::Value GetError(const Napi::CallbackInfo& info);
    Napi::Value GetMessage(const Napi::CallbackInfo& info);
    Napi::Value IsFinished(const Napi::CallbackInfo& info);

    Napi::Value GetBuffer(const Napi::CallbackInfo& info);
    Napi::Value ClearBuffer(const Napi::CallbackInfo& info);

    z_stream stream_;
    std::vector<uint8_t> input_buffer_;
    std::vector<uint8_t> output_buffer_;
    bool initialized_;
    bool finished_;
    int last_error_;
    size_t chunk_size_;

    bool InitializeStream(int window_bits, size_t chunk_size);
    bool ProcessBuffer();
    void UpdateErrorState(int error_code);
    bool HasZlibSuffix() const;
    void CleanupResources();
};

Napi::FunctionReference DiscordZlibStream::constructor;

Napi::Object DiscordZlibStream::Init(Napi::Env env, Napi::Object exports) {
    Napi::HandleScope scope(env);

    Napi::Function func = DefineClass(env, "ZlibStream", {
        InstanceMethod("push", &DiscordZlibStream::Push),
        InstanceMethod("flush", &DiscordZlibStream::Flush),
        InstanceMethod("reset", &DiscordZlibStream::Reset),
        InstanceMethod("close", &DiscordZlibStream::Close),

        InstanceMethod("getBuffer", &DiscordZlibStream::GetBuffer),
        InstanceMethod("clearBuffer", &DiscordZlibStream::ClearBuffer),

        InstanceAccessor("error", &DiscordZlibStream::GetError, nullptr),
        InstanceAccessor("message", &DiscordZlibStream::GetMessage, nullptr),
        InstanceAccessor("finished", &DiscordZlibStream::IsFinished, nullptr)
    });

    constructor = Napi::Persistent(func);
    constructor.SuppressDestruct();

    exports.Set("ZlibStream", func);
    return exports;
}

DiscordZlibStream::DiscordZlibStream(const Napi::CallbackInfo& info)
    : Napi::ObjectWrap<DiscordZlibStream>(info),
      initialized_(false),
      finished_(false),
      last_error_(Z_OK),
      chunk_size_(DEFAULT_CHUNK_SIZE) {

    Napi::Env env = info.Env();

    int window_bits = 15;
    size_t chunk_size = DEFAULT_CHUNK_SIZE;

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

DiscordZlibStream::~DiscordZlibStream() {
    CleanupResources();
}

bool DiscordZlibStream::InitializeStream(int window_bits, size_t chunk_size) {
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

Napi::Value DiscordZlibStream::Push(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (!initialized_) {
        Napi::Error::New(env, "Stream not initialized").ThrowAsJavaScriptException();
        return env.Null();
    }

    if (finished_) {
        Napi::Error::New(env, "Stream is finished").ThrowAsJavaScriptException();
        return env.Null();
    }

    if (info.Length() < 1) {
        Napi::TypeError::New(env, "Expected buffer argument").ThrowAsJavaScriptException();
        return env.Null();
    }

    if (!info[0].IsBuffer() && !info[0].IsTypedArray()) {
        Napi::TypeError::New(env, "Expected Buffer or Uint8Array").ThrowAsJavaScriptException();
        return env.Null();
    }

    const uint8_t* data;
    size_t length;

    if (info[0].IsBuffer()) {
        Napi::Buffer<uint8_t> buffer = info[0].As<Napi::Buffer<uint8_t>>();
        data = buffer.Data();
        length = buffer.Length();
    } else {
        Napi::TypedArray typed_array = info[0].As<Napi::TypedArray>();
        data = static_cast<const uint8_t*>(typed_array.ArrayBuffer().Data()) + typed_array.ByteOffset();
        length = typed_array.ByteLength();
    }

    if (length == 0) {
        return Napi::Boolean::New(env, false);
    }

    input_buffer_.insert(input_buffer_.end(), data, data + length);

    bool processed = ProcessBuffer();

    return Napi::Boolean::New(env, processed);
}

bool DiscordZlibStream::ProcessBuffer() {
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
            output_buffer_.insert(output_buffer_.end(), temp_output.begin(), temp_output.begin() + produced);
        }

        if (stream_.avail_out == 0 && stream_.avail_in > 0) {
            temp_output.reserve(temp_output.capacity() * 2);
        }

    } while (stream_.avail_in > 0 && ret == Z_OK);

    input_buffer_.clear();

    return true;
}

bool DiscordZlibStream::HasZlibSuffix() const {
    if (input_buffer_.size() < ZLIB_SUFFIX_SIZE) {
        return false;
    }

    return std::equal(
        input_buffer_.end() - ZLIB_SUFFIX_SIZE,
        input_buffer_.end(),
        ZLIB_SUFFIX
    );
}

Napi::Value DiscordZlibStream::Flush(const Napi::CallbackInfo& info) {
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
            output_buffer_.insert(output_buffer_.end(), temp_output.begin(), temp_output.begin() + produced);
        }

        input_buffer_.clear();
        finished_ = (ret == Z_STREAM_END);
    }

    return env.Undefined();
}

Napi::Value DiscordZlibStream::Reset(const Napi::CallbackInfo& info) {
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

Napi::Value DiscordZlibStream::Close(const Napi::CallbackInfo& info) {
    CleanupResources();
    return info.Env().Undefined();
}

Napi::Value DiscordZlibStream::GetBuffer(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (output_buffer_.empty()) {
        return Napi::Buffer<uint8_t>::New(env, 0);
    }

    auto result = Napi::Buffer<uint8_t>::New(env, output_buffer_.size());
    std::memcpy(result.Data(), output_buffer_.data(), output_buffer_.size());

    return result;
}

Napi::Value DiscordZlibStream::ClearBuffer(const Napi::CallbackInfo& info) {
    output_buffer_.clear();
    output_buffer_.shrink_to_fit();
    return info.Env().Undefined();
}

Napi::Value DiscordZlibStream::GetError(const Napi::CallbackInfo& info) {
    return Napi::Number::New(info.Env(), last_error_);
}

Napi::Value DiscordZlibStream::GetMessage(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    if (stream_.msg) {
        return Napi::String::New(env, stream_.msg);
    }
    return env.Null();
}

Napi::Value DiscordZlibStream::IsFinished(const Napi::CallbackInfo& info) {
    return Napi::Boolean::New(info.Env(), finished_);
}

void DiscordZlibStream::UpdateErrorState(int error_code) {
    last_error_ = error_code;
}

void DiscordZlibStream::CleanupResources() {
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

Napi::Object Init(Napi::Env env, Napi::Object exports) {
    DiscordZlibStream::Init(env, exports);

    exports.Set("ZLIB_SUFFIX", Napi::Buffer<uint8_t>::Copy(env, ZLIB_SUFFIX, ZLIB_SUFFIX_SIZE));
    exports.Set("DEFAULT_CHUNK_SIZE", Napi::Number::New(env, DEFAULT_CHUNK_SIZE));

    return exports;
}

NODE_API_MODULE(zlib, Init)