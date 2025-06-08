#include <napi.h>
#include <zstd.h>
#include <vector>
#include <memory>
#include <cstring>
#include <algorithm>

// Zstandard streaming constants
static const size_t DEFAULT_IN_BUFFER_SIZE = ZSTD_DStreamInSize();   // ~128KB
static const size_t DEFAULT_OUT_BUFFER_SIZE = ZSTD_DStreamOutSize(); // ~128KB

/**
 * High-performance streaming decompress class for Zstandard compression
 * Handles zstd-stream decompression with optimized buffering
 */
class ZstdInflateStream : public Napi::ObjectWrap<ZstdInflateStream> {
public:
    static Napi::Object Init(Napi::Env env, Napi::Object exports);
    ZstdInflateStream(const Napi::CallbackInfo& info);
    ~ZstdInflateStream();

private:
    static Napi::FunctionReference constructor;

    // Core methods
    Napi::Value Push(const Napi::CallbackInfo& info);
    Napi::Value Flush(const Napi::CallbackInfo& info);
    Napi::Value Reset(const Napi::CallbackInfo& info);
    Napi::Value Close(const Napi::CallbackInfo& info);

    // Getters
    Napi::Value GetError(const Napi::CallbackInfo& info);
    Napi::Value GetErrorMessage(const Napi::CallbackInfo& info);
    Napi::Value GetBytesRead(const Napi::CallbackInfo& info);
    Napi::Value GetBytesWritten(const Napi::CallbackInfo& info);
    Napi::Value IsFinished(const Napi::CallbackInfo& info);

    // Statistics
    Napi::Value GetStats(const Napi::CallbackInfo& info);

    // Buffer management
    Napi::Value GetBuffer(const Napi::CallbackInfo& info);
    Napi::Value ClearBuffer(const Napi::CallbackInfo& info);

    // Internal state
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

    // Internal methods
    bool InitializeStream(size_t in_buffer_size, size_t out_buffer_size);
    bool ProcessBuffer();
    void UpdateErrorState(size_t error_code);
    bool IsErrorCode(size_t result) const;
};

/**
 * Simple synchronous decompress for Zstandard compression
 * Handles per-frame zstd decompression
 */
class ZstdInflateSync : public Napi::ObjectWrap<ZstdInflateSync> {
public:
    static Napi::Object Init(Napi::Env env, Napi::Object exports);
    ZstdInflateSync(const Napi::CallbackInfo& info);

private:
    static Napi::FunctionReference constructor;
    Napi::Value Inflate(const Napi::CallbackInfo& info);
};

// Static member initialization
Napi::FunctionReference ZstdInflateStream::constructor;
Napi::FunctionReference ZstdInflateSync::constructor;

Napi::Object ZstdInflateStream::Init(Napi::Env env, Napi::Object exports) {
    Napi::HandleScope scope(env);

    Napi::Function func = DefineClass(env, "InflateStream", {
        InstanceMethod("push", &ZstdInflateStream::Push),
        InstanceMethod("flush", &ZstdInflateStream::Flush),
        InstanceMethod("reset", &ZstdInflateStream::Reset),
        InstanceMethod("close", &ZstdInflateStream::Close),
        InstanceMethod("getBuffer", &ZstdInflateStream::GetBuffer),
        InstanceMethod("clearBuffer", &ZstdInflateStream::ClearBuffer),

        InstanceAccessor("error", &ZstdInflateStream::GetError, nullptr),
        InstanceAccessor("message", &ZstdInflateStream::GetErrorMessage, nullptr),
        InstanceAccessor("bytesRead", &ZstdInflateStream::GetBytesRead, nullptr),
        InstanceAccessor("bytesWritten", &ZstdInflateStream::GetBytesWritten, nullptr),
        InstanceAccessor("finished", &ZstdInflateStream::IsFinished, nullptr),
        InstanceAccessor("stats", &ZstdInflateStream::GetStats, nullptr)
    });

    constructor = Napi::Persistent(func);
    constructor.SuppressDestruct();

    exports.Set("InflateStream", func);
    return exports;
}

ZstdInflateStream::ZstdInflateStream(const Napi::CallbackInfo& info)
    : Napi::ObjectWrap<ZstdInflateStream>(info),
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

    // Parse options
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

ZstdInflateStream::~ZstdInflateStream() {
    if (dstream_) {
        ZSTD_freeDStream(dstream_);
    }
}

bool ZstdInflateStream::InitializeStream(size_t in_buffer_size, size_t out_buffer_size) {
    // Create zstd decompression stream
    dstream_ = ZSTD_createDStream();
    if (!dstream_) {
        return false;
    }

    // Initialize the stream
    size_t result = ZSTD_initDStream(dstream_);
    if (IsErrorCode(result)) {
        UpdateErrorState(result);
        return false;
    }

    initialized_ = true;
    in_buffer_size_ = in_buffer_size;
    out_buffer_size_ = out_buffer_size;

    // Pre-allocate buffers
    input_buffer_.reserve(in_buffer_size_ * 2);
    output_buffer_.reserve(out_buffer_size_ * 2);

    return true;
}

Napi::Value ZstdInflateStream::Push(const Napi::CallbackInfo& info) {
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

    // Accept both Buffer and Uint8Array
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

    // Add data to internal buffer
    input_buffer_.insert(input_buffer_.end(), data, data + length);
    bytes_read_ += length;

    // Process buffer
    bool processed = ProcessBuffer();

    return Napi::Boolean::New(env, processed);
}

bool ZstdInflateStream::ProcessBuffer() {
    if (input_buffer_.empty()) {
        return false;
    }

    // Prepare input buffer for zstd
    ZSTD_inBuffer input = {
        input_buffer_.data(),
        input_buffer_.size(),
        0  // pos starts at 0
    };

    std::vector<uint8_t> temp_output(out_buffer_size_);
    bool has_output = false;

    // Process all available input
    while (input.pos < input.size) {
        // Prepare output buffer
        ZSTD_outBuffer output = {
            temp_output.data(),
            temp_output.size(),
            0  // pos starts at 0
        };

        // Decompress
        size_t result = ZSTD_decompressStream(dstream_, &output, &input);

        if (IsErrorCode(result)) {
            UpdateErrorState(result);
            return false;
        }

        // Check if we produced output
        if (output.pos > 0) {
            output_buffer_.insert(output_buffer_.end(), temp_output.begin(), temp_output.begin() + output.pos);
            bytes_written_ += output.pos;
            has_output = true;
        }

        // Check if frame is complete
        if (result == 0) {
            frames_processed_++;
            // Frame completed, but there might be more frames
        }

        // If no progress was made, we need more input
        if (output.pos == 0 && input.pos == input.size) {
            break;
        }
    }

    // Remove processed input data
    if (input.pos > 0) {
        input_buffer_.erase(input_buffer_.begin(), input_buffer_.begin() + input.pos);
    }

    return has_output;
}

bool ZstdInflateStream::IsErrorCode(size_t result) const {
    return ZSTD_isError(result);
}

Napi::Value ZstdInflateStream::Flush(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (!initialized_) {
        return env.Undefined();
    }

    // Process any remaining input
    ProcessBuffer();

    return env.Undefined();
}

Napi::Value ZstdInflateStream::Reset(const Napi::CallbackInfo& info) {
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

Napi::Value ZstdInflateStream::Close(const Napi::CallbackInfo& info) {
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

Napi::Value ZstdInflateStream::GetBuffer(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (output_buffer_.empty()) {
        return Napi::Buffer<uint8_t>::New(env, 0);
    }

    auto result = Napi::Buffer<uint8_t>::New(env, output_buffer_.size());
    std::memcpy(result.Data(), output_buffer_.data(), output_buffer_.size());

    return result;
}

Napi::Value ZstdInflateStream::ClearBuffer(const Napi::CallbackInfo& info) {
    output_buffer_.clear();
    return info.Env().Undefined();
}

Napi::Value ZstdInflateStream::GetError(const Napi::CallbackInfo& info) {
    return Napi::Number::New(info.Env(), static_cast<double>(last_error_));
}

Napi::Value ZstdInflateStream::GetErrorMessage(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    if (last_error_ != 0 && IsErrorCode(last_error_)) {
        return Napi::String::New(env, ZSTD_getErrorName(last_error_));
    }
    return env.Null();
}

Napi::Value ZstdInflateStream::GetBytesRead(const Napi::CallbackInfo& info) {
    return Napi::Number::New(info.Env(), static_cast<double>(bytes_read_));
}

Napi::Value ZstdInflateStream::GetBytesWritten(const Napi::CallbackInfo& info) {
    return Napi::Number::New(info.Env(), static_cast<double>(bytes_written_));
}

Napi::Value ZstdInflateStream::IsFinished(const Napi::CallbackInfo& info) {
    return Napi::Boolean::New(info.Env(), finished_);
}

Napi::Value ZstdInflateStream::GetStats(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    Napi::Object stats = Napi::Object::New(env);

    stats.Set("bytesRead", Napi::Number::New(env, static_cast<double>(bytes_read_)));
    stats.Set("bytesWritten", Napi::Number::New(env, static_cast<double>(bytes_written_)));
    stats.Set("framesProcessed", Napi::Number::New(env, static_cast<double>(frames_processed_)));

    double ratio = bytes_written_ > 0 ? static_cast<double>(bytes_read_) / static_cast<double>(bytes_written_) : 0.0;
    stats.Set("ratio", Napi::Number::New(env, ratio));

    if (frames_processed_ > 0) {
        stats.Set("averageInputSize", Napi::Number::New(env, static_cast<double>(bytes_read_) / static_cast<double>(frames_processed_)));
        stats.Set("averageOutputSize", Napi::Number::New(env, static_cast<double>(bytes_written_) / static_cast<double>(frames_processed_)));
    } else {
        stats.Set("averageInputSize", Napi::Number::New(env, 0));
        stats.Set("averageOutputSize", Napi::Number::New(env, 0));
    }

    return stats;
}

void ZstdInflateStream::UpdateErrorState(size_t error_code) {
    last_error_ = error_code;
}

Napi::Object ZstdInflateSync::Init(Napi::Env env, Napi::Object exports) {
    Napi::HandleScope scope(env);

    Napi::Function func = DefineClass(env, "InflateSync", {
        InstanceMethod("inflate", &ZstdInflateSync::Inflate)
    });

    constructor = Napi::Persistent(func);
    constructor.SuppressDestruct();

    exports.Set("InflateSync", func);
    return exports;
}

ZstdInflateSync::ZstdInflateSync(const Napi::CallbackInfo& info)
    : Napi::ObjectWrap<ZstdInflateSync>(info) {
}

Napi::Value ZstdInflateSync::Inflate(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (info.Length() < 1) {
        Napi::TypeError::New(env, "Expected buffer argument").ThrowAsJavaScriptException();
        return env.Null();
    }

    if (!info[0].IsBuffer() && !info[0].IsTypedArray()) {
        Napi::TypeError::New(env, "Expected Buffer or Uint8Array").ThrowAsJavaScriptException();
        return env.Null();
    }

    const uint8_t* input_data;
    size_t input_length;

    if (info[0].IsBuffer()) {
        Napi::Buffer<uint8_t> buffer = info[0].As<Napi::Buffer<uint8_t>>();
        input_data = buffer.Data();
        input_length = buffer.Length();
    } else {
        Napi::TypedArray typed_array = info[0].As<Napi::TypedArray>();
        input_data = static_cast<const uint8_t*>(typed_array.ArrayBuffer().Data()) + typed_array.ByteOffset();
        input_length = typed_array.ByteLength();
    }

    if (input_length == 0) {
        Napi::Error::New(env, "Input data cannot be empty").ThrowAsJavaScriptException();
        return env.Null();
    }

    // Get the decompressed size
    unsigned long long const frame_content_size = ZSTD_getFrameContentSize(input_data, input_length);

    size_t output_size;
    if (frame_content_size == ZSTD_CONTENTSIZE_ERROR) {
        Napi::Error::New(env, "Invalid zstd frame").ThrowAsJavaScriptException();
        return env.Null();
    } else if (frame_content_size == ZSTD_CONTENTSIZE_UNKNOWN) {
        // Use a reasonable default if size is unknown
        output_size = input_length * 4; // Assume 4x expansion
    } else {
        output_size = static_cast<size_t>(frame_content_size);
    }

    // Allocate output buffer
    std::vector<uint8_t> output(output_size);

    // Decompress
    size_t const result = ZSTD_decompress(output.data(), output_size, input_data, input_length);

    if (ZSTD_isError(result)) {
        std::string error_msg = "Zstd decompression failed: ";
        error_msg += ZSTD_getErrorName(result);
        Napi::Error::New(env, error_msg).ThrowAsJavaScriptException();
        return env.Null();
    }

    // Resize output to actual decompressed size
    output.resize(result);

    return Napi::Buffer<uint8_t>::Copy(env, output.data(), output.size());
}

/**
 * Synchronous decompress function for simple use cases
 */
Napi::Value InflateSync(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (info.Length() < 1) {
        Napi::TypeError::New(env, "Expected buffer argument").ThrowAsJavaScriptException();
        return env.Null();
    }

    const uint8_t* input_data;
    size_t input_length;

    if (info[0].IsBuffer()) {
        Napi::Buffer<uint8_t> buffer = info[0].As<Napi::Buffer<uint8_t>>();
        input_data = buffer.Data();
        input_length = buffer.Length();
    } else if (info[0].IsTypedArray()) {
        Napi::TypedArray typed_array = info[0].As<Napi::TypedArray>();
        input_data = static_cast<const uint8_t*>(typed_array.ArrayBuffer().Data()) + typed_array.ByteOffset();
        input_length = typed_array.ByteLength();
    } else {
        Napi::TypeError::New(env, "Expected Buffer or Uint8Array").ThrowAsJavaScriptException();
        return env.Null();
    }

    if (input_length == 0) {
        Napi::Error::New(env, "Input data cannot be empty").ThrowAsJavaScriptException();
        return env.Null();
    }

    // Get the decompressed size
    unsigned long long const frame_content_size = ZSTD_getFrameContentSize(input_data, input_length);

    size_t output_size;
    if (frame_content_size == ZSTD_CONTENTSIZE_ERROR) {
        Napi::Error::New(env, "Invalid zstd frame").ThrowAsJavaScriptException();
        return env.Null();
    } else if (frame_content_size == ZSTD_CONTENTSIZE_UNKNOWN) {
        output_size = input_length * 4;
    } else {
        output_size = static_cast<size_t>(frame_content_size);
    }

    std::vector<uint8_t> output(output_size);

    size_t const result = ZSTD_decompress(output.data(), output_size, input_data, input_length);

    if (ZSTD_isError(result)) {
        std::string error_msg = "Zstd decompression failed: ";
        error_msg += ZSTD_getErrorName(result);
        Napi::Error::New(env, error_msg).ThrowAsJavaScriptException();
        return env.Null();
    }

    output.resize(result);

    return Napi::Buffer<uint8_t>::Copy(env, output.data(), output.size());
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
    // Initialize classes
    ZstdInflateStream::Init(env, exports);
    ZstdInflateSync::Init(env, exports);

    // Add utility functions
    exports.Set("inflateSync", Napi::Function::New(env, InflateSync));

    // Add constants
    exports.Set("DEFAULT_IN_BUFFER_SIZE", Napi::Number::New(env, DEFAULT_IN_BUFFER_SIZE));
    exports.Set("DEFAULT_OUT_BUFFER_SIZE", Napi::Number::New(env, DEFAULT_OUT_BUFFER_SIZE));

    // Zstd version info
    exports.Set("ZSTD_VERSION_MAJOR", Napi::Number::New(env, ZSTD_VERSION_MAJOR));
    exports.Set("ZSTD_VERSION_MINOR", Napi::Number::New(env, ZSTD_VERSION_MINOR));
    exports.Set("ZSTD_VERSION_RELEASE", Napi::Number::New(env, ZSTD_VERSION_RELEASE));
    exports.Set("ZSTD_VERSION_NUMBER", Napi::Number::New(env, ZSTD_VERSION_NUMBER));
    exports.Set("ZSTD_VERSION_STRING", Napi::String::New(env, ZSTD_VERSION_STRING));

    return exports;
}

NODE_API_MODULE(zstd, Init)