#include <napi.h>
#include <zstd.h>
#include <vector>
#include <memory>
#include <cstring>
#include <algorithm>

static const size_t DEFAULT_IN_BUFFER_SIZE = ZSTD_DStreamInSize();
static const size_t DEFAULT_OUT_BUFFER_SIZE = ZSTD_DStreamOutSize();

class ZstdStream : public Napi::ObjectWrap<ZstdStream> {
public:
    static Napi::Object Init(Napi::Env env, Napi::Object exports);
    ZstdStream(const Napi::CallbackInfo& info);
    ~ZstdStream();

private:
    static Napi::FunctionReference constructor;

    Napi::Value Push(const Napi::CallbackInfo& info);
    Napi::Value Flush(const Napi::CallbackInfo& info);
    Napi::Value Reset(const Napi::CallbackInfo& info);
    Napi::Value Close(const Napi::CallbackInfo& info);

    Napi::Value GetError(const Napi::CallbackInfo& info);
    Napi::Value GetErrorMessage(const Napi::CallbackInfo& info);
    Napi::Value GetBytesRead(const Napi::CallbackInfo& info);
    Napi::Value GetBytesWritten(const Napi::CallbackInfo& info);
    Napi::Value IsFinished(const Napi::CallbackInfo& info);

    Napi::Value GetBuffer(const Napi::CallbackInfo& info);
    Napi::Value ClearBuffer(const Napi::CallbackInfo& info);

    ZSTD_DStream* dstream_;
    std::vector<uint8_t> input_buffer_;
    std::vector<uint8_t> output_buffer_;
    bool initialized_;
    bool finished_;
    size_t last_error_;
    size_t in_buffer_size_;
    size_t out_buffer_size_;
    size_t bytes_read_;
    size_t bytes_written_;
    size_t frames_processed_;

    bool InitializeStream(size_t in_buffer_size, size_t out_buffer_size);
    bool ProcessBuffer();
    void UpdateErrorState(size_t error_code);
    bool IsErrorCode(size_t result) const;
};

Napi::FunctionReference ZstdStream::constructor;

Napi::Object ZstdStream::Init(Napi::Env env, Napi::Object exports) {
    Napi::HandleScope scope(env);

    Napi::Function func = DefineClass(env, "ZstdStream", {
        InstanceMethod("push", &ZstdStream::Push),
        InstanceMethod("flush", &ZstdStream::Flush),
        InstanceMethod("reset", &ZstdStream::Reset),
        InstanceMethod("close", &ZstdStream::Close),
        InstanceMethod("getBuffer", &ZstdStream::GetBuffer),
        InstanceMethod("clearBuffer", &ZstdStream::ClearBuffer),

        InstanceAccessor("error", &ZstdStream::GetError, nullptr),
        InstanceAccessor("message", &ZstdStream::GetErrorMessage, nullptr),
        InstanceAccessor("bytesRead", &ZstdStream::GetBytesRead, nullptr),
        InstanceAccessor("bytesWritten", &ZstdStream::GetBytesWritten, nullptr),
        InstanceAccessor("finished", &ZstdStream::IsFinished, nullptr)
    });

    constructor = Napi::Persistent(func);
    constructor.SuppressDestruct();

    exports.Set("ZstdStream", func);
    return exports;
}

ZstdStream::ZstdStream(const Napi::CallbackInfo& info)
    : Napi::ObjectWrap<ZstdStream>(info),
      dstream_(nullptr),
      initialized_(false),
      finished_(false),
      last_error_(0),
      in_buffer_size_(DEFAULT_IN_BUFFER_SIZE),
      out_buffer_size_(DEFAULT_OUT_BUFFER_SIZE),
      bytes_read_(0),
      bytes_written_(0),
      frames_processed_(0) {

    Napi::Env env = info.Env();

    size_t in_buffer_size = DEFAULT_IN_BUFFER_SIZE;
    size_t out_buffer_size = DEFAULT_OUT_BUFFER_SIZE;

    if (info.Length() > 0 && info[0].IsObject()) {
        Napi::Object options = info[0].As<Napi::Object>();

        if (options.Has("inputBufferSize")) {
            int32_t size = options.Get("inputBufferSize").As<Napi::Number>().Int32Value();
            if (size > 0) {
                in_buffer_size = static_cast<size_t>(size);
            }
        }

        if (options.Has("outputBufferSize")) {
            int32_t size = options.Get("outputBufferSize").As<Napi::Number>().Int32Value();
            if (size > 0) {
                out_buffer_size = static_cast<size_t>(size);
            }
        }
    }

    if (!InitializeStream(in_buffer_size, out_buffer_size)) {
        Napi::Error::New(env, "Failed to initialize zstd stream").ThrowAsJavaScriptException();
    }
}

ZstdStream::~ZstdStream() {
    if (dstream_) {
        ZSTD_freeDStream(dstream_);
    }
}

bool ZstdStream::InitializeStream(size_t in_buffer_size, size_t out_buffer_size) {
    dstream_ = ZSTD_createDStream();
    if (!dstream_) {
        return false;
    }

    size_t result = ZSTD_initDStream(dstream_);
    if (IsErrorCode(result)) {
        UpdateErrorState(result);
        return false;
    }

    initialized_ = true;
    in_buffer_size_ = in_buffer_size;
    out_buffer_size_ = out_buffer_size;

    input_buffer_.reserve(in_buffer_size_ * 2);
    output_buffer_.reserve(out_buffer_size_ * 2);

    return true;
}

Napi::Value ZstdStream::Push(const Napi::CallbackInfo& info) {
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
    bytes_read_ += length;

    bool processed = ProcessBuffer();

    return Napi::Boolean::New(env, processed);
}

bool ZstdStream::ProcessBuffer() {
    if (input_buffer_.empty()) {
        return false;
    }

    ZSTD_inBuffer input = {
        input_buffer_.data(),
        input_buffer_.size(),
        0
    };

    std::vector<uint8_t> temp_output(out_buffer_size_);
    bool has_output = false;

    while (input.pos < input.size) {
        ZSTD_outBuffer output = {
            temp_output.data(),
            temp_output.size(),
            0
        };

        size_t result = ZSTD_decompressStream(dstream_, &output, &input);

        if (IsErrorCode(result)) {
            UpdateErrorState(result);
            return false;
        }

        if (output.pos > 0) {
            output_buffer_.insert(output_buffer_.end(), temp_output.begin(), temp_output.begin() + output.pos);
            bytes_written_ += output.pos;
            has_output = true;
        }

        if (result == 0) {
            frames_processed_++;
        }

        if (output.pos == 0 && input.pos == input.size) {
            break;
        }
    }

    if (input.pos > 0) {
        input_buffer_.erase(input_buffer_.begin(), input_buffer_.begin() + input.pos);
    }

    return has_output;
}

bool ZstdStream::IsErrorCode(size_t result) const {
    return ZSTD_isError(result);
}

Napi::Value ZstdStream::Flush(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (!initialized_) {
        return env.Undefined();
    }

    ProcessBuffer();

    return env.Undefined();
}

Napi::Value ZstdStream::Reset(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (initialized_ && dstream_) {
        size_t result = ZSTD_DCtx_reset(dstream_, ZSTD_reset_session_only);
        UpdateErrorState(result);

        input_buffer_.clear();
        output_buffer_.clear();
        finished_ = false;
        bytes_read_ = 0;
        bytes_written_ = 0;
        frames_processed_ = 0;
    }

    return env.Undefined();
}

Napi::Value ZstdStream::Close(const Napi::CallbackInfo& info) {
    if (dstream_) {
        ZSTD_freeDStream(dstream_);
        dstream_ = nullptr;
        initialized_ = false;
        input_buffer_.clear();
        output_buffer_.clear();
        finished_ = true;
    }
    return info.Env().Undefined();
}

Napi::Value ZstdStream::GetBuffer(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (output_buffer_.empty()) {
        return Napi::Buffer<uint8_t>::New(env, 0);
    }

    auto result = Napi::Buffer<uint8_t>::New(env, output_buffer_.size());
    std::memcpy(result.Data(), output_buffer_.data(), output_buffer_.size());

    return result;
}

Napi::Value ZstdStream::ClearBuffer(const Napi::CallbackInfo& info) {
    output_buffer_.clear();
    return info.Env().Undefined();
}

Napi::Value ZstdStream::GetError(const Napi::CallbackInfo& info) {
    return Napi::Number::New(info.Env(), static_cast<double>(last_error_));
}

Napi::Value ZstdStream::GetErrorMessage(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    if (last_error_ != 0 && IsErrorCode(last_error_)) {
        return Napi::String::New(env, ZSTD_getErrorName(last_error_));
    }
    return env.Null();
}

Napi::Value ZstdStream::GetBytesRead(const Napi::CallbackInfo& info) {
    return Napi::Number::New(info.Env(), static_cast<double>(bytes_read_));
}

Napi::Value ZstdStream::GetBytesWritten(const Napi::CallbackInfo& info) {
    return Napi::Number::New(info.Env(), static_cast<double>(bytes_written_));
}

Napi::Value ZstdStream::IsFinished(const Napi::CallbackInfo& info) {
    return Napi::Boolean::New(info.Env(), finished_);
}

void ZstdStream::UpdateErrorState(size_t error_code) {
    last_error_ = error_code;
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
    ZstdStream::Init(env, exports);

    exports.Set("DEFAULT_IN_BUFFER_SIZE", Napi::Number::New(env, DEFAULT_IN_BUFFER_SIZE));
    exports.Set("DEFAULT_OUT_BUFFER_SIZE", Napi::Number::New(env, DEFAULT_OUT_BUFFER_SIZE));

    return exports;
}

NODE_API_MODULE(zstd, Init)