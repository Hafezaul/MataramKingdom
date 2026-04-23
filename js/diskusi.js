
// TODO: Ganti dengan konfigurasi Firebase Anda
const firebaseConfig = {
  apiKey: "",
  authDomain: "YOUR_AUTH_DOMAIN",
  databaseURL: "",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Inisialisasi Firebase
const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database();

const TURNSTILE_SITE_KEY = '0x4AAAAAAC9efJSgiEKsGrfw';
let turnstileToken = null;

function onTurnstileSuccess(token) {
  turnstileToken = token;
}

window.onloadTurnstileCallback = function () {
  if (document.getElementById('turnstile-container')) {
      turnstile.render('#turnstile-container', {
        sitekey: TURNSTILE_SITE_KEY,
        callback: onTurnstileSuccess,
        theme: 'light',
      });
  }
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

    init() {
      this.loadKomentar();
    },

    async loadKomentar() {
      this.loadingKomentar = true;
      const commentsRef = database.ref('diskusi').orderByChild('waktu');
      
      commentsRef.on('value', (snapshot) => {
        const data = snapshot.val();
        const commentsArray = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })).reverse() : [];
        
        commentsArray.forEach(comment => {
            if (comment.balasan) {
                comment.balasan = Object.keys(comment.balasan).map(key => ({ id: key, ...comment.balasan[key] }));
            }
        });

        this.komentar = commentsArray;
        this.loadingKomentar = false;
      }, (error) => {
        console.error('Gagal memuat komentar', error);
        this.errorMsg = 'Gagal memuat data dari database.';
        this.loadingKomentar = false;
      });
    },

    toggleReply(id) {
      if (this.replyOpen === id) {
        this.replyOpen = null;
      } else {
        this.replyOpen = id;
        this.replyForm = { nama: '', komentar: '' };
        this.replyError = '';
        this.replyToken = null; // Reset token balasan
        
        this.$nextTick(() => {
            const containerId = 'turnstile-reply-' + id;
            const el = document.getElementById(containerId);
            // Render turnstile hanya jika elemen ada dan belum dirender
            if (el && el.innerHTML === '' && window.turnstile) {
                turnstile.render(`#${containerId}`, {
                    sitekey: TURNSTILE_SITE_KEY,
                    callback: (token) => { this.replyToken = token; },
                    theme: 'light',
                    size: 'compact'
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
      const balasanRef = database.ref('diskusi/' + komentarId + '/balasan').push();
      
      try {
        await balasanRef.set({
          nama: this.replyForm.nama,
          komentar: this.replyForm.komentar,
          waktu: firebase.database.ServerValue.TIMESTAMP
        });
        
        this.replyOpen = null;
      } catch (e) {
        this.replyError = 'Gagal mengirim balasan.';
        console.error(e);
      } finally {
        this.replySubmitting = false;
      }
    },

    async submitKomentar() {
      this.errorMsg = '';
      this.successMsg = '';
      if (!this.form.nama.trim()) return this.errorMsg = 'Nama wajib diisi.';
      if (!this.form.komentar.trim()) return this.errorMsg = 'Komentar wajib diisi.';
      if (!turnstileToken) return this.errorMsg = 'Harap selesaikan verifikasi captcha.';

      this.submitting = true;
      const newCommentRef = database.ref('diskusi').push();
      
      try {
        await newCommentRef.set({
          nama: this.form.nama,
          komentar: this.form.komentar,
          waktu: firebase.database.ServerValue.TIMESTAMP
        });

        this.successMsg = 'Komentar berhasil dikirim!';
        this.form = { nama: '', komentar: '' };
        // Reset dan render ulang turnstile utama
        turnstileToken = null;
        if(window.turnstile) window.turnstile.reset();

      } catch (e) {
        this.errorMsg = 'Gagal mengirim komentar.';
        console.error(e);
      } finally {
        this.submitting = false;
      }
    },

    formatWaktu(ts) {
      if (!ts) return '';
      return new Date(ts).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    }
  };
}
