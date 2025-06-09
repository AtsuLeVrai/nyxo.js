#include <napi.h>
#include <opus.h>
#include <vector>
#include <memory>
#include <cstring>
#include <algorithm>
#include <cstdio>
#include <cstdlib>

// Missing CELT function that's required by libopus but not always provided
extern "C" {
    void celt_fatal(const char *str, const char *file, int line) {
        std::fprintf(stderr, "Fatal (internal) error in %s, line %d: %s\n", file, line, str);
        std::abort();
    }
}

// Discord Voice specifications (MANDATORY) - Use defines for MSVC compatibility
#define DISCORD_SAMPLE_RATE 48000    // 48kHz required
#define DISCORD_CHANNELS 2           // Stereo required
#define DISCORD_FRAME_SIZE 960       // 20ms frames (48000 * 0.02)
#define DISCORD_BITRATE 64000        // 64kbps default
#define DEFAULT_COMPLEXITY 5         // Balanced quality/performance
#define MAX_PACKET_SIZE 4000         // Maximum Opus packet size
#define DEFAULT_MAX_BANDWIDTH OPUS_BANDWIDTH_FULLBAND

/**
 * High-performance Discord Opus encoder class optimized for Discord Voice applications
 * Provides native C++ Opus encoding with Discord-specific optimizations and requirements
 * Renamed to avoid conflicts with libopus OpusEncoder typedef
 */
class DiscordOpusEncoder : public Napi::ObjectWrap<DiscordOpusEncoder> {
public:
    static Napi::Object Init(Napi::Env env, Napi::Object exports);
    DiscordOpusEncoder(const Napi::CallbackInfo& info);
    ~DiscordOpusEncoder();

private:
    static Napi::FunctionReference constructor;

    // Core encoding methods
    Napi::Value Encode(const Napi::CallbackInfo& info);
    Napi::Value Reset(const Napi::CallbackInfo& info);
    Napi::Value Destroy(const Napi::CallbackInfo& info);

    // Configuration methods
    Napi::Value SetBitrate(const Napi::CallbackInfo& info);
    Napi::Value SetComplexity(const Napi::CallbackInfo& info);
    Napi::Value SetInbandFEC(const Napi::CallbackInfo& info);
    Napi::Value SetMaxBandwidth(const Napi::CallbackInfo& info);
    Napi::Value SetSignal(const Napi::CallbackInfo& info);
    Napi::Value SetApplication(const Napi::CallbackInfo& info);

    // Getters for current configuration
    Napi::Value GetBitrate(const Napi::CallbackInfo& info);
    Napi::Value GetComplexity(const Napi::CallbackInfo& info);
    Napi::Value GetInbandFEC(const Napi::CallbackInfo& info);
    Napi::Value GetMaxBandwidth(const Napi::CallbackInfo& info);
    Napi::Value GetSampleRate(const Napi::CallbackInfo& info);
    Napi::Value GetChannels(const Napi::CallbackInfo& info);

    // Internal state - use libopus types directly
    ::OpusEncoder* encoder_;
    bool initialized_;
    int sample_rate_;
    int channels_;
    int application_;
    std::vector<unsigned char> output_buffer_;

    // Internal methods
    bool InitializeEncoder(int sample_rate, int channels, int application);
    void UpdateConfiguration();
    bool ValidatePCMInput(const int16_t* pcm, int frame_size) const;
};

/**
 * High-performance Discord Opus decoder class optimized for Discord Voice applications
 * Provides native C++ Opus decoding with error correction and packet loss handling
 * Renamed to avoid conflicts with libopus OpusDecoder typedef
 */
class DiscordOpusDecoder : public Napi::ObjectWrap<DiscordOpusDecoder> {
public:
    static Napi::Object Init(Napi::Env env, Napi::Object exports);
    DiscordOpusDecoder(const Napi::CallbackInfo& info);
    ~DiscordOpusDecoder();

private:
    static Napi::FunctionReference constructor;

    // Core decoding methods
    Napi::Value Decode(const Napi::CallbackInfo& info);
    Napi::Value DecodeFEC(const Napi::CallbackInfo& info);
    Napi::Value Reset(const Napi::CallbackInfo& info);
    Napi::Value Destroy(const Napi::CallbackInfo& info);

    // Configuration methods
    Napi::Value SetGain(const Napi::CallbackInfo& info);

    // Getters for current configuration
    Napi::Value GetGain(const Napi::CallbackInfo& info);
    Napi::Value GetSampleRate(const Napi::CallbackInfo& info);
    Napi::Value GetChannels(const Napi::CallbackInfo& info);
    Napi::Value GetLastPacketDuration(const Napi::CallbackInfo& info);

    // Internal state - use libopus types directly
    ::OpusDecoder* decoder_;
    bool initialized_;
    int sample_rate_;
    int channels_;
    int last_packet_duration_;
    std::vector<int16_t> output_buffer_;

    // Internal methods
    bool InitializeDecoder(int sample_rate, int channels);
    bool ValidateOpusPacket(const unsigned char* data, int length) const;
};

// Static member initialization
Napi::FunctionReference DiscordOpusEncoder::constructor;
Napi::FunctionReference DiscordOpusDecoder::constructor;

Napi::Object DiscordOpusEncoder::Init(Napi::Env env, Napi::Object exports) {
    Napi::HandleScope scope(env);

    Napi::Function func = DefineClass(env, "OpusEncoder", {
        InstanceMethod("encode", &DiscordOpusEncoder::Encode),
        InstanceMethod("reset", &DiscordOpusEncoder::Reset),
        InstanceMethod("destroy", &DiscordOpusEncoder::Destroy),

        InstanceMethod("setBitrate", &DiscordOpusEncoder::SetBitrate),
        InstanceMethod("setComplexity", &DiscordOpusEncoder::SetComplexity),
        InstanceMethod("setInbandFEC", &DiscordOpusEncoder::SetInbandFEC),
        InstanceMethod("setMaxBandwidth", &DiscordOpusEncoder::SetMaxBandwidth),
        InstanceMethod("setSignal", &DiscordOpusEncoder::SetSignal),
        InstanceMethod("setApplication", &DiscordOpusEncoder::SetApplication),

        InstanceAccessor("bitrate", &DiscordOpusEncoder::GetBitrate, nullptr),
        InstanceAccessor("complexity", &DiscordOpusEncoder::GetComplexity, nullptr),
        InstanceAccessor("inbandFEC", &DiscordOpusEncoder::GetInbandFEC, nullptr),
        InstanceAccessor("maxBandwidth", &DiscordOpusEncoder::GetMaxBandwidth, nullptr),
        InstanceAccessor("sampleRate", &DiscordOpusEncoder::GetSampleRate, nullptr),
        InstanceAccessor("channels", &DiscordOpusEncoder::GetChannels, nullptr)
    });

    constructor = Napi::Persistent(func);
    constructor.SuppressDestruct();

    exports.Set("OpusEncoder", func);
    return exports;
}

DiscordOpusEncoder::DiscordOpusEncoder(const Napi::CallbackInfo& info)
    : Napi::ObjectWrap<DiscordOpusEncoder>(info),
      encoder_(nullptr),
      initialized_(false),
      sample_rate_(DISCORD_SAMPLE_RATE),
      channels_(DISCORD_CHANNELS),
      application_(OPUS_APPLICATION_VOIP) {

    Napi::Env env = info.Env();

    // Parse options
    int sample_rate = DISCORD_SAMPLE_RATE;
    int channels = DISCORD_CHANNELS;
    int application = OPUS_APPLICATION_VOIP;

    if (info.Length() > 0 && info[0].IsObject()) {
        Napi::Object options = info[0].As<Napi::Object>();

        if (options.Has("sampleRate")) {
            sample_rate = options.Get("sampleRate").As<Napi::Number>().Int32Value();
        }

        if (options.Has("channels")) {
            channels = options.Get("channels").As<Napi::Number>().Int32Value();
        }

        if (options.Has("application")) {
            std::string app_str = options.Get("application").As<Napi::String>().Utf8Value();
            if (app_str == "voip") {
                application = OPUS_APPLICATION_VOIP;
            } else if (app_str == "audio") {
                application = OPUS_APPLICATION_AUDIO;
            } else if (app_str == "lowdelay") {
                application = OPUS_APPLICATION_RESTRICTED_LOWDELAY;
            }
        }
    }

    // Validate Discord Voice requirements
    if (sample_rate != DISCORD_SAMPLE_RATE) {
        Napi::Error::New(env, "Discord Voice requires 48kHz sample rate").ThrowAsJavaScriptException();
        return;
    }

    if (channels != DISCORD_CHANNELS) {
        Napi::Error::New(env, "Discord Voice requires stereo (2 channels)").ThrowAsJavaScriptException();
        return;
    }

    if (!InitializeEncoder(sample_rate, channels, application)) {
        Napi::Error::New(env, "Failed to initialize Opus encoder").ThrowAsJavaScriptException();
        return;
    }
}

DiscordOpusEncoder::~DiscordOpusEncoder() {
    if (encoder_) {
        opus_encoder_destroy(encoder_);
    }
}

bool DiscordOpusEncoder::InitializeEncoder(int sample_rate, int channels, int application) {
    int error;
    encoder_ = opus_encoder_create(sample_rate, channels, application, &error);

    if (error != OPUS_OK || !encoder_) {
        return false;
    }

    sample_rate_ = sample_rate;
    channels_ = channels;
    application_ = application;
    initialized_ = true;

    // Set Discord-optimized defaults for Voice applications
    opus_encoder_ctl(encoder_, OPUS_SET_BITRATE(DISCORD_BITRATE));
    opus_encoder_ctl(encoder_, OPUS_SET_COMPLEXITY(DEFAULT_COMPLEXITY));
    opus_encoder_ctl(encoder_, OPUS_SET_INBAND_FEC(1)); // Enable FEC for packet loss recovery
    opus_encoder_ctl(encoder_, OPUS_SET_MAX_BANDWIDTH(DEFAULT_MAX_BANDWIDTH));
    opus_encoder_ctl(encoder_, OPUS_SET_SIGNAL(OPUS_SIGNAL_VOICE));

    // Pre-allocate output buffer for better performance
    output_buffer_.reserve(MAX_PACKET_SIZE);

    return true;
}

Napi::Value DiscordOpusEncoder::Encode(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (!initialized_) {
        Napi::Error::New(env, "Encoder not initialized").ThrowAsJavaScriptException();
        return env.Null();
    }

    if (info.Length() < 1) {
        Napi::TypeError::New(env, "Expected PCM data buffer").ThrowAsJavaScriptException();
        return env.Null();
    }

    // Accept both Buffer and Int16Array for PCM input
    const int16_t* pcm_data;
    size_t pcm_length;

    if (info[0].IsBuffer()) {
        Napi::Buffer<int16_t> buffer = info[0].As<Napi::Buffer<int16_t>>();
        pcm_data = buffer.Data();
        pcm_length = buffer.Length();
    } else if (info[0].IsTypedArray()) {
        Napi::TypedArray typed_array = info[0].As<Napi::TypedArray>();
        if (typed_array.TypedArrayType() != napi_int16_array) {
            Napi::TypeError::New(env, "Expected Int16Array for PCM data").ThrowAsJavaScriptException();
            return env.Null();
        }
        pcm_data = static_cast<const int16_t*>(typed_array.ArrayBuffer().Data()) + (typed_array.ByteOffset() / sizeof(int16_t));
        pcm_length = typed_array.ByteLength() / sizeof(int16_t);
    } else {
        Napi::TypeError::New(env, "Expected Buffer or Int16Array").ThrowAsJavaScriptException();
        return env.Null();
    }

    // Calculate frame size (samples per channel)
    int frame_size = static_cast<int>(pcm_length / channels_);

    // Validate frame size for Discord Voice (must be 960 samples = 20ms at 48kHz)
    if (frame_size != DISCORD_FRAME_SIZE) {
        Napi::Error::New(env, "Discord Voice requires 960 samples per frame (20ms at 48kHz)").ThrowAsJavaScriptException();
        return env.Null();
    }

    if (!ValidatePCMInput(pcm_data, frame_size)) {
        Napi::Error::New(env, "Invalid PCM input data").ThrowAsJavaScriptException();
        return env.Null();
    }

    // Ensure output buffer is large enough
    output_buffer_.resize(MAX_PACKET_SIZE);

    // Encode the PCM frame to Opus
    int encoded_bytes = opus_encode(encoder_, pcm_data, frame_size, output_buffer_.data(), static_cast<opus_int32>(output_buffer_.size()));

    if (encoded_bytes < 0) {
        std::string error_msg = "Opus encoding failed: ";
        switch (encoded_bytes) {
            case OPUS_BAD_ARG:
                error_msg += "Bad argument provided to encoder";
                break;
            case OPUS_BUFFER_TOO_SMALL:
                error_msg += "Output buffer too small for encoded data";
                break;
            case OPUS_INTERNAL_ERROR:
                error_msg += "Internal encoder error";
                break;
            case OPUS_INVALID_PACKET:
                error_msg += "Invalid packet structure";
                break;
            case OPUS_UNIMPLEMENTED:
                error_msg += "Unimplemented feature requested";
                break;
            case OPUS_INVALID_STATE:
                error_msg += "Invalid encoder state";
                break;
            case OPUS_ALLOC_FAIL:
                error_msg += "Memory allocation failed";
                break;
            default:
                error_msg += "Unknown error code (" + std::to_string(encoded_bytes) + ")";
        }
        Napi::Error::New(env, error_msg).ThrowAsJavaScriptException();
        return env.Null();
    }

    return Napi::Buffer<unsigned char>::Copy(env, output_buffer_.data(), encoded_bytes);
}

bool DiscordOpusEncoder::ValidatePCMInput(const int16_t* pcm, int frame_size) const {
    if (!pcm || frame_size <= 0) {
        return false;
    }

    // Check for reasonable PCM values to detect common input issues
    int zero_count = 0;
    int clipped_count = 0;
    int total_samples = frame_size * channels_;

    for (int i = 0; i < total_samples; i++) {
        if (pcm[i] == 0) {
            zero_count++;
        } else if (pcm[i] == INT16_MAX || pcm[i] == INT16_MIN) {
            clipped_count++;
        }
    }

    // Allow some zeros but not complete silence for extended periods
    // Allow some clipping but not constant clipping which indicates problems
    return (zero_count < total_samples * 9 / 10) && (clipped_count < total_samples / 10);
}

Napi::Value DiscordOpusEncoder::SetBitrate(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (!initialized_) {
        Napi::Error::New(env, "Encoder not initialized").ThrowAsJavaScriptException();
        return env.Undefined();
    }

    if (info.Length() < 1 || !info[0].IsNumber()) {
        Napi::TypeError::New(env, "Expected bitrate as number").ThrowAsJavaScriptException();
        return env.Undefined();
    }

    int bitrate = info[0].As<Napi::Number>().Int32Value();

    // Validate bitrate range (Opus supports 500bps to 512kbps)
    if (bitrate < 500 || bitrate > 512000) {
        Napi::RangeError::New(env, "Bitrate must be between 500 and 512000 bps").ThrowAsJavaScriptException();
        return env.Undefined();
    }

    int result = opus_encoder_ctl(encoder_, OPUS_SET_BITRATE(bitrate));
    if (result != OPUS_OK) {
        Napi::Error::New(env, "Failed to set bitrate on encoder").ThrowAsJavaScriptException();
    }

    return env.Undefined();
}

Napi::Value DiscordOpusEncoder::SetComplexity(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (!initialized_) {
        Napi::Error::New(env, "Encoder not initialized").ThrowAsJavaScriptException();
        return env.Undefined();
    }

    if (info.Length() < 1 || !info[0].IsNumber()) {
        Napi::TypeError::New(env, "Expected complexity as number").ThrowAsJavaScriptException();
        return env.Undefined();
    }

    int complexity = info[0].As<Napi::Number>().Int32Value();

    // Validate complexity range (0-10, where 0=fastest, 10=best quality)
    if (complexity < 0 || complexity > 10) {
        Napi::RangeError::New(env, "Complexity must be between 0 and 10").ThrowAsJavaScriptException();
        return env.Undefined();
    }

    int result = opus_encoder_ctl(encoder_, OPUS_SET_COMPLEXITY(complexity));
    if (result != OPUS_OK) {
        Napi::Error::New(env, "Failed to set complexity on encoder").ThrowAsJavaScriptException();
    }

    return env.Undefined();
}

Napi::Value DiscordOpusEncoder::SetInbandFEC(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (!initialized_) {
        Napi::Error::New(env, "Encoder not initialized").ThrowAsJavaScriptException();
        return env.Undefined();
    }

    if (info.Length() < 1 || !info[0].IsBoolean()) {
        Napi::TypeError::New(env, "Expected boolean for inband FEC setting").ThrowAsJavaScriptException();
        return env.Undefined();
    }

    bool enable = info[0].As<Napi::Boolean>().Value();

    int result = opus_encoder_ctl(encoder_, OPUS_SET_INBAND_FEC(enable ? 1 : 0));
    if (result != OPUS_OK) {
        Napi::Error::New(env, "Failed to set inband FEC on encoder").ThrowAsJavaScriptException();
    }

    return env.Undefined();
}

Napi::Value DiscordOpusEncoder::SetMaxBandwidth(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (!initialized_) {
        Napi::Error::New(env, "Encoder not initialized").ThrowAsJavaScriptException();
        return env.Undefined();
    }

    if (info.Length() < 1 || !info[0].IsNumber()) {
        Napi::TypeError::New(env, "Expected bandwidth as number").ThrowAsJavaScriptException();
        return env.Undefined();
    }

    int bandwidth = info[0].As<Napi::Number>().Int32Value();

    // Validate bandwidth values
    if (bandwidth != OPUS_BANDWIDTH_NARROWBAND &&
        bandwidth != OPUS_BANDWIDTH_MEDIUMBAND &&
        bandwidth != OPUS_BANDWIDTH_WIDEBAND &&
        bandwidth != OPUS_BANDWIDTH_SUPERWIDEBAND &&
        bandwidth != OPUS_BANDWIDTH_FULLBAND) {
        Napi::Error::New(env, "Invalid bandwidth value").ThrowAsJavaScriptException();
        return env.Undefined();
    }

    int result = opus_encoder_ctl(encoder_, OPUS_SET_MAX_BANDWIDTH(bandwidth));
    if (result != OPUS_OK) {
        Napi::Error::New(env, "Failed to set max bandwidth on encoder").ThrowAsJavaScriptException();
    }

    return env.Undefined();
}

Napi::Value DiscordOpusEncoder::SetSignal(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (!initialized_) {
        Napi::Error::New(env, "Encoder not initialized").ThrowAsJavaScriptException();
        return env.Undefined();
    }

    if (info.Length() < 1 || !info[0].IsNumber()) {
        Napi::TypeError::New(env, "Expected signal type as number").ThrowAsJavaScriptException();
        return env.Undefined();
    }

    int signal = info[0].As<Napi::Number>().Int32Value();

    if (signal != OPUS_SIGNAL_VOICE && signal != OPUS_SIGNAL_MUSIC) {
        Napi::Error::New(env, "Signal must be OPUS_SIGNAL_VOICE or OPUS_SIGNAL_MUSIC").ThrowAsJavaScriptException();
        return env.Undefined();
    }

    int result = opus_encoder_ctl(encoder_, OPUS_SET_SIGNAL(signal));
    if (result != OPUS_OK) {
        Napi::Error::New(env, "Failed to set signal type on encoder").ThrowAsJavaScriptException();
    }

    return env.Undefined();
}

Napi::Value DiscordOpusEncoder::SetApplication(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (!initialized_) {
        Napi::Error::New(env, "Encoder not initialized").ThrowAsJavaScriptException();
        return env.Undefined();
    }

    if (info.Length() < 1 || !info[0].IsString()) {
        Napi::TypeError::New(env, "Expected application as string").ThrowAsJavaScriptException();
        return env.Undefined();
    }

    std::string app_str = info[0].As<Napi::String>().Utf8Value();
    int application;

    if (app_str == "voip") {
        application = OPUS_APPLICATION_VOIP;
    } else if (app_str == "audio") {
        application = OPUS_APPLICATION_AUDIO;
    } else if (app_str == "lowdelay") {
        application = OPUS_APPLICATION_RESTRICTED_LOWDELAY;
    } else {
        Napi::Error::New(env, "Invalid application type").ThrowAsJavaScriptException();
        return env.Undefined();
    }

    int result = opus_encoder_ctl(encoder_, OPUS_SET_APPLICATION(application));
    if (result != OPUS_OK) {
        Napi::Error::New(env, "Failed to set application on encoder").ThrowAsJavaScriptException();
    } else {
        application_ = application;
    }

    return env.Undefined();
}

Napi::Value DiscordOpusEncoder::Reset(const Napi::CallbackInfo& info) {
    if (initialized_ && encoder_) {
        opus_encoder_ctl(encoder_, OPUS_RESET_STATE);
    }
    return info.Env().Undefined();
}

Napi::Value DiscordOpusEncoder::Destroy(const Napi::CallbackInfo& info) {
    if (encoder_) {
        opus_encoder_destroy(encoder_);
        encoder_ = nullptr;
        initialized_ = false;
    }
    return info.Env().Undefined();
}

// Getter methods for DiscordOpusEncoder
Napi::Value DiscordOpusEncoder::GetBitrate(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    if (!initialized_) return env.Null();

    opus_int32 bitrate;
    opus_encoder_ctl(encoder_, OPUS_GET_BITRATE(&bitrate));
    return Napi::Number::New(env, bitrate);
}

Napi::Value DiscordOpusEncoder::GetComplexity(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    if (!initialized_) return env.Null();

    opus_int32 complexity;
    opus_encoder_ctl(encoder_, OPUS_GET_COMPLEXITY(&complexity));
    return Napi::Number::New(env, complexity);
}

Napi::Value DiscordOpusEncoder::GetInbandFEC(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    if (!initialized_) return env.Null();

    opus_int32 inband_fec;
    opus_encoder_ctl(encoder_, OPUS_GET_INBAND_FEC(&inband_fec));
    return Napi::Boolean::New(env, inband_fec == 1);
}

Napi::Value DiscordOpusEncoder::GetMaxBandwidth(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    if (!initialized_) return env.Null();

    opus_int32 max_bandwidth;
    opus_encoder_ctl(encoder_, OPUS_GET_MAX_BANDWIDTH(&max_bandwidth));
    return Napi::Number::New(env, max_bandwidth);
}

Napi::Value DiscordOpusEncoder::GetSampleRate(const Napi::CallbackInfo& info) {
    return Napi::Number::New(info.Env(), sample_rate_);
}

Napi::Value DiscordOpusEncoder::GetChannels(const Napi::CallbackInfo& info) {
    return Napi::Number::New(info.Env(), channels_);
}

// DiscordOpusDecoder implementation
Napi::Object DiscordOpusDecoder::Init(Napi::Env env, Napi::Object exports) {
    Napi::HandleScope scope(env);

    Napi::Function func = DefineClass(env, "OpusDecoder", {
        InstanceMethod("decode", &DiscordOpusDecoder::Decode),
        InstanceMethod("decodeFEC", &DiscordOpusDecoder::DecodeFEC),
        InstanceMethod("reset", &DiscordOpusDecoder::Reset),
        InstanceMethod("destroy", &DiscordOpusDecoder::Destroy),

        InstanceMethod("setGain", &DiscordOpusDecoder::SetGain),

        InstanceAccessor("gain", &DiscordOpusDecoder::GetGain, nullptr),
        InstanceAccessor("sampleRate", &DiscordOpusDecoder::GetSampleRate, nullptr),
        InstanceAccessor("channels", &DiscordOpusDecoder::GetChannels, nullptr),
        InstanceAccessor("lastPacketDuration", &DiscordOpusDecoder::GetLastPacketDuration, nullptr)
    });

    constructor = Napi::Persistent(func);
    constructor.SuppressDestruct();

    exports.Set("OpusDecoder", func);
    return exports;
}

DiscordOpusDecoder::DiscordOpusDecoder(const Napi::CallbackInfo& info)
    : Napi::ObjectWrap<DiscordOpusDecoder>(info),
      decoder_(nullptr),
      initialized_(false),
      sample_rate_(DISCORD_SAMPLE_RATE),
      channels_(DISCORD_CHANNELS),
      last_packet_duration_(0) {

    Napi::Env env = info.Env();

    // Parse options
    int sample_rate = DISCORD_SAMPLE_RATE;
    int channels = DISCORD_CHANNELS;

    if (info.Length() > 0 && info[0].IsObject()) {
        Napi::Object options = info[0].As<Napi::Object>();

        if (options.Has("sampleRate")) {
            sample_rate = options.Get("sampleRate").As<Napi::Number>().Int32Value();
        }

        if (options.Has("channels")) {
            channels = options.Get("channels").As<Napi::Number>().Int32Value();
        }
    }

    // Validate Discord Voice requirements
    if (sample_rate != DISCORD_SAMPLE_RATE) {
        Napi::Error::New(env, "Discord Voice requires 48kHz sample rate").ThrowAsJavaScriptException();
        return;
    }

    if (channels != DISCORD_CHANNELS) {
        Napi::Error::New(env, "Discord Voice requires stereo (2 channels)").ThrowAsJavaScriptException();
        return;
    }

    if (!InitializeDecoder(sample_rate, channels)) {
        Napi::Error::New(env, "Failed to initialize Opus decoder").ThrowAsJavaScriptException();
        return;
    }
}

DiscordOpusDecoder::~DiscordOpusDecoder() {
    if (decoder_) {
        opus_decoder_destroy(decoder_);
    }
}

bool DiscordOpusDecoder::InitializeDecoder(int sample_rate, int channels) {
    int error;
    decoder_ = opus_decoder_create(sample_rate, channels, &error);

    if (error != OPUS_OK || !decoder_) {
        return false;
    }

    sample_rate_ = sample_rate;
    channels_ = channels;
    initialized_ = true;

    // Pre-allocate output buffer for Discord frame size
    output_buffer_.resize(DISCORD_FRAME_SIZE * channels_);

    return true;
}

Napi::Value DiscordOpusDecoder::Decode(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (!initialized_) {
        Napi::Error::New(env, "Decoder not initialized").ThrowAsJavaScriptException();
        return env.Null();
    }

    if (info.Length() < 1) {
        Napi::TypeError::New(env, "Expected Opus packet buffer").ThrowAsJavaScriptException();
        return env.Null();
    }

    const unsigned char* packet_data = nullptr;
    int packet_length = 0;

    // Handle null/undefined for packet loss scenarios
    if (!info[0].IsNull() && !info[0].IsUndefined()) {
        if (info[0].IsBuffer()) {
            Napi::Buffer<unsigned char> buffer = info[0].As<Napi::Buffer<unsigned char>>();
            packet_data = buffer.Data();
            packet_length = static_cast<int>(buffer.Length());
        } else if (info[0].IsTypedArray()) {
            Napi::TypedArray typed_array = info[0].As<Napi::TypedArray>();
            packet_data = static_cast<const unsigned char*>(typed_array.ArrayBuffer().Data()) + typed_array.ByteOffset();
            packet_length = static_cast<int>(typed_array.ByteLength());
        } else {
            Napi::TypeError::New(env, "Expected Buffer, Uint8Array, or null").ThrowAsJavaScriptException();
            return env.Null();
        }

        if (packet_data && !ValidateOpusPacket(packet_data, packet_length)) {
            Napi::Error::New(env, "Invalid Opus packet format").ThrowAsJavaScriptException();
            return env.Null();
        }
    }

    // Decode frame (handles packet loss if packet_data is null)
    int decoded_samples = opus_decode(decoder_, packet_data, packet_length, output_buffer_.data(), DISCORD_FRAME_SIZE, 0);

    if (decoded_samples < 0) {
        std::string error_msg = "Opus decoding failed: ";
        switch (decoded_samples) {
            case OPUS_BAD_ARG:
                error_msg += "Bad argument provided to decoder";
                break;
            case OPUS_BUFFER_TOO_SMALL:
                error_msg += "Output buffer too small for decoded data";
                break;
            case OPUS_INTERNAL_ERROR:
                error_msg += "Internal decoder error";
                break;
            case OPUS_INVALID_PACKET:
                error_msg += "Invalid or corrupted packet";
                break;
            case OPUS_UNIMPLEMENTED:
                error_msg += "Unimplemented feature requested";
                break;
            case OPUS_INVALID_STATE:
                error_msg += "Invalid decoder state";
                break;
            case OPUS_ALLOC_FAIL:
                error_msg += "Memory allocation failed";
                break;
            default:
                error_msg += "Unknown error code (" + std::to_string(decoded_samples) + ")";
        }
        Napi::Error::New(env, error_msg).ThrowAsJavaScriptException();
        return env.Null();
    }

    last_packet_duration_ = decoded_samples;

    // Return the decoded PCM data
    return Napi::Buffer<int16_t>::Copy(env, output_buffer_.data(), decoded_samples * channels_);
}

Napi::Value DiscordOpusDecoder::DecodeFEC(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (!initialized_) {
        Napi::Error::New(env, "Decoder not initialized").ThrowAsJavaScriptException();
        return env.Null();
    }

    if (info.Length() < 1) {
        Napi::TypeError::New(env, "Expected Opus packet buffer").ThrowAsJavaScriptException();
        return env.Null();
    }

    const unsigned char* packet_data;
    int packet_length;

    if (info[0].IsBuffer()) {
        Napi::Buffer<unsigned char> buffer = info[0].As<Napi::Buffer<unsigned char>>();
        packet_data = buffer.Data();
        packet_length = static_cast<int>(buffer.Length());
    } else if (info[0].IsTypedArray()) {
        Napi::TypedArray typed_array = info[0].As<Napi::TypedArray>();
        packet_data = static_cast<const unsigned char*>(typed_array.ArrayBuffer().Data()) + typed_array.ByteOffset();
        packet_length = static_cast<int>(typed_array.ByteLength());
    } else {
        Napi::TypeError::New(env, "Expected Buffer or Uint8Array").ThrowAsJavaScriptException();
        return env.Null();
    }

    if (!ValidateOpusPacket(packet_data, packet_length)) {
        Napi::Error::New(env, "Invalid Opus packet format").ThrowAsJavaScriptException();
        return env.Null();
    }

    // Decode with FEC (Forward Error Correction) enabled
    int decoded_samples = opus_decode(decoder_, packet_data, packet_length, output_buffer_.data(), DISCORD_FRAME_SIZE, 1);

    if (decoded_samples < 0) {
        std::string error_msg = "Opus FEC decoding failed: ";
        switch (decoded_samples) {
            case OPUS_BAD_ARG:
                error_msg += "Bad argument provided to decoder";
                break;
            case OPUS_BUFFER_TOO_SMALL:
                error_msg += "Output buffer too small for decoded data";
                break;
            case OPUS_INTERNAL_ERROR:
                error_msg += "Internal decoder error";
                break;
            case OPUS_INVALID_PACKET:
                error_msg += "Invalid or corrupted packet";
                break;
            default:
                error_msg += "Unknown error code (" + std::to_string(decoded_samples) + ")";
        }
        Napi::Error::New(env, error_msg).ThrowAsJavaScriptException();
        return env.Null();
    }

    last_packet_duration_ = decoded_samples;

    return Napi::Buffer<int16_t>::Copy(env, output_buffer_.data(), decoded_samples * channels_);
}

bool DiscordOpusDecoder::ValidateOpusPacket(const unsigned char* data, int length) const {
    if (!data || length < 1 || length > 1275) {  // Opus packet size limits per RFC 6716
        return false;
    }

    // Basic Opus packet validation - check Table of Contents (TOC) byte
    unsigned char toc = data[0];

    // Extract configuration number from TOC
    int config = (toc >> 3) & 0x1F;

    // Validate configuration number (0-31 are valid)
    if (config > 31) {
        return false;
    }

    // Additional validation could be added here for frame count, etc.
    return true;
}

Napi::Value DiscordOpusDecoder::SetGain(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (!initialized_) {
        Napi::Error::New(env, "Decoder not initialized").ThrowAsJavaScriptException();
        return env.Undefined();
    }

    if (info.Length() < 1 || !info[0].IsNumber()) {
        Napi::TypeError::New(env, "Expected gain as number").ThrowAsJavaScriptException();
        return env.Undefined();
    }

    int gain = info[0].As<Napi::Number>().Int32Value();

    // Validate gain range (Q8 format: -32768 to 32767, where 256 = 0dB)
    if (gain < -32768 || gain > 32767) {
        Napi::RangeError::New(env, "Gain must be between -32768 and 32767").ThrowAsJavaScriptException();
        return env.Undefined();
    }

    int result = opus_decoder_ctl(decoder_, OPUS_SET_GAIN(gain));
    if (result != OPUS_OK) {
        Napi::Error::New(env, "Failed to set gain on decoder").ThrowAsJavaScriptException();
    }

    return env.Undefined();
}

Napi::Value DiscordOpusDecoder::Reset(const Napi::CallbackInfo& info) {
    if (initialized_ && decoder_) {
        opus_decoder_ctl(decoder_, OPUS_RESET_STATE);
        last_packet_duration_ = 0;
    }
    return info.Env().Undefined();
}

Napi::Value DiscordOpusDecoder::Destroy(const Napi::CallbackInfo& info) {
    if (decoder_) {
        opus_decoder_destroy(decoder_);
        decoder_ = nullptr;
        initialized_ = false;
        last_packet_duration_ = 0;
    }
    return info.Env().Undefined();
}

// Getter methods for DiscordOpusDecoder
Napi::Value DiscordOpusDecoder::GetGain(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    if (!initialized_) return env.Null();

    opus_int32 gain;
    opus_decoder_ctl(decoder_, OPUS_GET_GAIN(&gain));
    return Napi::Number::New(env, gain);
}

Napi::Value DiscordOpusDecoder::GetSampleRate(const Napi::CallbackInfo& info) {
    return Napi::Number::New(info.Env(), sample_rate_);
}

Napi::Value DiscordOpusDecoder::GetChannels(const Napi::CallbackInfo& info) {
    return Napi::Number::New(info.Env(), channels_);
}

Napi::Value DiscordOpusDecoder::GetLastPacketDuration(const Napi::CallbackInfo& info) {
    return Napi::Number::New(info.Env(), last_packet_duration_);
}

/**
 * Utility function to get Opus library version information
 */
Napi::Value GetOpusVersion(const Napi::CallbackInfo& info) {
    return Napi::String::New(info.Env(), opus_get_version_string());
}

/**
 * Utility function to get supported sample rates for Opus
 */
Napi::Value GetSupportedSampleRates(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    Napi::Array rates = Napi::Array::New(env);

    // Opus supports these sample rates natively
    const int supported[] = {8000, 12000, 16000, 24000, 48000};
    const size_t num_rates = sizeof(supported) / sizeof(supported[0]);

    for (size_t i = 0; i < num_rates; i++) {
        rates.Set(i, Napi::Number::New(env, supported[i]));
    }

    return rates;
}

/**
 * Utility function to validate Opus packet structure
 */
Napi::Value ValidateOpusPacket(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (info.Length() < 1) {
        Napi::TypeError::New(env, "Expected packet buffer").ThrowAsJavaScriptException();
        return env.Null();
    }

    const unsigned char* packet_data;
    int packet_length;

    if (info[0].IsBuffer()) {
        Napi::Buffer<unsigned char> buffer = info[0].As<Napi::Buffer<unsigned char>>();
        packet_data = buffer.Data();
        packet_length = static_cast<int>(buffer.Length());
    } else if (info[0].IsTypedArray()) {
        Napi::TypedArray typed_array = info[0].As<Napi::TypedArray>();
        packet_data = static_cast<const unsigned char*>(typed_array.ArrayBuffer().Data()) + typed_array.ByteOffset();
        packet_length = static_cast<int>(typed_array.ByteLength());
    } else {
        Napi::TypeError::New(env, "Expected Buffer or Uint8Array").ThrowAsJavaScriptException();
        return env.Null();
    }

    if (!packet_data || packet_length < 1 || packet_length > 1275) {
        return Napi::Boolean::New(env, false);
    }

    // Validate TOC byte
    unsigned char toc = packet_data[0];
    int config = (toc >> 3) & 0x1F;

    return Napi::Boolean::New(env, config <= 31);
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
    // Initialize encoder and decoder classes
    DiscordOpusEncoder::Init(env, exports);
    DiscordOpusDecoder::Init(env, exports);

    // Add utility functions
    exports.Set("getOpusVersion", Napi::Function::New(env, GetOpusVersion));
    exports.Set("getSupportedSampleRates", Napi::Function::New(env, GetSupportedSampleRates));
    exports.Set("validateOpusPacket", Napi::Function::New(env, ValidateOpusPacket));

    // Add Discord Voice constants
    exports.Set("DISCORD_SAMPLE_RATE", Napi::Number::New(env, DISCORD_SAMPLE_RATE));
    exports.Set("DISCORD_CHANNELS", Napi::Number::New(env, DISCORD_CHANNELS));
    exports.Set("DISCORD_FRAME_SIZE", Napi::Number::New(env, DISCORD_FRAME_SIZE));
    exports.Set("DISCORD_BITRATE", Napi::Number::New(env, DISCORD_BITRATE));

    // Opus application constants
    exports.Set("OPUS_APPLICATION_VOIP", Napi::Number::New(env, OPUS_APPLICATION_VOIP));
    exports.Set("OPUS_APPLICATION_AUDIO", Napi::Number::New(env, OPUS_APPLICATION_AUDIO));
    exports.Set("OPUS_APPLICATION_RESTRICTED_LOWDELAY", Napi::Number::New(env, OPUS_APPLICATION_RESTRICTED_LOWDELAY));

    // Opus bandwidth constants
    exports.Set("OPUS_BANDWIDTH_NARROWBAND", Napi::Number::New(env, OPUS_BANDWIDTH_NARROWBAND));
    exports.Set("OPUS_BANDWIDTH_MEDIUMBAND", Napi::Number::New(env, OPUS_BANDWIDTH_MEDIUMBAND));
    exports.Set("OPUS_BANDWIDTH_WIDEBAND", Napi::Number::New(env, OPUS_BANDWIDTH_WIDEBAND));
    exports.Set("OPUS_BANDWIDTH_SUPERWIDEBAND", Napi::Number::New(env, OPUS_BANDWIDTH_SUPERWIDEBAND));
    exports.Set("OPUS_BANDWIDTH_FULLBAND", Napi::Number::New(env, OPUS_BANDWIDTH_FULLBAND));

    // Opus signal constants
    exports.Set("OPUS_SIGNAL_VOICE", Napi::Number::New(env, OPUS_SIGNAL_VOICE));
    exports.Set("OPUS_SIGNAL_MUSIC", Napi::Number::New(env, OPUS_SIGNAL_MUSIC));

    return exports;
}

NODE_API_MODULE(opus, Init)