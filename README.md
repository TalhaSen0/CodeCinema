# CodeCinema

Fikirden kodla çizilmiş 2D kısa filme uzanan, Codex oturumunda yönetilen yerel üretim hattı. İlk yapım **Galileo ve En Hızlı Yol**, 48 saniye. Gerçek MP4, Türkçe anlatım, özgün sentez müziği, sayfa sesleri, deterministik karakter rig'i ve sayısal fizik içerir.

## İzle ve incele

16 Ekim geçiş revizyonu tamamlandı. Yeni final: `renders/galileo-final-v2.mp4` (`galileo-final.mp4` ile aynı). Eski sürüm: `renders/galileo-before-pages.mp4`. Yan yana karşılaştırma: `renders/galileo-before-after.mp4`. Uygulama ve gerçek test kanıtları: `docs/page-surface-implementation.md`, `review/revision/`. Önceki `review/quality-report.md` baseline üretim tarihçesidir.

- `renders/galileo-final-v2.mp4`: 1920×1080, 30 FPS, H.264/AAC Galileo finali (48s).
- `renders/salincagin-sirri/2026-10-16-v1/final.mp4`: 1920×1080, 30 FPS, kilitli tok erkek anlatıcı (Chatterbox + Alania d1-02552) ve özgün müzikli sarkaç filmi (32s).
- `renders/salincagin-sirri/2026-10-16-v1/preview-music.mp4`: aynı sarkaç filminin anlatıcısız, özgün müzik ve altyazı versiyonu.
- `renders/galileo-music-only.mp4`: 1080p Galileo görüntüsü, özgün müzik/efekt ve altyazı; Piper anlatımı içermez.
- `renders/comparison/a.mp4` ve `b.mp4`: 10 saniyelik saf kod / resim katmanı denemeleri.
- `review/final/contact-sheet.jpg`, `review/encoded/`: kare ve hareket inceleme kanıtları.
- `renders/salincagin-sirri/2026-10-16-v1/review/`: Salıncağın Sırrı doğrulama ve inceleme kareleri.
- `review/quality-report.md`, `review/verification.json`: gerçek bulgular ve ölçümler.

## Windows kurulumu

Node 22+, Python 3.13 ve internet ilk kurulumda gerekir. Yönetici yetkisi gerekmez. Bu makinede Node/Python zaten vardı.

```powershell
npm install --ignore-scripts
python -m pip install -r requirements.txt
npm run setup
npm run audio
npm run dev
```

`dev` yerel önizleme adresini terminale yazar. Oynat/duraklat ve zaman sürgüsü vardır. Setup Chromium'u indirir, Python imageio-ffmpeg paketindeki FFmpeg'i ve npm ffprobe-static içindeki FFprobe'u `.tools/` altına kopyalar; sistem PATH'ini değiştirmez. İncelenmiş, depoya dahil edilmiş Opus kaynaklarından Windows adaptasyonlarını üretir.

```powershell
npm run compare
npm run render:draft
npm run review:frames
npm run review:transitions
npm run verify:surfaces
npm run render:final
npm run verify
```

Render, gerçek zamanlı ekran kaydı yapmaz: `seek(i/30)` ile her kare hesaplanır. FFmpeg'e sıralı ham pikseller gönderilir. `node tools/sequence.mjs --from 4.7 --to 6 --fps 30 --out renders/frames/page` ile kayıpsız PNG kare dizisi de alınabilir.

Ses komutu, metni değişmeyen mevcut satır WAV'larını korur; böylece tekrar render'da rastgele TTS farkı oluşmaz. Sesi yeniden örneklemek için `python tools/audio.py --regenerate` kullanın ve ardından videoyu tekrar render edin. Animasyonun determinism sözleşmesi ses modelinin yeni çıkarımları için bir garanti değildir.

## Yeni film

`briefs/my-film.md` içine bir konu yaz:

```powershell
npm run new -- --brief briefs/my-film.md --id my-film
```

Sonra Codex'e **“films/my-film içindeki brief'ten filmi üret”** demek yeterli. CLI brief'i, aşama durumunu ve oturum talimatını hazırlar. Araştırma, senaryo ve yeni çizim kodu Codex oturumunda üretilir; CLI kendi başına herhangi bir konuyu anlayan yerel AI modeli içermez. Render motoru yeniden yazılmaz. Genel render girişi: `node tools/render.mjs final --film my-film` (film index.html ve assets/mix.wav sözleşmesini sağlamalıdır).

## Üretim sınırları ve haklar

Ücretli AI API bağımlılığı yok. Çizimler, müzik ve efektler bu projede kodla üretilmiştir. Türkçe Piper DFKI model kartı veri kümesi için **CC BY-NC-SA 4.0** bildirir; sesli teslim ticari olmayan kullanım içindir. Ticari yayın için uygun izin veya farklı lisanslı bir anlatıcı gerekir. Ayrıntılar `assets/licenses.md` içinde.

Chatterbox Multilingual ve ACE-Step araştırıldı, bu teslimde kurulup çalıştırılmadı. Hibrit test bağımsız bir üretken görüntü modeli değildir: aynı özgün çizimlerin otomatik resim katmanlarına dönüştürülmesidir. Görsel kalite iyi bir prosedürel illüstrasyon düzeyindedir; profesyonel stüdyo animasyonu ve doğal insan seslendirmesi seviyesinde olduğuna dair bir iddia yok.

Mimari: `docs/architecture-decision.md`. İş akışı: `docs/production-pipeline.md`. Kaynak incelemesi: `docs/source-audit.md`. Bilimsel dayanak: `production/research/galileo.md`.

## İlişki laboratuvarı ve ticari ses geçişi

İlk kalite sözleşmesi, hata sınıfları, eşikler ve yol haritası:
`docs/quality-contract.md`. `npm run review:relationships` filmden bağımsız deneyin
üç 6 saniyelik varyasyonunu, kasıtlı kusurları, gerçek raster kontrollerini, 1080p klipleri
ve Galileo regresyonunu üretir. Kanıt: `review/relationships/`. Bu sentetik denetim
kapsamlı karakter oyunculuğu veya insan incelemesinin kaldırılması anlamına gelmez.
Çalıştırılan kontroller ve görsel bulgular: `docs/relationship-lab-results.md`.
Laboratuvarı açmak için `npm run dev` çıktısındaki **Relationship lab** HTTP
adresini kullanın. HTML dosyasını çift tıklamak ES module yüklemesini engelleyebilir.
Oynat/duraklat, zaman kaydırıcısı, üç düzen ve altı kasıtlı hata seçeneği vardır.

Türkçe ticari kullanıma izin veren Freya-small adayı dinleme testinde cızırtılı bulunarak reddedildi (`docs/commercial-voice.md`). Tok erkek anlatıcı olarak Alania sentetik CC BY 4.0 referansı (`d1-02552`) ve Chatterbox modeli seçilip kilitlendi (`docs/male-voice-selection.md`, `assets/selected-voice.json`). İkinci film *Salıncağın Sırrı* bu kilitli anlatıcıyla tamamlandı. Mevcut eski Galileo Piper MP4'lerinin noncommercial kısıtı devam eder.

Geçiş revizyonu araçları: `node tools/render-transition-tests.mjs`, `python tools/verify-transition-clips.py`, `node tools/capture-baseline.mjs`, `python tools/verify-style.py`, `python tools/review-encoded.py renders/galileo-final-v2.mp4 review/revision/encoded`. Yoğun görsel denetim ve yerel geçiş kontrolleri tam renderdan önce yapılmalıdır.
