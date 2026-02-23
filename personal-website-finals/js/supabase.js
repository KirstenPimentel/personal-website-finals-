// SAFE to commit — publishable (anon) key only.
const SUPABASE_URL = "https://qdkfcngqeuvarthqhkqy.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_NGCcEwB0w5FRFvT-SKdHrw_Pqe7Vra7";

const { createClient } = window.supabase;
window.sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);