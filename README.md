# CodeCinema

Fikirden kodla çizilmiş 2D kısa filme uzanan, Codex oturumunda yönetilen yerel üretim hattı. İlk yapım **Galileo ve En Hızlı Yol**, 48 saniye. Gerçek MP4, Türkçe anlatım, özgün sentez müziği, sayfa sesleri, deterministik karakter rig'i ve sayısal fizik içerir.

## İzle ve incele

- `renders/galileo-final.mp4`: 1920×1080, 30 FPS, H.264/AAC final.
- `renders/galileo-draft.mp4`: 960×540 taslak.
- `renders/galileo-music-only.mp4`: aynı 1080p görüntü, özgün müzik/efekt ve altyazı; Piper anlatımı içermez.
- `renders/comparison/a.mp4` ve `b.mp4`: 10 saniyelik saf kod / resim katmanı denemeleri.
- `review/final/contact-sheet.jpg`, `review/encoded/`: kare ve hareket inceleme kanıtları.
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
