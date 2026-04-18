    const TURNSTILE_SITE_KEY = '0x4AAAAAAC9efJSgiEKsGrfw';

    let turnstileToken = null;
    function onTurnstileSuccess(token) {
      turnstileToken = token;
    }

    // Render Turnstile secara explicit setelah script siap
    window.onloadTurnstileCallback = function() {
      turnstile.render('#turnstile-container', {
        sitekey: TURNSTILE_SITE_KEY,
        callback: onTurnstileSuccess,
        theme: 'light',
      });
    };

    function diskusi() {
      return {
        form: { nama: '', komentar: '' },
        komentar: [],
        submitting: false,
        loadingKomentar: true,
        errorMsg: '',
        successMsg: '',
        mobileMenu: false,
        replyOpen: null,
        replyForm: { nama: '', komentar: '' },
        replySubmitting: false,
        replyError: '',
        replyToken: null,

        async init() {
          await this.loadKomentar();
        },

        async loadKomentar() {
          this.loadingKomentar = true;
          try {
            const res = await fetch('/api/diskusi');
            this.komentar = await res.json();
          } catch (e) {
            console.error('Gagal memuat komentar', e);
          } finally {
            this.loadingKomentar = false;
          }
        },

        toggleReply(id) {
          if (this.replyOpen === id) {
            this.replyOpen = null;
            this.replyForm = { nama: '', komentar: '' };
            this.replyError = '';
            this.replyToken = null;
          } else {
            this.replyOpen = id;
            this.replyForm = { nama: '', komentar: '' };
            this.replyError = '';
            this.replyToken = null;
            // Render turnstile untuk reply
            this.$nextTick(() => {
              const containerId = 'turnstile-reply-' + id;
              const el = document.getElementById(containerId);
              if (el && el.childElementCount === 0 && window.turnstile) {
                window.turnstile.render('#' + containerId, {
                  sitekey: TURNSTILE_SITE_KEY,
                  callback: (token) => { this.replyToken = token; },
                  theme: 'light',
                  size: 'compact',
                });
              }
            });
          }
        },

        async submitBalasan(komentarId) {
          this.replyError = '';
          if (!this.replyForm.nama.trim()) return this.replyError = 'Nama wajib diisi.';
          if (!this.replyForm.komentar.trim()) return this.replyError = 'Balasan wajib diisi.';
          if (!this.replyToken) return this.replyError = 'Harap selesaikan verifikasi captcha.';

          this.replySubmitting = true;
          try {
            const res = await fetch(`/api/diskusi/${komentarId}/balasan`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                nama: this.replyForm.nama,
                komentar: this.replyForm.komentar,
                captchaToken: this.replyToken
              })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Gagal mengirim balasan.');

            this.replyOpen = null;
            this.replyForm = { nama: '', komentar: '' };
            this.replyToken = null;
            await this.loadKomentar();
          } catch (e) {
            this.replyError = e.message;
          } finally {
            this.replySubmitting = false;
          }
        },

        async submitKomentar() {
          this.errorMsg = '';
          this.successMsg = '';

          if (!this.form.nama.trim()) return this.errorMsg = 'Nama wajib diisi.';
          if (!this.form.komentar.trim()) return this.errorMsg = 'Komentar wajib diisi.';
          if (!turnstileToken) return this.errorMsg = 'Harap selesaikan verifikasi captcha terlebih dahulu.';

          this.submitting = true;
          try {
            const res = await fetch('/api/diskusi', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                nama: this.form.nama,
                komentar: this.form.komentar,
                captchaToken: turnstileToken
              })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Gagal mengirim komentar.');

            this.successMsg = 'Komentar berhasil dikirim!';
            this.form = { nama: '', komentar: '' };
            turnstileToken = null;
            if (window.turnstile) window.turnstile.reset();
            await this.loadKomentar();
          } catch (e) {
            this.errorMsg = e.message;
          } finally {
            this.submitting = false;
          }
        },

        formatWaktu(ts) {
          if (!ts) return '';
          const d = new Date(ts);
          return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        }
      }
    }