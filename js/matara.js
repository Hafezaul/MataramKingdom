function matara() {
  return {
    input: '',
    messages: [],
    loading: false,
    errorMsg: '',
    mobileMenu: false,
    suggestions: [
      'Siapa Sultan Agung dari Mataram Islam?',
      'Apa peran Kasunanan dalam memerangi Belanda?',
      'Mengapa Mataram Pecah?',
      'Ceritakan tentang Raden Mas Said.',
      'Apa itu Perjanjian Giyanti?'
    ],

    init() {
      this.messages = [];
    },

    async sendMessage() {
      const q = this.input.trim();
      if (!q || this.loading) return;

      const GROQ_API_KEY = "";

      this.input = '';
      this.errorMsg = '';
      this.messages.push({ role: 'user', content: q });
      this.loading = true;
      this.scrollToBottom();

      try {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${GROQ_API_KEY}`
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
              {
                role: 'system',
                content: 'Kamu adalah MATARA AI, asisten sejarah Kerajaan Islam Nusantara. Jawab dalam bahasa Indonesia dengan jelas, ramah, dan singkat.'
              },
              ...this.messages.map(m => ({
                role: m.role === 'ai' ? 'assistant' : 'user',
                content: m.content
              }))
            ],
            temperature: 0.7,
            max_completion_tokens: 1024
          })
        });

        let data;
        try {
          data = await res.json();
        } catch {
          throw new Error('Respons dari server Groq bukan JSON.');
        }

        if (!res.ok) {
          throw new Error(data?.error?.message || 'Gagal mendapat jawaban dari Groq.');
        }

        const jawaban = data?.choices?.[0]?.message?.content?.trim();

        if (!jawaban) {
          throw new Error('Jawaban dari Groq kosong.');
        }

        this.messages.push({ role: 'ai', content: jawaban });
      } catch (e) {
        this.errorMsg = e.message || 'Terjadi kesalahan.';
        this.messages.push({
          role: 'ai',
          content: 'Maaf, terjadi kesalahan saat menghubungi Groq.'
        });
      } finally {
        this.loading = false;
        this.scrollToBottom();
      }
    },

    askSuggestion(q) {
      this.input = q;
      this.sendMessage();
    },

    clearChat() {
      this.messages = [];
      this.errorMsg = '';
    },

    scrollToBottom() {
      this.$nextTick(() => {
        const el = document.getElementById('chat-container');
        if (el) el.scrollTop = el.scrollHeight;
      });
    }
  };
}