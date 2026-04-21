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
    gambar: 'assets-kerajaan/mataram.jpg'
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
    gambar: 'assets-kerajaan/mangkunegara.png'
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
    gambar: 'assets-kerajaan/pakualam.png'
  }
];

function app() {
  return {
    kingdoms: [],
    loading: true,
    mobileMenu: false,

    init() {
      this.kingdoms = KINGDOMS;
      this.loading = false;
    },

    selectKingdom(k) {
      window.location.href = 'pages/kerajaan.html?id=' + k.id;
    }
  };
}
