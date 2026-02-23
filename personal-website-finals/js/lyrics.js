// Vue app for Lyrics Likes + Create Post (uses window.sb from supabase.js)
const { createApp, ref, onMounted } = Vue;

createApp({
  setup() {
    const posts = ref([]);
    const loading = ref(true);

    // For "Post a lyric"
    const newTitle = ref("");
    const newExcerpt = ref("");
    const creating = ref(false);

    async function loadPosts() {
      loading.value = true;

      const { data, error } = await sb
        .from('lyrics_posts')
        .select('*')
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
        alert("Title is required.");
        return;
      }
      creating.value = true;

      const insertRow = {
        title: newTitle.value.trim(),
        excerpt: newExcerpt.value.trim() || null
      };

      const { error } = await sb.from('lyrics_posts').insert([insertRow]);

      creating.value = false;

      if (error) {
        console.error(error);
        alert('Failed to add post. Check Insert policy in Supabase.');
        return;
      }

      newTitle.value = "";
      newExcerpt.value = "";
      await loadPosts();
    }

    onMounted(loadPosts);
    return { posts, loading, like, newTitle, newExcerpt, creating, createPost };
  }
}).mount('#lyricsApp');