// /js/lyrics.js
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
    const newExcerpt = ref("");     // bound to textarea; stored in DB as 'lyrics'
    const newPostedBy = ref("");
    const creating = ref(false);

    function fmt(s) {
      try { return new Date(s).toLocaleString(); }
      catch { return ""; }
    }

    // Safely display lyrics text from the 'lyrics' column.
    // Strip any surrounding quotes so CSS smart quotes don’t double up.
    function displayExcerpt(post) {
      const raw = (post && (post.lyrics ?? "")).trim();

      // Remove opening & closing straight/curly quotes if present
      const withoutOuterQuotes = raw
        .replace(/^["“”'‘’]+/, "")   // opening quotes
        .replace(/["“”'‘’]+$/, "");  // closing quotes

      return withoutOuterQuotes;
    }

    async function loadPosts() {
      loading.value = true;

      const { data, error } = await sb
        .from('lyrics_posts')
        .select('id, title, artist, lyrics, posted_by, created_at, likes')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[Supabase select error]', {
          code: error.code, message: error.message, details: error.details, hint: error.hint
        });
        alert(`Failed to load posts: ${error.message}`);
      } else {
        posts.value = (data || []).map(p => ({ ...p, liking: false, likes: p.likes ?? 0 }));
      }
      loading.value = false;
    }

    async function like(post) {
      if (!post?.id) return;
      try {
        post.liking = true;

        // Optimistic UI
        const before = post.likes ?? 0;
        post.likes = before + 1;

        // 1) Try RPC (if you've created the function)
        let rpcError = null;
        try {
          const { data, error } = await sb.rpc('increment_likes', { post_id: post.id });
          if (error) rpcError = error;
          else if (typeof data === 'number') {
            post.likes = data; // server truth
            return;
          }
        } catch (e) {
          rpcError = e;
        }

        // 2) Fallback: plain update if RPC is missing
        const { data, error } = await sb
          .from('lyrics_posts')
          .update({ likes: before + 1 })
          .eq('id', post.id)
          .select('likes')
          .single();

        if (error) {
          post.likes = before; // rollback
          console.error('[Supabase like error]', {
            rpcError,
            code: error.code, message: error.message, details: error.details, hint: error.hint
          });
          alert('Failed to like. Please try again.');
        } else {
          post.likes = data?.likes ?? before + 1;
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

      // ✅ Store textarea value in the 'lyrics' column
      const row = {
        title: newTitle.value.trim(),
        artist: newArtist.value.trim() || null,
        lyrics: newExcerpt.value.trim() || null,
        posted_by: newPostedBy.value.trim() || null
      };

      const { data, error } = await sb.from('lyrics_posts').insert([row]).select('*');

      creating.value = false;

      if (error) {
        console.error('[Supabase insert error]', {
          code: error.code, message: error.message, details: error.details, hint: error.hint
        });
        alert(`Failed to add post: ${error.message}`);
        return;
      }

      console.log('Inserted row(s):', data);

      // Clear & refresh
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