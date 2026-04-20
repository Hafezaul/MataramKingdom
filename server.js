import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, onValue } from "firebase/database";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Firebase init
const firebaseApp = initializeApp({
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
});
const db = getDatabase(firebaseApp);

// Verify Cloudflare Turnstile
async function verifyTurnstile(token) {
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ secret: process.env.TURNSTILE_SECRET_KEY, response: token }),
  });
  const data = await res.json();
  return data.success;
}

// POST /api/diskusi - simpan komentar
app.post("/api/diskusi", async (req, res) => {
  const { nama, komentar, captchaToken } = req.body;
  if (!nama?.trim() || !komentar?.trim()) return res.status(400).json({ error: "Nama dan komentar wajib diisi." });
  if (!captchaToken) return res.status(400).json({ error: "Captcha diperlukan." });

  const valid = await verifyTurnstile(captchaToken);
  if (!valid) return res.status(403).json({ error: "Verifikasi captcha gagal." });

  const diskusiRef = ref(db, "diskusi");
  await push(diskusiRef, { nama: nama.trim(), komentar: komentar.trim(), waktu: Date.now() });
  res.json({ success: true });
});

// GET /api/diskusi - ambil semua komentar beserta balasan
app.get("/api/diskusi", (req, res) => {
  const diskusiRef = ref(db, "diskusi");
  onValue(diskusiRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) return res.json([]);
    const list = Object.entries(data)
      .map(([id, v]) => ({
        id,
        ...v,
        balasan: v.balasan
          ? Object.entries(v.balasan).map(([bid, b]) => ({ id: bid, ...b })).sort((a, b) => a.waktu - b.waktu)
          : []
      }))
      .sort((a, b) => b.waktu - a.waktu);
    res.json(list);
  }, { onlyOnce: true });
});

// POST /api/diskusi/:id/balasan - kirim balasan
app.post("/api/diskusi/:id/balasan", async (req, res) => {
  const { nama, komentar, captchaToken } = req.body;
  const { id } = req.params;
  if (!nama?.trim() || !komentar?.trim()) return res.status(400).json({ error: "Nama dan komentar wajib diisi." });
  if (!captchaToken) return res.status(400).json({ error: "Captcha diperlukan." });

  const valid = await verifyTurnstile(captchaToken);
  if (!valid) return res.status(403).json({ error: "Verifikasi captcha gagal." });

  const balasanRef = ref(db, `diskusi/${id}/balasan`);
  await push(balasanRef, { nama: nama.trim(), komentar: komentar.trim(), waktu: Date.now() });
  res.json({ success: true });
});

// POST /api/matara - AI tanya jawab (Groq)
app.post("/api/matara", async (req, res) => {
  const { pertanyaan } = req.body;
  if (!pertanyaan?.trim()) return res.status(400).json({ error: "Pertanyaan tidak boleh kosong." });

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: "Kamu adalah MATARA, asisten AI yang ahli dalam sejarah Kerajaan Islam di Indonesia. Jawab pertanyaan dengan informatif, akurat, dan menggunakan Bahasa Indonesia yang baik. Fokus pada topik kerajaan Islam Nusantara seperti Mataram Islam, Demak, Aceh, Ternate, Banten, dan Gowa-Tallo. Jika pertanyaan di luar topik, arahkan kembali ke sejarah Islam Nusantara.",
          },
          { role: "user", content: pertanyaan },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    const jawaban = data.choices?.[0]?.message?.content || "Maaf, saya tidak dapat memproses pertanyaan Anda saat ini.";
    res.json({ jawaban });
  } catch (err) {
    res.status(500).json({ error: "Gagal menghubungi AI: " + err.message });
  }
});

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server berjalan di http://localhost:${PORT}`));
}

export default app;
