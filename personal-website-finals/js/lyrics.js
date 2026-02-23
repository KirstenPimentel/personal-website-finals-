// personal-website-finals/js/lyrics.js
// Vue app for Lyrics Likes (requires window.sb from supabase.js)
const { createApp, ref, onMounted } = Vue;

createApp({
  setup() {
    const posts = ref([]);
    const loading = ref(true);

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

        // Optimistic UI update
        const before = post.likes;
        post.likes = before + 1;

        const { data, error } = await sb.rpc('increment_likes', { post_id: post.id });

        if (error) {
          // rollback on error
          post.likes = before;
          console.error(error);
          alert('Failed to like. Please try again.');
        } else {
          // server is source of truth
          post.likes = data;
        }
      } finally {
        post.liking = false;
      }
    }

    onMounted(loadPosts);
    return { posts, loading, like };
  }
}).mount('#lyricsApp');