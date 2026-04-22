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

    init() { this.messages = []; },

    async sendMessage() {
      const q = this.input.trim();
      if (!q || this.loading) return;
      this.input = '';
      this.errorMsg = '';
      this.messages.push({ role: 'user', content: q });
      this.loading = true;
      this.scrollToBottom();
      try {
        const res = await fetch('/api/matara', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pertanyaan: q })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Gagal mendapat jawaban.');
        this.messages.push({ role: 'ai', content: data.jawaban });
      } catch (e) {
        this.errorMsg = e.message;
        this.messages.push({ role: 'ai', content: 'Maaf, terjadi kesalahan. Silakan coba lagi.' });
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
