const KINGDOMS = [
  {
    id: 'mataram',
    name: 'Kesultanan Mataram Islam',
    periode: '1586–1755',
    lokasi: 'Jawa Tengah',
    pendiri: 'Panembahan Senopati',
    ibu_kota: 'Kotagede',
    agama: 'Islam',
    deskripsi: 'Kerajaan Islam terbesar di Jawa yang berdiri pada akhir abad ke-16, mencapai puncak kejayaan di bawah Sultan Agung.',
    gambar: '../assets-kerajaan/mataram.jpg',
    dataFile: '../data/mataram.json',
    dataKey: 'sejarah_mataram_islam',
    bagianKey: 'bagian',
    judulKey: 'judul_bagian',
    materiKey: 'materi'
  },
  {
    id: 'mangkunegara',
    name: 'Kadipaten Mangkunegaran',
    periode: '1757–sekarang',
    lokasi: 'Surakarta, Jawa Tengah',
    pendiri: 'Mangkunegara I (Raden Mas Said)',
    ibu_kota: 'Surakarta',
    agama: 'Islam',
    deskripsi: 'Kadipaten pecahan Mataram yang berdiri melalui Perjanjian Salatiga 1757, didirikan oleh Raden Mas Said (Pangeran Sambernyawa).',
    gambar: '../assets-kerajaan/mangkunegara.png',
    dataFile: '../data/mangkunegara.json',
    dataKey: 'sejarah_mangkunegaran',
    bagianKey: 'nomor',
    judulKey: 'judul_bagian',
    materiKey: 'materi'
  },
  {
    id: 'pakualam',
    name: 'Kadipaten Pakualaman',
    periode: '1813–sekarang',
    lokasi: 'Yogyakarta',
    pendiri: 'Paku Alam I (Raden Mas Notokusumo)',
    ibu_kota: 'Yogyakarta',
    agama: 'Islam',
    deskripsi: 'Kadipaten yang berdiri pada 1813 atas campur tangan Inggris (Raffles), merupakan pecahan dari Kesultanan Yogyakarta.',
    gambar: '../assets-kerajaan/pakualam.png',
    dataFile: '../data/pakualam.json',
    dataKey: 'data',
    bagianKey: 'id',
    judulKey: 'topik',
    materiKey: 'detail'
  }
];

function kerajaanPage() {
  return {
    kingdoms: KINGDOMS,
    kingdom: null,
    sections: [],
    loading: true,
    mobileMenu: false,

    get prevKingdom() {
      const idx = this.kingdoms.findIndex(k => k.id === this.kingdom?.id);
      return idx > 0 ? this.kingdoms[idx - 1] : null;
    },
    get nextKingdom() {
      const idx = this.kingdoms.findIndex(k => k.id === this.kingdom?.id);
      return idx < this.kingdoms.length - 1 ? this.kingdoms[idx + 1] : null;
    },

    async init() {
      const id = new URLSearchParams(window.location.search).get('id');
      this.kingdom = this.kingdoms.find(k => k.id === id) || null;
      if (!this.kingdom) { this.loading = false; return; }
      document.title = this.kingdom.name + ' – Kerajaan Islam Nusantara';
      try {
        const res = await fetch(this.kingdom.dataFile);
        const json = await res.json();
        const raw = json[this.kingdom.dataKey] || [];
        this.sections = raw.map(bagian => {
          const judul = bagian[this.kingdom.judulKey] || bagian.topik || '';
          const items = bagian[this.kingdom.materiKey] || bagian.detail || [];
          const materi = items.map(m => {
            const sub = m.sub_judul || m.sub_topik || '';
            const isiRaw = m.isi || m.deskripsi || '';
            const isi = Array.isArray(isiRaw) ? isiRaw : [isiRaw];
            // Gabungkan semua kemungkinan field daftar
            const daftar = m.daftar || m.daftar_pembagian || m.daftar_dampak || [];
            const penutup = m.penutup_isi || '';
            return { sub, isi, daftar, penutup };
          });
          return { judul, materi };
        });
      } catch (e) {
        console.error('Gagal memuat data', e);
      } finally {
        this.loading = false;
      }
    }
  };
}
