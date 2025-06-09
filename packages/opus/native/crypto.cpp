#include <napi.h>
#include <sodium.h>
#include <vector>
#include <memory>
#include <cstring>
#include <algorithm>

// Discord Voice transport encryption constants - Use defines for MSVC compatibility
#define DISCORD_SECRET_KEY_SIZE 32           // 256-bit secret key
#define AES_GCM_TAG_SIZE 16                  // AES-GCM authentication tag
#define XCHACHA20_POLY1305_TAG_SIZE 16       // XChaCha20-Poly1305 authentication tag
#define NONCE_SIZE 4                         // 32-bit incremental nonce
#define RTP_HEADER_SIZE 12                   // Standard RTP header size
#define MAX_PACKET_SIZE 4096                 // Maximum Discord voice packet size

// For Windows compatibility
#ifdef _WIN32
#include <winsock2.h>
#pragma comment(lib, "ws2_32.lib")
#else
#include <arpa/inet.h>
#endif

/**
 * Supported Discord Voice transport encryption modes
 * These modes provide secure transport encryption between client and Discord servers
 */
enum class EncryptionMode {
    NONE = 0,
    AES256_GCM_RTP_SIZE = 1,           // Preferred: AES-256 GCM with RTP size handling
    XCHACHA20_POLY1305_RTP_SIZE = 2    // Required: XChaCha20-Poly1305 with RTP size handling
};

/**
 * High-performance Discord Voice transport encryption class
 * Provides secure packet encryption/decryption for Discord Voice connections
 * Supports both AES-256-GCM and XChaCha20-Poly1305 AEAD ciphers with RTP size handling
 */
class VoiceTransportCrypto : public Napi::ObjectWrap<VoiceTransportCrypto> {
public:
    static Napi::Object Init(Napi::Env env, Napi::Object exports);
    VoiceTransportCrypto(const Napi::CallbackInfo& info);
    ~VoiceTransportCrypto();

private:
    static Napi::FunctionReference constructor;

    // Core encryption/decryption methods
    Napi::Value Encrypt(const Napi::CallbackInfo& info);
    Napi::Value Decrypt(const Napi::CallbackInfo& info);

    // Configuration methods
    Napi::Value SetSecretKey(const Napi::CallbackInfo& info);
    Napi::Value SetMode(const Napi::CallbackInfo& info);
    Napi::Value SetNonce(const Napi::CallbackInfo& info);

    // Utility methods
    Napi::Value GetNonce(const Napi::CallbackInfo& info);
    Napi::Value IncrementNonce(const Napi::CallbackInfo& info);
    Napi::Value Reset(const Napi::CallbackInfo& info);

    // Getters for current configuration
    Napi::Value GetMode(const Napi::CallbackInfo& info);
    Napi::Value GetSecretKeySize(const Napi::CallbackInfo& info);
    Napi::Value GetTagSize(const Napi::CallbackInfo& info);
    Napi::Value GetNonceSize(const Napi::CallbackInfo& info);

    // Internal state
    EncryptionMode mode_;
    std::vector<unsigned char> secret_key_;
    uint32_t nonce_counter_;
    bool initialized_;
    std::vector<unsigned char> encrypt_buffer_;
    std::vector<unsigned char> decrypt_buffer_;

    // Internal methods
    bool InitializeCrypto();
    bool ValidateSecretKey(const unsigned char* key, size_t key_size) const;
    bool EncryptAES256GCM(const unsigned char* plaintext, size_t plaintext_len,
                          const unsigned char* rtp_header, size_t header_len,
                          unsigned char* ciphertext, size_t* ciphertext_len);
    bool DecryptAES256GCM(const unsigned char* ciphertext, size_t ciphertext_len,
                          const unsigned char* rtp_header, size_t header_len,
                          unsigned char* plaintext, size_t* plaintext_len);
    bool EncryptXChaCha20Poly1305(const unsigned char* plaintext, size_t plaintext_len,
                                  const unsigned char* rtp_header, size_t header_len,
                                  unsigned char* ciphertext, size_t* ciphertext_len);
    bool DecryptXChaCha20Poly1305(const unsigned char* ciphertext, size_t ciphertext_len,
                                  const unsigned char* rtp_header, size_t header_len,
                                  unsigned char* plaintext, size_t* plaintext_len);
    void PrepareNonce(unsigned char* nonce_buffer, size_t buffer_size) const;
    size_t GetCurrentTagSize() const;
    std::string GetModeString() const;

    // Cross-platform byte order functions
    uint32_t HostToNetworkLong(uint32_t value) const;
    uint32_t NetworkToHostLong(uint32_t value) const;
};

// Static member initialization
Napi::FunctionReference VoiceTransportCrypto::constructor;

// Cross-platform byte order conversion implementations
uint32_t VoiceTransportCrypto::HostToNetworkLong(uint32_t value) const {
#ifdef _WIN32
    return htonl(value);
#else
    return htonl(value);
#endif
}

uint32_t VoiceTransportCrypto::NetworkToHostLong(uint32_t value) const {
#ifdef _WIN32
    return ntohl(value);
#else
    return ntohl(value);
#endif
}

Napi::Object VoiceTransportCrypto::Init(Napi::Env env, Napi::Object exports) {
    Napi::HandleScope scope(env);

    Napi::Function func = DefineClass(env, "VoiceTransportCrypto", {
        InstanceMethod("encrypt", &VoiceTransportCrypto::Encrypt),
        InstanceMethod("decrypt", &VoiceTransportCrypto::Decrypt),
        InstanceMethod("setSecretKey", &VoiceTransportCrypto::SetSecretKey),
        InstanceMethod("setMode", &VoiceTransportCrypto::SetMode),
        InstanceMethod("setNonce", &VoiceTransportCrypto::SetNonce),
        InstanceMethod("getNonce", &VoiceTransportCrypto::GetNonce),
        InstanceMethod("incrementNonce", &VoiceTransportCrypto::IncrementNonce),
        InstanceMethod("reset", &VoiceTransportCrypto::Reset),

        InstanceAccessor("mode", &VoiceTransportCrypto::GetMode, nullptr),
        InstanceAccessor("secretKeySize", &VoiceTransportCrypto::GetSecretKeySize, nullptr),
        InstanceAccessor("tagSize", &VoiceTransportCrypto::GetTagSize, nullptr),
        InstanceAccessor("nonceSize", &VoiceTransportCrypto::GetNonceSize, nullptr)
    });

    constructor = Napi::Persistent(func);
    constructor.SuppressDestruct();

    exports.Set("VoiceTransportCrypto", func);
    return exports;
}

VoiceTransportCrypto::VoiceTransportCrypto(const Napi::CallbackInfo& info)
    : Napi::ObjectWrap<VoiceTransportCrypto>(info),
      mode_(EncryptionMode::NONE),
      nonce_counter_(0),
      initialized_(false) {

    Napi::Env env = info.Env();

    // Initialize libsodium if not already done
    if (sodium_init() < 0) {
        Napi::Error::New(env, "Failed to initialize libsodium cryptographic library").ThrowAsJavaScriptException();
        return;
    }

    // Parse options
    if (info.Length() > 0 && info[0].IsObject()) {
        Napi::Object options = info[0].As<Napi::Object>();

        if (options.Has("mode")) {
            std::string mode_str = options.Get("mode").As<Napi::String>().Utf8Value();
            if (mode_str == "aes256_gcm_rtpsize") {
                mode_ = EncryptionMode::AES256_GCM_RTP_SIZE;
            } else if (mode_str == "aead_xchacha20_poly1305_rtpsize") {
                mode_ = EncryptionMode::XCHACHA20_POLY1305_RTP_SIZE;
            } else {
                Napi::Error::New(env, "Unsupported encryption mode: " + mode_str).ThrowAsJavaScriptException();
                return;
            }
        }
    }

    if (!InitializeCrypto()) {
        Napi::Error::New(env, "Failed to initialize transport crypto").ThrowAsJavaScriptException();
        return;
    }
}

VoiceTransportCrypto::~VoiceTransportCrypto() {
    // Clear sensitive data securely
    if (!secret_key_.empty()) {
        sodium_memzero(secret_key_.data(), secret_key_.size());
    }
}

bool VoiceTransportCrypto::InitializeCrypto() {
    secret_key_.resize(DISCORD_SECRET_KEY_SIZE);

    // Pre-allocate buffers for better performance
    encrypt_buffer_.reserve(MAX_PACKET_SIZE);
    decrypt_buffer_.reserve(MAX_PACKET_SIZE);

    initialized_ = true;
    return true;
}

Napi::Value VoiceTransportCrypto::SetSecretKey(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (!initialized_) {
        Napi::Error::New(env, "Crypto not initialized").ThrowAsJavaScriptException();
        return env.Undefined();
    }

    if (info.Length() < 1) {
        Napi::TypeError::New(env, "Expected secret key buffer").ThrowAsJavaScriptException();
        return env.Undefined();
    }

    const unsigned char* key_data;
    size_t key_length;

    if (info[0].IsBuffer()) {
        Napi::Buffer<unsigned char> buffer = info[0].As<Napi::Buffer<unsigned char>>();
        key_data = buffer.Data();
        key_length = buffer.Length();
    } else if (info[0].IsTypedArray()) {
        Napi::TypedArray typed_array = info[0].As<Napi::TypedArray>();
        key_data = static_cast<const unsigned char*>(typed_array.ArrayBuffer().Data()) + typed_array.ByteOffset();
        key_length = typed_array.ByteLength();
    } else {
        Napi::TypeError::New(env, "Expected Buffer or Uint8Array").ThrowAsJavaScriptException();
        return env.Undefined();
    }

    if (!ValidateSecretKey(key_data, key_length)) {
        Napi::Error::New(env, "Invalid secret key: must be exactly 32 bytes").ThrowAsJavaScriptException();
        return env.Undefined();
    }

    // Clear previous key securely
    sodium_memzero(secret_key_.data(), secret_key_.size());

    // Copy new key
    std::memcpy(secret_key_.data(), key_data, DISCORD_SECRET_KEY_SIZE);

    return env.Undefined();
}

bool VoiceTransportCrypto::ValidateSecretKey(const unsigned char* key, size_t key_size) const {
    if (!key || key_size != DISCORD_SECRET_KEY_SIZE) {
        return false;
    }

    // Check that the key is not all zeros (weak key)
    bool all_zeros = true;
    for (size_t i = 0; i < key_size; i++) {
        if (key[i] != 0) {
            all_zeros = false;
            break;
        }
    }

    return !all_zeros;
}

Napi::Value VoiceTransportCrypto::SetMode(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (info.Length() < 1 || !info[0].IsString()) {
        Napi::TypeError::New(env, "Expected mode as string").ThrowAsJavaScriptException();
        return env.Undefined();
    }

    std::string mode_str = info[0].As<Napi::String>().Utf8Value();

    if (mode_str == "aes256_gcm_rtpsize") {
        // Check if AES-256-GCM is available on this platform
        if (!crypto_aead_aes256gcm_is_available()) {
            Napi::Error::New(env, "AES-256-GCM is not available on this platform").ThrowAsJavaScriptException();
            return env.Undefined();
        }
        mode_ = EncryptionMode::AES256_GCM_RTP_SIZE;
    } else if (mode_str == "aead_xchacha20_poly1305_rtpsize") {
        mode_ = EncryptionMode::XCHACHA20_POLY1305_RTP_SIZE;
    } else {
        Napi::Error::New(env, "Unsupported encryption mode: " + mode_str).ThrowAsJavaScriptException();
        return env.Undefined();
    }

    return env.Undefined();
}

Napi::Value VoiceTransportCrypto::SetNonce(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (info.Length() < 1 || !info[0].IsNumber()) {
        Napi::TypeError::New(env, "Expected nonce as number").ThrowAsJavaScriptException();
        return env.Undefined();
    }

    nonce_counter_ = static_cast<uint32_t>(info[0].As<Napi::Number>().Uint32Value());
    return env.Undefined();
}

Napi::Value VoiceTransportCrypto::Encrypt(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (!initialized_) {
        Napi::Error::New(env, "Crypto not initialized").ThrowAsJavaScriptException();
        return env.Null();
    }

    if (mode_ == EncryptionMode::NONE) {
        Napi::Error::New(env, "No encryption mode set").ThrowAsJavaScriptException();
        return env.Null();
    }

    if (info.Length() < 2) {
        Napi::TypeError::New(env, "Expected RTP header and payload buffers").ThrowAsJavaScriptException();
        return env.Null();
    }

    // Get RTP header
    const unsigned char* rtp_header;
    size_t header_length;

    if (info[0].IsBuffer()) {
        Napi::Buffer<unsigned char> buffer = info[0].As<Napi::Buffer<unsigned char>>();
        rtp_header = buffer.Data();
        header_length = buffer.Length();
    } else if (info[0].IsTypedArray()) {
        Napi::TypedArray typed_array = info[0].As<Napi::TypedArray>();
        rtp_header = static_cast<const unsigned char*>(typed_array.ArrayBuffer().Data()) + typed_array.ByteOffset();
        header_length = typed_array.ByteLength();
    } else {
        Napi::TypeError::New(env, "Expected Buffer or Uint8Array for RTP header").ThrowAsJavaScriptException();
        return env.Null();
    }

    // Get payload
    const unsigned char* payload;
    size_t payload_length;

    if (info[1].IsBuffer()) {
        Napi::Buffer<unsigned char> buffer = info[1].As<Napi::Buffer<unsigned char>>();
        payload = buffer.Data();
        payload_length = buffer.Length();
    } else if (info[1].IsTypedArray()) {
        Napi::TypedArray typed_array = info[1].As<Napi::TypedArray>();
        payload = static_cast<const unsigned char*>(typed_array.ArrayBuffer().Data()) + typed_array.ByteOffset();
        payload_length = typed_array.ByteLength();
    } else {
        Napi::TypeError::New(env, "Expected Buffer or Uint8Array for payload").ThrowAsJavaScriptException();
        return env.Null();
    }

    if (header_length < RTP_HEADER_SIZE) {
        Napi::Error::New(env, "RTP header too small").ThrowAsJavaScriptException();
        return env.Null();
    }

    // Prepare output buffer
    size_t max_output_size = payload_length + GetCurrentTagSize() + NONCE_SIZE;
    encrypt_buffer_.resize(max_output_size);

    size_t ciphertext_len = 0;
    bool success = false;

    switch (mode_) {
        case EncryptionMode::AES256_GCM_RTP_SIZE:
            success = EncryptAES256GCM(payload, payload_length, rtp_header, header_length,
                                       encrypt_buffer_.data(), &ciphertext_len);
            break;
        case EncryptionMode::XCHACHA20_POLY1305_RTP_SIZE:
            success = EncryptXChaCha20Poly1305(payload, payload_length, rtp_header, header_length,
                                               encrypt_buffer_.data(), &ciphertext_len);
            break;
        default:
            Napi::Error::New(env, "Invalid encryption mode").ThrowAsJavaScriptException();
            return env.Null();
    }

    if (!success) {
        Napi::Error::New(env, "Encryption operation failed").ThrowAsJavaScriptException();
        return env.Null();
    }

    // Increment nonce for next packet
    nonce_counter_++;

    return Napi::Buffer<unsigned char>::Copy(env, encrypt_buffer_.data(), ciphertext_len);
}

bool VoiceTransportCrypto::EncryptAES256GCM(const unsigned char* plaintext, size_t plaintext_len,
                                            const unsigned char* rtp_header, size_t header_len,
                                            unsigned char* ciphertext, size_t* ciphertext_len) {

    // Prepare 12-byte nonce for AES-GCM (8 bytes zeros + 4 bytes nonce)
    unsigned char nonce[12];
    std::memset(nonce, 0, 8);
    uint32_t nonce_be = HostToNetworkLong(nonce_counter_);
    std::memcpy(nonce + 8, &nonce_be, 4);

    unsigned long long ciphertext_len_ll;

    int result = crypto_aead_aes256gcm_encrypt(
        ciphertext,                    // Ciphertext output
        &ciphertext_len_ll,            // Ciphertext length
        plaintext,                     // Plaintext input
        plaintext_len,                 // Plaintext length
        rtp_header,                    // Additional data (RTP header)
        header_len,                    // Additional data length
        nullptr,                       // Secret nonce (not used)
        nonce,                         // Public nonce
        secret_key_.data()             // Secret key
    );

    if (result != 0) {
        return false;
    }

    // Append nonce to ciphertext for Discord protocol
    std::memcpy(ciphertext + ciphertext_len_ll, &nonce_be, NONCE_SIZE);
    *ciphertext_len = ciphertext_len_ll + NONCE_SIZE;

    return true;
}

bool VoiceTransportCrypto::EncryptXChaCha20Poly1305(const unsigned char* plaintext, size_t plaintext_len,
                                                    const unsigned char* rtp_header, size_t header_len,
                                                    unsigned char* ciphertext, size_t* ciphertext_len) {

    // Prepare 24-byte nonce for XChaCha20-Poly1305 (20 bytes zeros + 4 bytes nonce)
    unsigned char nonce[24];
    std::memset(nonce, 0, 20);
    uint32_t nonce_be = HostToNetworkLong(nonce_counter_);
    std::memcpy(nonce + 20, &nonce_be, 4);

    unsigned long long ciphertext_len_ll;

    int result = crypto_aead_xchacha20poly1305_ietf_encrypt(
        ciphertext,                    // Ciphertext output
        &ciphertext_len_ll,            // Ciphertext length
        plaintext,                     // Plaintext input
        plaintext_len,                 // Plaintext length
        rtp_header,                    // Additional data (RTP header)
        header_len,                    // Additional data length
        nullptr,                       // Secret nonce (not used)
        nonce,                         // Public nonce
        secret_key_.data()             // Secret key
    );

    if (result != 0) {
        return false;
    }

    // Append nonce to ciphertext for Discord protocol
    std::memcpy(ciphertext + ciphertext_len_ll, &nonce_be, NONCE_SIZE);
    *ciphertext_len = ciphertext_len_ll + NONCE_SIZE;

    return true;
}

Napi::Value VoiceTransportCrypto::Decrypt(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (!initialized_) {
        Napi::Error::New(env, "Crypto not initialized").ThrowAsJavaScriptException();
        return env.Null();
    }

    if (mode_ == EncryptionMode::NONE) {
        Napi::Error::New(env, "No encryption mode set").ThrowAsJavaScriptException();
        return env.Null();
    }

    if (info.Length() < 2) {
        Napi::TypeError::New(env, "Expected RTP header and encrypted payload buffers").ThrowAsJavaScriptException();
        return env.Null();
    }

    // Get RTP header
    const unsigned char* rtp_header;
    size_t header_length;

    if (info[0].IsBuffer()) {
        Napi::Buffer<unsigned char> buffer = info[0].As<Napi::Buffer<unsigned char>>();
        rtp_header = buffer.Data();
        header_length = buffer.Length();
    } else if (info[0].IsTypedArray()) {
        Napi::TypedArray typed_array = info[0].As<Napi::TypedArray>();
        rtp_header = static_cast<const unsigned char*>(typed_array.ArrayBuffer().Data()) + typed_array.ByteOffset();
        header_length = typed_array.ByteLength();
    } else {
        Napi::TypeError::New(env, "Expected Buffer or Uint8Array for RTP header").ThrowAsJavaScriptException();
        return env.Null();
    }

    // Get encrypted payload
    const unsigned char* ciphertext;
    size_t ciphertext_length;

    if (info[1].IsBuffer()) {
        Napi::Buffer<unsigned char> buffer = info[1].As<Napi::Buffer<unsigned char>>();
        ciphertext = buffer.Data();
        ciphertext_length = buffer.Length();
    } else if (info[1].IsTypedArray()) {
        Napi::TypedArray typed_array = info[1].As<Napi::TypedArray>();
        ciphertext = static_cast<const unsigned char*>(typed_array.ArrayBuffer().Data()) + typed_array.ByteOffset();
        ciphertext_length = typed_array.ByteLength();
    } else {
        Napi::TypeError::New(env, "Expected Buffer or Uint8Array for ciphertext").ThrowAsJavaScriptException();
        return env.Null();
    }

    if (header_length < RTP_HEADER_SIZE) {
        Napi::Error::New(env, "RTP header too small").ThrowAsJavaScriptException();
        return env.Null();
    }

    size_t min_ciphertext_size = GetCurrentTagSize() + NONCE_SIZE;
    if (ciphertext_length < min_ciphertext_size) {
        Napi::Error::New(env, "Ciphertext too small").ThrowAsJavaScriptException();
        return env.Null();
    }

    // Prepare output buffer
    decrypt_buffer_.resize(ciphertext_length);

    size_t plaintext_len = 0;
    bool success = false;

    switch (mode_) {
        case EncryptionMode::AES256_GCM_RTP_SIZE:
            success = DecryptAES256GCM(ciphertext, ciphertext_length, rtp_header, header_length,
                                       decrypt_buffer_.data(), &plaintext_len);
            break;
        case EncryptionMode::XCHACHA20_POLY1305_RTP_SIZE:
            success = DecryptXChaCha20Poly1305(ciphertext, ciphertext_length, rtp_header, header_length,
                                               decrypt_buffer_.data(), &plaintext_len);
            break;
        default:
            Napi::Error::New(env, "Invalid encryption mode").ThrowAsJavaScriptException();
            return env.Null();
    }

    if (!success) {
        Napi::Error::New(env, "Decryption operation failed").ThrowAsJavaScriptException();
        return env.Null();
    }

    return Napi::Buffer<unsigned char>::Copy(env, decrypt_buffer_.data(), plaintext_len);
}

bool VoiceTransportCrypto::DecryptAES256GCM(const unsigned char* ciphertext, size_t ciphertext_len,
                                            const unsigned char* rtp_header, size_t header_len,
                                            unsigned char* plaintext, size_t* plaintext_len) {

    // Extract nonce from end of ciphertext
    if (ciphertext_len < NONCE_SIZE + AES_GCM_TAG_SIZE) {
        return false;
    }

    uint32_t nonce_be;
    std::memcpy(&nonce_be, ciphertext + ciphertext_len - NONCE_SIZE, NONCE_SIZE);

    // Prepare 12-byte nonce for AES-GCM
    unsigned char nonce[12];
    std::memset(nonce, 0, 8);
    std::memcpy(nonce + 8, &nonce_be, 4);

    // Actual ciphertext length (without nonce)
    size_t actual_ciphertext_len = ciphertext_len - NONCE_SIZE;

    unsigned long long plaintext_len_ll;

    int result = crypto_aead_aes256gcm_decrypt(
        plaintext,                     // Plaintext output
        &plaintext_len_ll,             // Plaintext length
        nullptr,                       // Secret nonce (not used)
        ciphertext,                    // Ciphertext input
        actual_ciphertext_len,         // Ciphertext length
        rtp_header,                    // Additional data (RTP header)
        header_len,                    // Additional data length
        nonce,                         // Public nonce
        secret_key_.data()             // Secret key
    );

    if (result != 0) {
        return false;
    }

    *plaintext_len = plaintext_len_ll;
    return true;
}

bool VoiceTransportCrypto::DecryptXChaCha20Poly1305(const unsigned char* ciphertext, size_t ciphertext_len,
                                                    const unsigned char* rtp_header, size_t header_len,
                                                    unsigned char* plaintext, size_t* plaintext_len) {

    // Extract nonce from end of ciphertext
    if (ciphertext_len < NONCE_SIZE + XCHACHA20_POLY1305_TAG_SIZE) {
        return false;
    }

    uint32_t nonce_be;
    std::memcpy(&nonce_be, ciphertext + ciphertext_len - NONCE_SIZE, NONCE_SIZE);

    // Prepare 24-byte nonce for XChaCha20-Poly1305
    unsigned char nonce[24];
    std::memset(nonce, 0, 20);
    std::memcpy(nonce + 20, &nonce_be, 4);

    // Actual ciphertext length (without nonce)
    size_t actual_ciphertext_len = ciphertext_len - NONCE_SIZE;

    unsigned long long plaintext_len_ll;

    int result = crypto_aead_xchacha20poly1305_ietf_decrypt(
        plaintext,                     // Plaintext output
        &plaintext_len_ll,             // Plaintext length
        nullptr,                       // Secret nonce (not used)
        ciphertext,                    // Ciphertext input
        actual_ciphertext_len,         // Ciphertext length
        rtp_header,                    // Additional data (RTP header)
        header_len,                    // Additional data length
        nonce,                         // Public nonce
        secret_key_.data()             // Secret key
    );

    if (result != 0) {
        return false;
    }

    *plaintext_len = plaintext_len_ll;
    return true;
}

size_t VoiceTransportCrypto::GetCurrentTagSize() const {
    switch (mode_) {
        case EncryptionMode::AES256_GCM_RTP_SIZE:
            return AES_GCM_TAG_SIZE;
        case EncryptionMode::XCHACHA20_POLY1305_RTP_SIZE:
            return XCHACHA20_POLY1305_TAG_SIZE;
        default:
            return 0;
    }
}

std::string VoiceTransportCrypto::GetModeString() const {
    switch (mode_) {
        case EncryptionMode::AES256_GCM_RTP_SIZE:
            return "aes256_gcm_rtpsize";
        case EncryptionMode::XCHACHA20_POLY1305_RTP_SIZE:
            return "aead_xchacha20_poly1305_rtpsize";
        default:
            return "none";
    }
}

Napi::Value VoiceTransportCrypto::GetMode(const Napi::CallbackInfo& info) {
    return Napi::String::New(info.Env(), GetModeString());
}

Napi::Value VoiceTransportCrypto::GetSecretKeySize(const Napi::CallbackInfo& info) {
    return Napi::Number::New(info.Env(), DISCORD_SECRET_KEY_SIZE);
}

Napi::Value VoiceTransportCrypto::GetTagSize(const Napi::CallbackInfo& info) {
    return Napi::Number::New(info.Env(), GetCurrentTagSize());
}

Napi::Value VoiceTransportCrypto::GetNonceSize(const Napi::CallbackInfo& info) {
    return Napi::Number::New(info.Env(), NONCE_SIZE);
}

Napi::Value VoiceTransportCrypto::GetNonce(const Napi::CallbackInfo& info) {
    return Napi::Number::New(info.Env(), nonce_counter_);
}

Napi::Value VoiceTransportCrypto::IncrementNonce(const Napi::CallbackInfo& info) {
    nonce_counter_++;
    return Napi::Number::New(info.Env(), nonce_counter_);
}

Napi::Value VoiceTransportCrypto::Reset(const Napi::CallbackInfo& info) {
    nonce_counter_ = 0;
    return info.Env().Undefined();
}

/**
 * Utility function to check if AES-256-GCM is available on the current platform
 */
Napi::Value IsAES256GCMAvailable(const Napi::CallbackInfo& info) {
    return Napi::Boolean::New(info.Env(), crypto_aead_aes256gcm_is_available());
}

/**
 * Utility function to get libsodium version information
 */
Napi::Value GetSodiumVersion(const Napi::CallbackInfo& info) {
    return Napi::String::New(info.Env(), sodium_version_string());
}

/**
 * Utility function to get supported encryption modes for the current platform
 */
Napi::Value GetSupportedModes(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    Napi::Array modes = Napi::Array::New(env);

    int index = 0;

    // XChaCha20-Poly1305 is always available with libsodium
    modes.Set(index++, Napi::String::New(env, "aead_xchacha20_poly1305_rtpsize"));

    // AES-256-GCM availability depends on hardware support
    if (crypto_aead_aes256gcm_is_available()) {
        modes.Set(index++, Napi::String::New(env, "aes256_gcm_rtpsize"));
    }

    return modes;
}

/**
 * Utility function to generate a random secret key
 */
Napi::Value GenerateSecretKey(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    // Generate a cryptographically secure random key
    auto key = Napi::Buffer<unsigned char>::New(env, DISCORD_SECRET_KEY_SIZE);
    randombytes_buf(key.Data(), DISCORD_SECRET_KEY_SIZE);

    return key;
}

/**
 * Utility function to validate encryption mode string
 */
Napi::Value ValidateMode(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (info.Length() < 1 || !info[0].IsString()) {
        return Napi::Boolean::New(env, false);
    }

    std::string mode_str = info[0].As<Napi::String>().Utf8Value();

    if (mode_str == "aes256_gcm_rtpsize") {
        return Napi::Boolean::New(env, crypto_aead_aes256gcm_is_available());
    } else if (mode_str == "aead_xchacha20_poly1305_rtpsize") {
        return Napi::Boolean::New(env, true);
    }

    return Napi::Boolean::New(env, false);
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
    // Initialize libsodium
    if (sodium_init() < 0) {
        Napi::Error::New(env, "Failed to initialize libsodium").ThrowAsJavaScriptException();
        return exports;
    }

    // Initialize class
    VoiceTransportCrypto::Init(env, exports);

    // Add utility functions
    exports.Set("isAES256GCMAvailable", Napi::Function::New(env, IsAES256GCMAvailable));
    exports.Set("getSodiumVersion", Napi::Function::New(env, GetSodiumVersion));
    exports.Set("getSupportedModes", Napi::Function::New(env, GetSupportedModes));
    exports.Set("generateSecretKey", Napi::Function::New(env, GenerateSecretKey));
    exports.Set("validateMode", Napi::Function::New(env, ValidateMode));

    // Add constants
    exports.Set("SECRET_KEY_SIZE", Napi::Number::New(env, DISCORD_SECRET_KEY_SIZE));
    exports.Set("AES_GCM_TAG_SIZE", Napi::Number::New(env, AES_GCM_TAG_SIZE));
    exports.Set("XCHACHA20_POLY1305_TAG_SIZE", Napi::Number::New(env, XCHACHA20_POLY1305_TAG_SIZE));
    exports.Set("NONCE_SIZE", Napi::Number::New(env, NONCE_SIZE));
    exports.Set("RTP_HEADER_SIZE", Napi::Number::New(env, RTP_HEADER_SIZE));

    // Add mode constants
    exports.Set("MODE_AES256_GCM_RTPSIZE", Napi::String::New(env, "aes256_gcm_rtpsize"));
    exports.Set("MODE_XCHACHA20_POLY1305_RTPSIZE", Napi::String::New(env, "aead_xchacha20_poly1305_rtpsize"));

    return exports;
}

NODE_API_MODULE(crypto, Init)