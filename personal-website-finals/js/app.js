// ====== Concert Gallery (Vue) — only mount if element exists ======
(function () {
  const el = document.getElementById('galleryApp');
  if (!el) return;

  Vue.createApp({
    data() {
      return {
        images: [
          "images/concert1.jpg",
          "images/concert2.jpg",
          "images/concert3.jpg",
          "images/concert4.jpg",
          "images/concert5.jpg",
          "images/concert6.jpg"
        ]
      };
    },
    methods: {
      view(e) {
        // use existing global lightbox
        if (e && e.target && typeof openLightbox === 'function') openLightbox(e.target);
      }
    }
  }).mount('#galleryApp');
})();

// ====== Guestbook (Vue) — only mount if element exists ======
(function () {
  const el = document.getElementById('guestbookApp');
  if (!el) return;

  Vue.createApp({
    data() {
      return { name: "", comment: "", entries: [] };
    },
    methods: {
      addComment() {
        if (this.name && this.comment) {
          this.entries.push({ name: this.name, comment: this.comment });
          this.name = ""; this.comment = "";
        }
      }
    }
  }).mount('#guestbookApp');
})();