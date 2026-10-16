# Ses seçimi ve doğrulama

Makine: NVIDIA RTX 4060 Laptop 8188 MiB, yaklaşık 7129 MiB boş VRAM; 32 GB RAM, inceleme anında 12 GB civarı boş RAM. Python 3.13.14. nvidia-smi gerçek değerleri kullanıldı; WMI'nin 4 GB raporu dikkate alınmadı.

## Piper — gerçekten çalıştırıldı

Piper 1.8.0 ve ONNXRuntime kuruldu. Resmi rhasspy deposunda Türkçe DFKI medium modeli bulundu; fahrettin/fettah yolları bu snapshot'ta bulunmadı. Model kartı, config ve ağırlık indirildi. Altı Türkçe satır üretildi; gerçek süreleri ölçülüp timeline'a yerleştirildi. İlk satırda küçük atempo uyarlaması yapılır, diğerleri 1.0×. Uzun slotlara sessiz pay bırakılır. Dosyalar films/galileo/assets/voice-*.wav, narration.wav, score.wav ve mix.wav.

Voice medium kalitedir. Teknik kontroller telaffuz, vurgu veya insan düzeyinde doğallığı kanıtlamaz. Bu oturumda sese insan benzeri bir dinleme değerlendirmesi yapılmış gibi raporlamıyoruz. Lisans nedeniyle teslim ticari olmayan kullanım içindir.

## Chatterbox — kaynak ve uygunluk araştırıldı, çıkarım yapılmadı

Resmi kaynak: https://github.com/resemble-ai/chatterbox ; ağırlık kartı: https://huggingface.co/ResembleAI/chatterbox . Türkçe multilingual model destekleniyor ve MIT bildiriliyor. README'de önerilen 3.11 ortamı olsa da incelenen pyproject 3.13 için numpy 2.x ve torch 2.6 bağımlılığını tanımlar; “Python yüzünden imkânsız” denmiyor.

Resmi model dosya listesinde multilingual t3_v3 yaklaşık 2.144 GB, s3gen_v3 yaklaşık 1.056 GB; ek encoder/conditioning/runtime gerekir. 8 GB VRAM tek başına kesin uygunsuzluk kanıtı değildir. Bu teslimde çok GB PyTorch + model kurulumu yerine küçük offline baseline tamamlandı. Chatterbox örneği üretilmedi; Piper ile öznel A/B ses karşılaştırması yapılmadı ve kalite kazananı ilan edilmedi. Bu, kalan bir üretim iyileştirmesidir.

## ACE-Step — kullanılmadı

Resmi repo: https://github.com/ace-step/ACE-Step-1.5 ; proje: https://ace-step.github.io/ACE-Step-1.5/ . MIT ve düşük VRAM modu belirtiliyor. Makinenin çalıştıramayacağına dair ölçüm yapılmadı. 48 saniyelik özgün, düşük yoğunluklu modal müzik programatik üretildi; ağır model eklenmedi.

## Mix

48 kHz stereo, 48 saniye. Anlatım merkezde; alçak drone ve plucked armonikler, düşük room air, zamanlı sayfa sürtünmesi ve release click. Narration sırasında müzik yumuşak duck edilir. Çıkış tepe değeri 0.89 altında hedeflenir, PCM clipping kontrol edilir. AAC kodlaması final renderer'da. Olay listesi görüntü ve ses için aynı production.mjs kaynağından gelir. Video ve ses gerçek süreleri ffprobe ile karşılaştırılır.
