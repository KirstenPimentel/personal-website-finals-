from flask import Flask, request, jsonify
from flask_cors import CORS
from supabase import create_client
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

app = Flask(__name__)
CORS(app)

# ---------------------------
# GUESTBOOK API
# ---------------------------

@app.route("/guestbook", methods=["POST"])
def add_guestbook_entry():
    data = request.json
    name = data.get("name")
    comment = data.get("comment")

    if not name or not comment:
        return jsonify({"error": "Name and comment are required"}), 400

    response = supabase.table("guestbook").insert({
        "name": name,
        "comment": comment
    }).execute()

    return jsonify(response.data), 201


@app.route("/guestbook", methods=["GET"])
def get_guestbook_entries():
    response = supabase.table("guestbook").select("*").order("created_at", desc=True).execute()
    return jsonify(response.data)


# ---------------------------
# LYRICS POST API
# ---------------------------

@app.route("/lyrics", methods=["POST"])
def add_lyrics():
    data = request.json
    title = data.get("title")
    artist = data.get("artist")
    lyrics = data.get("lyrics")
    posted_by = data.get("posted_by")

    if not title or not artist or not lyrics or not posted_by:
        return jsonify({"error": "All fields are required"}), 400

    response = supabase.table("lyrics_posts").insert({
        "title": title,
        "artist": artist,
        "lyrics": lyrics,
        "posted_by": posted_by
    }).execute()

    return jsonify(response.data), 201


@app.route("/lyrics", methods=["GET"])
def get_lyrics():
    response = supabase.table("lyrics_posts").select("*").order("created_at", desc=True).execute()
    return jsonify(response.data)


# ---------------------------
# ROOT CHECK ENDPOINT
# ---------------------------
@app.route("/")
def home():
    return "Backend is running!"

# ---------------------------
# RUN SERVER
# ---------------------------
if __name__ == "__main__":
    app.run(debug=True)