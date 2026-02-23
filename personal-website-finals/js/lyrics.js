const API_BASE = "https://personal-website-finals-api.onrender.com";

Vue.createApp({
  data() {
    return {
      tab: "post",
      form: {
        title: "",
        artist: "",
        lyrics: "",
        posted_by: ""
      },
      items: [],
      loading: false,
      error: "",
      success: ""
    };
  },
  methods: {
    async submit() {
      this.error = "";
      this.success = "";
      const { title, artist, lyrics, posted_by } = this.form;
      if (!title || !artist || !lyrics || !posted_by) {
        this.error = "All fields are required.";
        return;
      }
      try {
        this.loading = true;
        await axios.post(`${API_BASE}/lyrics`, { title, artist, lyrics, posted_by });
        this.success = "Lyrics posted successfully!";
        this.form = { title: "", artist: "", lyrics: "", posted_by: "" };
        await this.fetchItems();
        this.tab = "list";
      } catch (e) {
        console.error(e);
        this.error = "Failed to post lyrics. Please try again.";
      } finally {
        this.loading = false;
      }
    },
    async fetchItems() {
      this.error = "";
      try {
        this.loading = true;
        const res = await axios.get(`${API_BASE}/lyrics`);
        this.items = res.data || [];
      } catch (e) {
        console.error(e);
        this.error = "Failed to load lyrics posts.";
      } finally {
        this.loading = false;
      }
    }
  },
  mounted() {
    this.fetchItems();
  }
}).mount("#lyricsApp");