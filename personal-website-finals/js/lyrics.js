// personal-website-finals/js/lyrics.js
// Vue app for "Post Lyrics" + "Who Posted" + Likes (uses window.sb from supabase.js)
const { createApp, ref, onMounted } = Vue;

createApp({
  setup() {
    // Tabs
    const currentTab = ref('post'); // 'post' | 'who'

    // List
    const posts = ref([]);
    const loading = ref(true);

    // Form fields
    const newTitle = ref("");
    const newArtist = ref("");
    const newExcerpt = ref("");     // we store lyrics text in 'excerpt' column
    const newPostedBy = ref("");
    const creating = ref(false);

    function fmt(s) {
      try { return new Date(s).toLocaleString(); }
      catch { return ""; }
    }

    // Safely display lyrics text (supports either 'excerpt' or 'lyrics' column)
    function displayExcerpt(post) {
      return (post && (post.excerpt || post.lyrics)) || "";
    }

    async function loadPosts() {
      loading.value = true;

      const { data, error } = await sb
        .from('lyrics_posts')
        .select('*') // if 'lyrics' column exists, it will be present in the row; otherwise undefined
        .order('created_at', { ascending: false });

      if (error) {
        console.error(error);
        alert('Failed to load posts. Check Supabase settings & policies.');
      } else {
        posts.value = (data || []).map(p => ({ ...p, liking: false }));
      }
      loading.value = false;
    }

    async function like(post) {
      try {
        post.liking = true;

        // Optimistic UI
        const before = post.likes;
        post.likes = before + 1;

        const { data, error } = await sb.rpc('increment_likes', { post_id: post.id });

        if (error) {
          post.likes = before; // rollback
          console.error(error);
          alert('Failed to like. Please try again.');
        } else {
          post.likes = data; // server truth
        }
      } finally {
        post.liking = false;
      }
    }

    async function createPost() {
      if (!newTitle.value.trim()) {
        alert("Song Title is required.");
        return;
      }
      creating.value = true;

      // Map "Lyrics" textarea to 'excerpt' column (works with your current schema)
      const row = {
        title: newTitle.value.trim(),
        artist: newArtist.value.trim() || null,
        excerpt: newExcerpt.value.trim() || null,
        posted_by: newPostedBy.value.trim() || null
      };

      const { error } = await sb.from('lyrics_posts').insert([row]);

      creating.value = false;

      if (error) {
        console.error(error);
        alert('Failed to add post. Check Insert policy in Supabase.');
        return;
      }

      // Clear & switch to "Who Posted" so they see their post immediately
      newTitle.value = "";
      newArtist.value = "";
      newExcerpt.value = "";
      newPostedBy.value = "";

      await loadPosts();
      currentTab.value = 'who';
    }

    onMounted(loadPosts);
    return {
      // state
      currentTab, posts, loading,
      newTitle, newArtist, newExcerpt, newPostedBy, creating,
      // methods
      createPost, like, fmt, displayExcerpt
    };
  }
}).mount('#lyricsApp');