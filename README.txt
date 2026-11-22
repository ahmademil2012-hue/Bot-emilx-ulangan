EMILX DEVELOPER BOT — CARA MENJALANKAN

Persyaratan: hosting/server yang mendukung Node.js 18 atau lebih baru.

1. Upload dan ekstrak folder project ke hosting.
2. Salin .env.example menjadi .env.
3. Isi:
   AI_BASE_URL = base URL API resmi provider (tanpa /chat/completions)
   AI_MODEL = ID model persis dari dashboard/dokumentasi provider
   AI_API_KEY = API Key rahasia milikmu
4. Jalankan: npm start
5. Buka alamat hosting/server melalui browser HP.

CATATAN PENTING
- Jangan menaruh API Key di public/index.html atau membagikan file .env.
- Project ini memakai format API OpenAI-compatible: POST {AI_BASE_URL}/chat/completions.
- Belum dapat dijamin cocok dengan KunciAI sampai base URL, ID model, dan format API dikonfirmasi dari dokumentasi resmi KunciAI.
- Bila KunciAI memakai format lain, bagian fetch di server.js perlu disesuaikan.
- Ini adalah chatbot belajar umum. Tidak ada fitur untuk mengakali ujian atau mengirim jawaban ke formulir pihak lain.
