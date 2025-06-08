#include <napi.h>
#include <zlib.h>
#include <vector>
#include <memory>
#include <cstring>
#include <algorithm>

// Discord Gateway compression constants
static const uint8_t ZLIB_SUFFIX[] = {0x00, 0x00, 0xFF, 0xFF};
static const size_t ZLIB_SUFFIX_SIZE = 4;
static const size_t DEFAULT_CHUNK_SIZE = 32768; // 32KB chunks for better performance

/**
 * High-performance streaming inflate class for Discord Gateway transport compression
 * Handles zlib-stream transport compression with shared context
 */
class DiscordInflateStream : public Napi::ObjectWrap<DiscordInflateStream> {
public:
    static Napi::Object Init(Napi::Env env, Napi::Object exports);
    DiscordInflateStream(const Napi::CallbackInfo& info);
    ~DiscordInflateStream();

private:
    static Napi::FunctionReference constructor;

    // Core methods
    Napi::Value Push(const Napi::CallbackInfo& info);
    Napi::Value Flush(const Napi::CallbackInfo& info);
    Napi::Value Reset(const Napi::CallbackInfo& info);
    Napi::Value Close(const Napi::CallbackInfo& info);

    // Getters
    Napi::Value GetResult(const Napi::CallbackInfo& info);
    Napi::Value GetError(const Napi::CallbackInfo& info);
    Napi::Value GetMessage(const Napi::CallbackInfo& info);
    Napi::Value GetBytesRead(const Napi::CallbackInfo& info);
    Napi::Value GetBytesWritten(const Napi::CallbackInfo& info);
    Napi::Value IsFinished(const Napi::CallbackInfo& info);

    // Buffer management
    Napi::Value GetBuffer(const Napi::CallbackInfo& info);
    Napi::Value ClearBuffer(const Napi::CallbackInfo& info);

    // Internal state
    z_stream stream_;
    std::vector<uint8_t> buffer_;
    std::vector<uint8_t> output_buffer_;
    bool initialized_;
    bool finished_;
    int last_error_;
    size_t chunk_size_;
    size_t bytes_read_;
    size_t bytes_written_;

    // Internal methods
    bool InitializeStream(int window_bits, size_t chunk_size);
    bool ProcessBuffer();
    void UpdateErrorState(int error_code);
    bool HasZlibSuffix() const;
};

/**
 * Simple synchronous inflate for Discord payload compression
 * Handles per-packet zlib decompression
 */
class DiscordInflateSync : public Napi::ObjectWrap<DiscordInflateSync> {
public:
    static Napi::Object Init(Napi::Env env, Napi::Object exports);
    DiscordInflateSync(const Napi::CallbackInfo& info);

private:
    static Napi::FunctionReference constructor;
    Napi::Value Inflate(const Napi::CallbackInfo& info);
};

// Static member initialization
Napi::FunctionReference DiscordInflateStream::constructor;
Napi::FunctionReference DiscordInflateSync::constructor;

Napi::Object DiscordInflateStream::Init(Napi::Env env, Napi::Object exports) {
    Napi::HandleScope scope(env);

    Napi::Function func = DefineClass(env, "InflateStream", {
        InstanceMethod("push", &DiscordInflateStream::Push),
        InstanceMethod("flush", &DiscordInflateStream::Flush),
        InstanceMethod("reset", &DiscordInflateStream::Reset),
        InstanceMethod("close", &DiscordInflateStream::Close),
        InstanceMethod("getBuffer", &DiscordInflateStream::GetBuffer),
        InstanceMethod("clearBuffer", &DiscordInflateStream::ClearBuffer),

        InstanceAccessor("result", &DiscordInflateStream::GetResult, nullptr),
        InstanceAccessor("error", &DiscordInflateStream::GetError, nullptr),
        InstanceAccessor("message", &DiscordInflateStream::GetMessage, nullptr),
        InstanceAccessor("bytesRead", &DiscordInflateStream::GetBytesRead, nullptr),
        InstanceAccessor("bytesWritten", &DiscordInflateStream::GetBytesWritten, nullptr),
        InstanceAccessor("finished", &DiscordInflateStream::IsFinished, nullptr)
    });

    constructor = Napi::Persistent(func);
    constructor.SuppressDestruct();

    exports.Set("InflateStream", func);
    return exports;
}

DiscordInflateStream::DiscordInflateStream(const Napi::CallbackInfo& info)
    : Napi::ObjectWrap<DiscordInflateStream>(info),
      initialized_(false),
      finished_(false),
      last_error_(Z_OK),
      chunk_size_(DEFAULT_CHUNK_SIZE),
      bytes_read_(0),
      bytes_written_(0) {

    Napi::Env env = info.Env();

    // Parse options
    int window_bits = 15; // Default for zlib format
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
        Napi::Error::New(env, "Failed to initialize inflate stream").ThrowAsJavaScriptException();
    }
}

DiscordInflateStream::~DiscordInflateStream() {
    if (initialized_) {
        inflateEnd(&stream_);
    }
}

bool DiscordInflateStream::InitializeStream(int window_bits, size_t chunk_size) {
    // Initialize zlib stream
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

    // Pre-allocate buffers
    buffer_.reserve(chunk_size_ * 2);
    output_buffer_.reserve(chunk_size_ * 4);

    return true;
}

Napi::Value DiscordInflateStream::Push(const Napi::CallbackInfo& info) {
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
    buffer_.insert(buffer_.end(), data, data + length);
    bytes_read_ += length;

    // Process buffer if we have zlib suffix
    bool processed = ProcessBuffer();

    return Napi::Boolean::New(env, processed);
}

bool DiscordInflateStream::ProcessBuffer() {
    if (!HasZlibSuffix()) {
        return false; // Wait for more data
    }

    // Process the complete message (excluding the suffix)
    size_t data_size = buffer_.size() - ZLIB_SUFFIX_SIZE;

    stream_.avail_in = static_cast<uInt>(buffer_.size());
    stream_.next_in = buffer_.data();

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
            bytes_written_ += produced;
        }

        // Expand buffer if needed
        if (stream_.avail_out == 0 && stream_.avail_in > 0) {
            temp_output.reserve(temp_output.capacity() * 2);
        }

    } while (stream_.avail_in > 0 && ret == Z_OK);

    // Clear the processed data from buffer
    buffer_.clear();

    return true;
}

bool DiscordInflateStream::HasZlibSuffix() const {
    if (buffer_.size() < ZLIB_SUFFIX_SIZE) {
        return false;
    }

    return std::equal(
        buffer_.end() - ZLIB_SUFFIX_SIZE,
        buffer_.end(),
        ZLIB_SUFFIX
    );
}

Napi::Value DiscordInflateStream::Flush(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (!initialized_) {
        return env.Undefined();
    }

    // Force process any remaining data
    if (!buffer_.empty()) {
        stream_.avail_in = static_cast<uInt>(buffer_.size());
        stream_.next_in = buffer_.data();

        std::vector<uint8_t> temp_output(chunk_size_);
        stream_.avail_out = static_cast<uInt>(temp_output.size());
        stream_.next_out = temp_output.data();

        int ret = inflate(&stream_, Z_FINISH);
        UpdateErrorState(ret);

        size_t produced = temp_output.size() - stream_.avail_out;
        if (produced > 0) {
            output_buffer_.insert(output_buffer_.end(), temp_output.begin(), temp_output.begin() + produced);
            bytes_written_ += produced;
        }

        buffer_.clear();
        finished_ = (ret == Z_STREAM_END);
    }

    return env.Undefined();
}

Napi::Value DiscordInflateStream::Reset(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (initialized_) {
        int ret = inflateReset(&stream_);
        UpdateErrorState(ret);

        buffer_.clear();
        output_buffer_.clear();
        finished_ = false;
        bytes_read_ = 0;
        bytes_written_ = 0;
    }

    return env.Undefined();
}

Napi::Value DiscordInflateStream::Close(const Napi::CallbackInfo& info) {
    if (initialized_) {
        inflateEnd(&stream_);
        initialized_ = false;
        buffer_.clear();
        output_buffer_.clear();
        finished_ = true;
    }
    return info.Env().Undefined();
}

Napi::Value DiscordInflateStream::GetResult(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (output_buffer_.empty()) {
        return Napi::Buffer<uint8_t>::New(env, 0);
    }

    return Napi::Buffer<uint8_t>::Copy(env, output_buffer_.data(), output_buffer_.size());
}

Napi::Value DiscordInflateStream::GetBuffer(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (output_buffer_.empty()) {
        return Napi::Buffer<uint8_t>::New(env, 0);
    }

    // Return buffer without copying for better performance
    auto result = Napi::Buffer<uint8_t>::New(env, output_buffer_.size());
    std::memcpy(result.Data(), output_buffer_.data(), output_buffer_.size());

    return result;
}

Napi::Value DiscordInflateStream::ClearBuffer(const Napi::CallbackInfo& info) {
    output_buffer_.clear();
    return info.Env().Undefined();
}

Napi::Value DiscordInflateStream::GetError(const Napi::CallbackInfo& info) {
    return Napi::Number::New(info.Env(), last_error_);
}

Napi::Value DiscordInflateStream::GetMessage(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    if (stream_.msg) {
        return Napi::String::New(env, stream_.msg);
    }
    return env.Null();
}

Napi::Value DiscordInflateStream::GetBytesRead(const Napi::CallbackInfo& info) {
    return Napi::Number::New(info.Env(), static_cast<double>(bytes_read_));
}

Napi::Value DiscordInflateStream::GetBytesWritten(const Napi::CallbackInfo& info) {
    return Napi::Number::New(info.Env(), static_cast<double>(bytes_written_));
}

Napi::Value DiscordInflateStream::IsFinished(const Napi::CallbackInfo& info) {
    return Napi::Boolean::New(info.Env(), finished_);
}

void DiscordInflateStream::UpdateErrorState(int error_code) {
    last_error_ = error_code;
}

Napi::Object DiscordInflateSync::Init(Napi::Env env, Napi::Object exports) {
    Napi::HandleScope scope(env);

    Napi::Function func = DefineClass(env, "InflateSync", {
        InstanceMethod("inflate", &DiscordInflateSync::Inflate)
    });

    constructor = Napi::Persistent(func);
    constructor.SuppressDestruct();

    exports.Set("InflateSync", func);
    return exports;
}

DiscordInflateSync::DiscordInflateSync(const Napi::CallbackInfo& info)
    : Napi::ObjectWrap<DiscordInflateSync>(info) {
}

Napi::Value DiscordInflateSync::Inflate(const Napi::CallbackInfo& info) {
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

    // Parse options
    int window_bits = 15;
    if (info.Length() > 1 && info[1].IsObject()) {
        Napi::Object options = info[1].As<Napi::Object>();
        if (options.Has("windowBits")) {
            window_bits = options.Get("windowBits").As<Napi::Number>().Int32Value();
        }
    }

    // Initialize stream
    z_stream stream;
    std::memset(&stream, 0, sizeof(stream));
    stream.zalloc = Z_NULL;
    stream.zfree = Z_NULL;
    stream.opaque = Z_NULL;

    int ret = inflateInit2(&stream, window_bits);
    if (ret != Z_OK) {
        Napi::Error::New(env, "Failed to initialize inflate stream").ThrowAsJavaScriptException();
        return env.Null();
    }

    // Process data
    std::vector<uint8_t> output;
    output.reserve(input_length * 2); // Estimate output size

    stream.avail_in = static_cast<uInt>(input_length);
    stream.next_in = const_cast<Bytef*>(input_data);

    do {
        std::vector<uint8_t> chunk(DEFAULT_CHUNK_SIZE);
        stream.avail_out = static_cast<uInt>(chunk.size());
        stream.next_out = chunk.data();

        ret = inflate(&stream, Z_FINISH);

        if (ret != Z_OK && ret != Z_STREAM_END && ret != Z_BUF_ERROR) {
            inflateEnd(&stream);
            Napi::Error::New(env, "Inflate error").ThrowAsJavaScriptException();
            return env.Null();
        }

        size_t produced = chunk.size() - stream.avail_out;
        if (produced > 0) {
            output.insert(output.end(), chunk.begin(), chunk.begin() + produced);
        }

    } while (ret != Z_STREAM_END && stream.avail_in > 0);

    inflateEnd(&stream);

    return Napi::Buffer<uint8_t>::Copy(env, output.data(), output.size());
}

/**
 * Synchronous inflate function for simple use cases
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

    // Parse options
    int window_bits = 15;
    if (info.Length() > 1 && info[1].IsObject()) {
        Napi::Object options = info[1].As<Napi::Object>();
        if (options.Has("windowBits")) {
            window_bits = options.Get("windowBits").As<Napi::Number>().Int32Value();
        }
    }

    // Initialize stream
    z_stream stream;
    std::memset(&stream, 0, sizeof(stream));
    stream.zalloc = Z_NULL;
    stream.zfree = Z_NULL;
    stream.opaque = Z_NULL;

    int ret = inflateInit2(&stream, window_bits);
    if (ret != Z_OK) {
        Napi::Error::New(env, "Failed to initialize inflate stream").ThrowAsJavaScriptException();
        return env.Null();
    }

    // Process data
    std::vector<uint8_t> output;
    output.reserve(input_length * 2);

    stream.avail_in = static_cast<uInt>(input_length);
    stream.next_in = const_cast<Bytef*>(input_data);

    do {
        std::vector<uint8_t> chunk(DEFAULT_CHUNK_SIZE);
        stream.avail_out = static_cast<uInt>(chunk.size());
        stream.next_out = chunk.data();

        ret = inflate(&stream, Z_FINISH);

        if (ret != Z_OK && ret != Z_STREAM_END && ret != Z_BUF_ERROR) {
            inflateEnd(&stream);
            Napi::Error::New(env, "Inflate error").ThrowAsJavaScriptException();
            return env.Null();
        }

        size_t produced = chunk.size() - stream.avail_out;
        if (produced > 0) {
            output.insert(output.end(), chunk.begin(), chunk.begin() + produced);
        }

    } while (ret != Z_STREAM_END && stream.avail_in > 0);

    inflateEnd(&stream);

    return Napi::Buffer<uint8_t>::Copy(env, output.data(), output.size());
}

/**
 * Check if buffer ends with zlib suffix (for transport compression)
 */
Napi::Value HasZlibSuffix(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (info.Length() < 1) {
        return Napi::Boolean::New(env, false);
    }

    const uint8_t* data;
    size_t length;

    if (info[0].IsBuffer()) {
        Napi::Buffer<uint8_t> buffer = info[0].As<Napi::Buffer<uint8_t>>();
        data = buffer.Data();
        length = buffer.Length();
    } else if (info[0].IsTypedArray()) {
        Napi::TypedArray typed_array = info[0].As<Napi::TypedArray>();
        data = static_cast<const uint8_t*>(typed_array.ArrayBuffer().Data()) + typed_array.ByteOffset();
        length = typed_array.ByteLength();
    } else {
        return Napi::Boolean::New(env, false);
    }

    if (length < ZLIB_SUFFIX_SIZE) {
        return Napi::Boolean::New(env, false);
    }

    bool has_suffix = std::equal(
        data + length - ZLIB_SUFFIX_SIZE,
        data + length,
        ZLIB_SUFFIX
    );

    return Napi::Boolean::New(env, has_suffix);
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
    // Initialize classes
    DiscordInflateStream::Init(env, exports);
    DiscordInflateSync::Init(env, exports);

    // Add utility functions
    exports.Set("inflateSync", Napi::Function::New(env, InflateSync));
    exports.Set("hasZlibSuffix", Napi::Function::New(env, HasZlibSuffix));

    // Add constants
    exports.Set("ZLIB_SUFFIX", Napi::Buffer<uint8_t>::Copy(env, ZLIB_SUFFIX, ZLIB_SUFFIX_SIZE));
    exports.Set("DEFAULT_CHUNK_SIZE", Napi::Number::New(env, DEFAULT_CHUNK_SIZE));

    // Zlib constants
    exports.Set("Z_NO_FLUSH", Napi::Number::New(env, Z_NO_FLUSH));
    exports.Set("Z_PARTIAL_FLUSH", Napi::Number::New(env, Z_PARTIAL_FLUSH));
    exports.Set("Z_SYNC_FLUSH", Napi::Number::New(env, Z_SYNC_FLUSH));
    exports.Set("Z_FULL_FLUSH", Napi::Number::New(env, Z_FULL_FLUSH));
    exports.Set("Z_FINISH", Napi::Number::New(env, Z_FINISH));

    exports.Set("Z_OK", Napi::Number::New(env, Z_OK));
    exports.Set("Z_STREAM_END", Napi::Number::New(env, Z_STREAM_END));
    exports.Set("Z_NEED_DICT", Napi::Number::New(env, Z_NEED_DICT));
    exports.Set("Z_ERRNO", Napi::Number::New(env, Z_ERRNO));
    exports.Set("Z_STREAM_ERROR", Napi::Number::New(env, Z_STREAM_ERROR));
    exports.Set("Z_DATA_ERROR", Napi::Number::New(env, Z_DATA_ERROR));
    exports.Set("Z_MEM_ERROR", Napi::Number::New(env, Z_MEM_ERROR));
    exports.Set("Z_BUF_ERROR", Napi::Number::New(env, Z_BUF_ERROR));

    return exports;
}

NODE_API_MODULE(zlib, Init)