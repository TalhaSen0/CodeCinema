---
language:
  - tr
license: other
license_name: cc-by-4.0-and-cc-by-sa-4.0
license_link: LICENSE.md
pretty_name: Alania Turkish Synthetic Speech
size_categories:
  - 1M<n<10M
task_categories:
  - text-to-speech
  - automatic-speech-recognition
tags:
  - turkish
  - tts
  - speech
  - synthetic
  - ai-generated
  - voice-design
  - instruction-tts
configs:
  - config_name: cc-by
    data_files: data/cc-by/*.parquet
    default: true
  - config_name: cc-by-sa
    data_files: data/cc-by-sa/*.parquet
  - config_name: voices
    data_files: voices/voices.parquet
---

# Alania Turkish Synthetic Speech

**English** · [Türkçe](#türkçe)

**3,411 hours** of 48 kHz Turkish speech in 2,037,461 clips, spoken by 2,752 designed voices plus
one-off voices, each clip paired with the written sentence, its spoken form and a plain-English description of the
voice. Every clip is **AI-generated**: no real person's voice is in this dataset.

We made it while building Alania-2, the Turkish text-to-speech model behind
[speech.patientdesk.ai](https://speech.patientdesk.ai). Openly licensed Turkish speech for TTS is scarce: the largest
sets are a few hundred hours of read or crowd-sourced audio (Common Voice Turkish has about 130 validated hours). We are releasing the part of our synthetic corpus that
carries no one else's voice or rights, so others building Turkish voice technology can use it.

## What is in it

| Config | Text | Licence | Clips | Hours |
|---|---|---|---:|---:|
| `cc-by` (default) | our voice-agent sentences ([Alania Turkish Domain Text](https://huggingface.co/datasets/cloud0day3/alania-domain-text-tr)) and FineWeb-2 Turkish | CC BY 4.0 | 1,660,381 | 2,565 |
| `cc-by-sa` | Turkish Wikipedia | CC BY-SA 4.0 | 377,080 | 846 |
| `voices` | reference clip, transcript and description of each designed voice | CC BY 4.0 | 2,752 voices | |

- **Voices.** 2,752 designed identities, each created from a written description with VoxCPM2's voice design
  and kept stable across its clips through a reference clip, plus one-off voices designed for a single clip.
  Roughly balanced by hours: 53.5% female, 46.5% male. Ages, pitch, pace and recording character vary with the descriptions.
- **Three ways of speaking:** `reference` (the designed voice reading plainly), `reference+instruction` (the same
  voice following a style instruction such as *"Speak like a calm, reassuring nurse, slowly and softly"*), and
  `voice-design` (a new voice made from the description alone).
- **Text** covers everyday service language (appointments, banking, cargo, support), numbers, dates, times, money,
  phone numbers, addresses and names, plus general web and encyclopedia prose. `text` is the sentence as written;
  `text_spoken` is what was read, after our Turkish normaliser wrote numbers and abbreviations out as spoken.
- **Recording conditions.** About 45% of clips also have `audio_channel`: the same clip passed through a
  simulated room, microphone (headset, lapel, laptop or phone), background noise and level drift, with a caption of
  those conditions in English and Turkish. `audio` is always the clean version.

## Quality control

Every clip passed automatic checks; failing clips were removed:

- intelligibility: Whisper large-v3 (turbo) transcript against the text, character error rate at most 5% or one edit
  (`qc_cer`);
- naturalness: UTMOS22 at least 2.5 (`qc_utmos`); voice consistency: ECAPA similarity to the voice's reference
  (`qc_speaker_sim`); gender of designed voices checked against their pitch (`qc_f0_median`);
- no runaways or truncations: speaking rate between 7 and 25 characters per second;
- a post-filter (`postfilter: resclip`) that removes a faint high-frequency "whistle" the generator adds in the
  7–12 kHz band.

Medians over the release: CER 0.0, UTMOS 3.59.

## Loading

```python
from datasets import load_dataset
ds = load_dataset("cloud0day3/alania-synthetic-speech-tr", "cc-by", split="train", streaming=True)
row = next(iter(ds))
print(row["text"], row["voice_description"], row["audio"]["sampling_rate"])
```

## Licence and attribution

- `cc-by` and `voices`: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). The FineWeb-2 text is used under
  ODC-By 1.0 and remains subject to Common Crawl's terms of use; `text_doc_id` keeps its source id.
- `cc-by-sa`: [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/), because it reads Turkish Wikipedia.
  `text_source_url` links every clip to its article; derivatives must keep the same licence.

You may use it for any purpose, including commercial use and training models, **as long as you credit PatientDesk AI**:

> Alania Turkish Synthetic Speech by PatientDesk AI (https://huggingface.co/datasets/cloud0day3/alania-synthetic-speech-tr), licensed under CC BY 4.0 / CC BY-SA 4.0.

```bibtex
@misc{patientdesk2026alaniasyntheticspeech,
  title        = {Alania Turkish Synthetic Speech},
  author       = {{PatientDesk AI}},
  year         = {2026},
  howpublished = {\url{https://huggingface.co/datasets/cloud0day3/alania-synthetic-speech-tr}},
  note         = {3,411 h of AI-generated Turkish speech, CC BY 4.0 / CC BY-SA 4.0}
}
```

## How it was made

- **Generator:** [openbmb/VoxCPM2](https://huggingface.co/openbmb/VoxCPM2) (Apache-2.0) at revision 32279eff,
  served with Nano-vLLM-VoxCPM, 10 diffusion steps, classifier-free guidance 2.0, September 2026. Generation settings
  and seeds are in every row.
- **Voices:** written descriptions sampled over gender, age, pitch, timbre, pace, manner and recording character,
  rendered with VoxCPM2 voice design; similar voices were de-duplicated by speaker embedding.
- **Loudness:** edge silence trimmed to 0.1 s, active speech normalised to -20 dBFS, peaks at most -1 dBFS.

## Changelog

- **v1.3 (4 October 2026):** the clips removed in v1.2 were re-rendered with the corrected reading (same voice, mode
  and seed); the 69,442 that passed full QC (163 hours) are back. The 14,349 whose re-render failed QC stay out and
  are listed in [`known_issues/removed_v1.3.csv.gz`](known_issues/removed_v1.3.csv.gz).
- **v1.2 (4 October 2026):** every clip now says what `text_spoken` says under our v1.2 normaliser. A native-speaker
  review corrected our initialism readings: plain Turkish letter names joined into one word, with K as "ka" and H as
  "he" ("SGK" → "segeka", "TBMM" → "tebememe", "KDV" → "kadeve"; v1.0 used formal spaced letter names, and the
  "es-ge-ka" style we announced as the fix was also wrong). Amounts, decimals, lone letters, units and abbreviations
  were corrected too (see [Alania Turkish Domain Text](https://huggingface.co/datasets/cloud0day3/alania-domain-text-tr)
  v1.2). 95,850 clips (237 hours) were replaced by re-renders that say the corrected reading; 83,791 clips (196 hours)
  without one were removed; v1.3 re-rendered them.
  The v1.0 list of affected clips is gone, since none of them remain in their old form. v1.0 stays available at the
  `v1.0` tag. Thanks to the community feedback that started this.

## Limitations and responsible use

- **This is synthetic speech.** It inherits VoxCPM2's accent, prosody and artefacts, and it is cleaner and more
  uniform than real recordings. For ASR or TTS, mix it with real speech rather than training on it alone.
- Automatic QC is not listening: some clips still misread a word, stress it oddly or sound flat.
- Do not use it to imitate real people or to pass generated speech off as human. Label audio made with models
  trained on it as AI-generated where the law requires (for example the EU AI Act).
- Sentences from the web and Wikipedia may contain errors or dated statements; the voice-agent sentences are
  invented, and any match with a real person, phone number or account is coincidental.

---

# Türkçe

[English](#alania-turkish-synthetic-speech) · **Türkçe**

2.752 tasarlanmış ses ve tek seferlik seslerle okunmuş, 48 kHz, **3.411 saatlik** (2.037.461 kayıt)
Türkçe konuşma. Her kayıtta yazılı cümle, okunduğu hâli ve sesin sade bir İngilizce tarifi bulunur. Kayıtların
**tamamı yapay zekâ ile üretilmiştir**: veri setinde hiçbir gerçek kişinin sesi yoktur.

Bu veri setini, [speech.patientdesk.ai](https://speech.patientdesk.ai) arkasındaki Türkçe metinden sese modelimiz
Alania-2'yi geliştirirken hazırladık. Açık lisanslı Türkçe TTS verisi çok az; en büyük setler birkaç yüz saatlik okuma
ya da gönüllü kayıtlardan oluşuyor. Sentetik derlemimizin kimsenin sesini ya da hakkını taşımayan kısmını, Türkçe ses
teknolojisi geliştiren herkes kullanabilsin diye yayımlıyoruz.

## İçerik

| Yapılandırma | Metin | Lisans | Kayıt | Saat |
|---|---|---|---:|---:|
| `cc-by` (varsayılan) | sesli asistan cümlelerimiz ve FineWeb-2 Türkçe | CC BY 4.0 | 1.660.381 | 2.565 |
| `cc-by-sa` | Türkçe Vikipedi | CC BY-SA 4.0 | 377.080 | 846 |
| `voices` | her tasarlanmış sesin referans kaydı, metni ve tarifi | CC BY 4.0 | 2.752 ses | |

- **Sesler:** yazılı tariflerden VoxCPM2 ile tasarlanmış ve referans kayıtla sabit tutulmuş 2.752 ses kimliği ile
  tek kayıtlık tasarlanmış sesler. Saat bazında yaklaşık dengeli: %53,5 kadın, %46,5 erkek.
- **Üç okuma biçimi:** `reference` (tasarlanmış sesin düz okuması), `reference+instruction` (aynı sesin
  *"Sakin, güven veren bir hemşire gibi, yavaş ve yumuşak konuş"* gibi bir üslup yönergesine uyması) ve `voice-design`
  (yalnızca tariften yeni bir ses).
- **Metin:** randevu, bankacılık, kargo ve destek gibi gündelik hizmet dili; sayılar, tarihler, saatler, tutarlar,
  telefon numaraları, adresler ve isimler; ayrıca genel web ve ansiklopedi metinleri. `text` yazıldığı hâli,
  `text_spoken` Türkçe normalleştiricimizin sayı ve kısaltmaları söylendiği gibi yazdığı, okunan hâlidir.
- **Kayıt koşulları:** kayıtların yaklaşık %45'inde `audio_channel` da vardır: aynı kaydın benzetilmiş
  bir oda, mikrofon (kulaklık, yaka, dizüstü ya da telefon), arka plan gürültüsü ve seviye dalgalanmasından geçmiş
  hâli ve bu koşulların İngilizce ve Türkçe açıklaması. `audio` her zaman temiz sürümdür.

## Kalite kontrolü

Her kayıt otomatik denetimlerden geçti; geçemeyenler çıkarıldı: Whisper large-v3 (turbo) ile karakter hata oranı en
fazla %5 ya da tek düzeltme, UTMOS22 en az 2,5, referans sese ECAPA benzerliği, tasarlanmış seslerde perdeyle cinsiyet
denetimi, saniyede 7–25 karakter konuşma hızı ve üreticinin 7–12 kHz bandında eklediği hafif "ıslık" sesini gideren bir
son filtre. Ortancalar: CER 0,0, UTMOS 3,59.

## Lisans ve atıf

`cc-by` ve `voices` [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.tr), `cc-by-sa` ise Türkçe Vikipedi'yi
okuduğu için [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.tr) lisanslıdır; `text_source_url` her
kaydı maddesine bağlar. FineWeb-2 metni ODC-By 1.0 ile kullanılmıştır ve Common Crawl kullanım koşullarına tabidir.
Ticari kullanım ve model eğitimi dahil her amaçla kullanabilirsiniz; **yeter ki PatientDesk AI'a atıf yapın**:

> Alania Turkish Synthetic Speech, PatientDesk AI (https://huggingface.co/datasets/cloud0day3/alania-synthetic-speech-tr), CC BY 4.0 / CC BY-SA 4.0 lisansıyla.

## Nasıl üretildi

Üretici model [openbmb/VoxCPM2](https://huggingface.co/openbmb/VoxCPM2) (Apache-2.0), 32279eff sürümü, Nano-vLLM-VoxCPM
ile, 10 difüzyon adımı ve 2,0 yönlendirme katsayısıyla, Eylül 2026. Üretim ayarları ve tohum değerleri her satırda
yer alır. Kenar sessizlikleri 0,1 saniyeye kırpıldı, konuşma -20 dBFS'e, tepe seviyesi en fazla -1 dBFS'e ayarlandı.

## Değişiklikler

- **v1.3 (4 Ekim 2026):** v1.2'de çıkarılan kayıtlar doğru okunuşla (aynı ses, mod ve tohumla) yeniden üretildi; tam
  kalite kontrolünden geçen 69.442 kayıt (163 saat) geri eklendi. Yeniden üretimi kontrolden geçemeyen 14.349 kayıt
  dışarıda kalıyor ve [`known_issues/removed_v1.3.csv.gz`](known_issues/removed_v1.3.csv.gz) dosyasında listeleniyor.
- **v1.2 (4 Ekim 2026):** artık her kayıt, `text_spoken` sütununda v1.2 normalleştiricimizle yazılan hâli söylüyor.
  Anadili Türkçe olan birinin kontrolüyle kısaltma okunuşlarımız düzeltildi: harflerin düz Türkçe adları tek kelime
  olarak, K "ka" ve H "he" ("SGK" → "segeka", "TBMM" → "tebememe", "KDV" → "kadeve"; v1.0 harf adlarını ayrı ayrı
  okuyordu, düzeltme diye duyurduğumuz "es-ge-ka" biçimi de yanlıştı). Tutarlar, ondalıklar, tek harfler, birimler ve
  kısaltmalar da düzeltildi (ayrıntılar [Alania Turkish Domain Text](https://huggingface.co/datasets/cloud0day3/alania-domain-text-tr)
  v1.2'de). 95.850 kayıt (237 saat) doğru okunuşu söyleyen yeniden üretilmiş sürümleriyle değiştirildi; yeniden
  üretilmiş sürümü olmayan 83.791 kayıt (196 saat) çıkarıldı; v1.3'te yeniden üretildiler. v1.0'daki etkilenen kayıtlar listesi kaldırıldı, çünkü o kayıtların hiçbiri eski
  hâliyle kalmadı. v1.0, `v1.0` etiketinde duruyor. Bu düzeltmeyi başlatan topluluk geri bildirimine teşekkürler.

## Sınırlamalar ve sorumlu kullanım

- **Bu sentetik konuşmadır.** VoxCPM2'nin aksanını, tonlamasını ve kusurlarını taşır; gerçek kayıtlardan daha temiz ve
  tekdüzedir. ASR ya da TTS için tek başına değil, gerçek konuşmayla karıştırarak kullanın.
- Otomatik denetim dinlemenin yerini tutmaz: bazı kayıtlarda yanlış okunan ya da tuhaf vurgulanan kelimeler kalabilir.
- Gerçek kişileri taklit etmek ya da üretilmiş sesi insan sesi gibi sunmak için kullanmayın. Bu veriyle eğitilen
  modellerin ürettiği sesleri, yasaların gerektirdiği yerlerde (örneğin AB Yapay Zekâ Yasası) yapay olarak etiketleyin.

İletişim: sezgin@patientdesk.ai
