const API_BASE = "https://personal-website-finals-api.onrender.com";

// 1975 Gallery app (kept as-is)
Vue.createApp({
  data() {
    return {
      images: [
        "images/gallery1.jpg",
        "images/gallery2.jpg",
        "images/gallery3.jpg",
        "images/gallery4.jpg",
        "images/gallery5.jpg",
        "images/gallery6.jpg"
      ]
    };
  }
}).mount("#galleryApp");

// Guestbook app (uses API_BASE)
Vue.createApp({
  data() {
    return {
      name: "",
      comment: "",
      entries: [],
      loading: false,
      error: ""
    };
  },
  methods: {
    async addComment() {
      this.error = "";
      if (!this.name || !this.comment) {
        this.error = "Please enter your name and a comment.";
        return;
      }
      try {
        this.loading = true;
        await axios.post(`${API_BASE}/guestbook`, {
          name: this.name,
          comment: this.comment
        });
        this.name = "";
        this.comment = "";
        await this.fetchEntries();
      } catch (e) {
        console.error(e);
        this.error = "Failed to post comment. Please try again.";
      } finally {
        this.loading = false;
      }
    },
    async fetchEntries() {
      this.error = "";
      try {
        const res = await axios.get(`${API_BASE}/guestbook`);
        this.entries = res.data || [];
      } catch (e) {
        console.error(e);
        this.error = "Failed to load guestbook entries.";
      }
    }
  },
  mounted() {
    this.fetchEntries();
  }
}).mount("#guestbookApp");