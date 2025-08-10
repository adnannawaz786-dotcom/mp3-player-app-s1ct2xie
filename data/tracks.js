const tracks = [
  {
    id: 1,
    title: "Midnight Dreams",
    artist: "Luna Eclipse",
    album: "Nocturnal Vibes",
    duration: "3:42",
    src: "/audio/midnight-dreams.mp3",
    cover: "/images/covers/midnight-dreams.jpg",
    genre: "Electronic",
    year: 2023,
    color: "#6366f1"
  },
  {
    id: 2,
    title: "Ocean Waves",
    artist: "Coastal Sounds",
    album: "Nature's Symphony",
    duration: "4:15",
    src: "/audio/ocean-waves.mp3",
    cover: "/images/covers/ocean-waves.jpg",
    genre: "Ambient",
    year: 2022,
    color: "#0ea5e9"
  },
  {
    id: 3,
    title: "Urban Pulse",
    artist: "City Beats",
    album: "Metropolitan",
    duration: "3:28",
    src: "/audio/urban-pulse.mp3",
    cover: "/images/covers/urban-pulse.jpg",
    genre: "Hip Hop",
    year: 2023,
    color: "#f59e0b"
  },
  {
    id: 4,
    title: "Forest Whispers",
    artist: "Nature's Call",
    album: "Woodland Tales",
    duration: "5:03",
    src: "/audio/forest-whispers.mp3",
    cover: "/images/covers/forest-whispers.jpg",
    genre: "Ambient",
    year: 2021,
    color: "#10b981"
  },
  {
    id: 5,
    title: "Electric Storm",
    artist: "Thunder Bay",
    album: "Weather Patterns",
    duration: "3:56",
    src: "/audio/electric-storm.mp3",
    cover: "/images/covers/electric-storm.jpg",
    genre: "Electronic",
    year: 2023,
    color: "#8b5cf6"
  },
  {
    id: 6,
    title: "Sunset Boulevard",
    artist: "Golden Hour",
    album: "Evening Moods",
    duration: "4:22",
    src: "/audio/sunset-boulevard.mp3",
    cover: "/images/covers/sunset-boulevard.jpg",
    genre: "Jazz",
    year: 2022,
    color: "#f97316"
  },
  {
    id: 7,
    title: "Digital Dreams",
    artist: "Cyber Waves",
    album: "Future Sounds",
    duration: "3:33",
    src: "/audio/digital-dreams.mp3",
    cover: "/images/covers/digital-dreams.jpg",
    genre: "Synthwave",
    year: 2023,
    color: "#ec4899"
  },
  {
    id: 8,
    title: "Mountain Echo",
    artist: "Alpine Sounds",
    album: "High Altitude",
    duration: "4:47",
    src: "/audio/mountain-echo.mp3",
    cover: "/images/covers/mountain-echo.jpg",
    genre: "Folk",
    year: 2021,
    color: "#64748b"
  },
  {
    id: 9,
    title: "Neon Nights",
    artist: "Retro Future",
    album: "80s Revival",
    duration: "3:19",
    src: "/audio/neon-nights.mp3",
    cover: "/images/covers/neon-nights.jpg",
    genre: "Synthpop",
    year: 2022,
    color: "#06b6d4"
  },
  {
    id: 10,
    title: "Peaceful Mind",
    artist: "Meditation Masters",
    album: "Inner Peace",
    duration: "6:12",
    src: "/audio/peaceful-mind.mp3",
    cover: "/images/covers/peaceful-mind.jpg",
    genre: "Meditation",
    year: 2023,
    color: "#84cc16"
  }
];

const playlists = [
  {
    id: 1,
    name: "Chill Vibes",
    description: "Perfect for relaxing",
    tracks: [2, 4, 8, 10],
    cover: "/images/playlists/chill-vibes.jpg",
    color: "#10b981"
  },
  {
    id: 2,
    name: "Electronic Mix",
    description: "Best electronic beats",
    tracks: [1, 5, 7, 9],
    cover: "/images/playlists/electronic-mix.jpg",
    color: "#6366f1"
  },
  {
    id: 3,
    name: "Focus & Study",
    description: "Music for concentration",
    tracks: [2, 4, 10],
    cover: "/images/playlists/focus-study.jpg",
    color: "#8b5cf6"
  },
  {
    id: 4,
    name: "Urban Beats",
    description: "City life soundtrack",
    tracks: [3, 6, 7, 9],
    cover: "/images/playlists/urban-beats.jpg",
    color: "#f59e0b"
  }
];

const genres = [
  { name: "Electronic", count: 2, color: "#6366f1" },
  { name: "Ambient", count: 2, color: "#10b981" },
  { name: "Hip Hop", count: 1, color: "#f59e0b" },
  { name: "Jazz", count: 1, color: "#f97316" },
  { name: "Synthwave", count: 1, color: "#ec4899" },
  { name: "Folk", count: 1, color: "#64748b" },
  { name: "Synthpop", count: 1, color: "#06b6d4" },
  { name: "Meditation", count: 1, color: "#84cc16" }
];

export { tracks, playlists, genres };
export default tracks;