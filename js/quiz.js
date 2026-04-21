function quiz() {
  return {
    allQuestions: [],
    questions: [],
    currentIndex: 0,
    score: 0,
    answered: false,
    selectedAnswer: null,
    isCorrect: false,
    userAnswers: [],
    phase: 'start',
    loading: true,
    mobileMenu: false,

    get currentQ() {
      return this.questions[this.currentIndex] || null;
    },

    async init() {
      try {
        const res = await fetch('../data/quiz.json');
        this.allQuestions = await res.json();
      } catch (e) {
        console.error('Gagal memuat soal', e);
      } finally {
        this.loading = false;
      }
    },

    startQuiz() {
      const shuffled = [...this.allQuestions].sort(() => Math.random() - 0.5);
      this.questions = shuffled.slice(0, 5);
      this.currentIndex = 0;
      this.score = 0;
      this.answered = false;
      this.selectedAnswer = null;
      this.userAnswers = [];
      this.phase = 'quiz';
    },

    answer(idx) {
      if (this.answered) return;
      this.answered = true;
      this.selectedAnswer = idx;
      this.isCorrect = idx === this.currentQ.jawaban;
      if (this.isCorrect) this.score++;
      this.userAnswers.push(idx);
    },

    nextQuestion() {
      if (this.currentIndex < this.questions.length - 1) {
        this.currentIndex++;
        this.answered = false;
        this.selectedAnswer = null;
        this.isCorrect = false;
      } else {
        this.phase = 'result';
      }
    },

    getGrade() {
      const s = this.score;
      const t = this.questions.length;
      if (s === t) return '🌟 Sempurna! Kamu ahli sejarah Islam Nusantara!';
      if (s >= t * 0.8) return '👏 Sangat Baik! Hampir sempurna!';
      if (s >= t * 0.6) return '👍 Cukup Baik! Terus belajar!';
      if (s >= t * 0.4) return '📚 Perlu Belajar Lebih Lagi!';
      return '💪 Jangan Menyerah! Coba Lagi!';
    }
  };
}
