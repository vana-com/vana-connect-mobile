export type AppCategory = "agents" | "productivity" | "entertainment" | "tools" | "earn";

export interface AppScope {
  name: string;
  description: string;
}

export interface DiscoverApp {
  id: string;
  name: string;
  description: string;
  emoji: string;
  publisher: string;
  category: AppCategory;
  scopes: AppScope[];
  featured: boolean;
  verified: boolean;
}

export const APPS: DiscoverApp[] = [
  {
    id: "dumb-bitch-index",
    name: "Dumb Bitch Index",
    description: "A self-awareness score based on your actual behavior patterns",
    emoji: "💁",
    publisher: "OpenDataLabs",
    category: "entertainment",
    featured: true,
    verified: true,
    scopes: [
      { name: "Spotify listening history", description: "Tracks and artists from the last 6 months" },
      { name: "Instagram activity", description: "Posts and engagement from the last 3 months" },
      { name: "X post history", description: "Public posts from the last 90 days" },
    ],
  },
  {
    id: "portrait",
    name: "Portrait",
    description: "An identity render from your digital footprint",
    emoji: "🪞",
    publisher: "Vana Labs",
    category: "agents",
    featured: true,
    verified: true,
    scopes: [
      { name: "Spotify listening history", description: "Full listening data, last 12 months" },
      { name: "Kindle highlights", description: "Annotated passages from your reading" },
      { name: "Substack reads", description: "Newsletters you subscribe to and open" },
      { name: "GitHub repos", description: "Public repositories and commit patterns" },
    ],
  },
  {
    id: "claude-mcp",
    name: "ClaudeMCP",
    description: "Pipe your personal context directly into Claude",
    emoji: "⬡",
    publisher: "Anthropic",
    category: "tools",
    featured: true,
    verified: true,
    scopes: [
      { name: "Spotify listening history", description: "Last 12 months of tracks, artists, and playlists" },
      { name: "Kindle highlights", description: "Books annotated in the last 6 months" },
      { name: "Substack subscriptions", description: "Read-only list of subscriptions" },
    ],
  },
  {
    id: "hoe-kemon",
    name: "Hoe-kemon",
    description: "Your Instagram aesthetic, turned into a Pokémon card",
    emoji: "✨",
    publisher: "OpenDataLabs",
    category: "entertainment",
    featured: true,
    verified: true,
    scopes: [
      { name: "Instagram posts", description: "Public posts and image aesthetic from the last year" },
    ],
  },
  {
    id: "focus-report",
    name: "Focus Report",
    description: "Weekly focus summary from your calendar and activity",
    emoji: "📊",
    publisher: "Clearhead",
    category: "productivity",
    featured: false,
    verified: true,
    scopes: [
      { name: "Apple Health activity", description: "Step count and movement patterns" },
      { name: "Notion workspace", description: "Page titles and edit frequency" },
    ],
  },
  {
    id: "listening-twin",
    name: "Listening Twin",
    description: "Find your Spotify doppelganger anywhere in the world",
    emoji: "👥",
    publisher: "Resonance",
    category: "entertainment",
    featured: false,
    verified: false,
    scopes: [
      { name: "Spotify listening history", description: "Last 12 months of listening data" },
    ],
  },
  {
    id: "book-map",
    name: "Book Map",
    description: "A graph of your reading, linked by theme and author",
    emoji: "🗺",
    publisher: "Marginalia",
    category: "tools",
    featured: false,
    verified: true,
    scopes: [
      { name: "Kindle highlights", description: "All annotations and books from your library" },
      { name: "Substack reads", description: "Articles and publications you follow" },
    ],
  },
  {
    id: "fit-log",
    name: "Fit Log",
    description: "Training summaries and trend analysis from your activity data",
    emoji: "🏋",
    publisher: "Endurance",
    category: "productivity",
    featured: false,
    verified: false,
    scopes: [
      { name: "Strava activities", description: "Full activity history with metrics" },
      { name: "Apple Health data", description: "Heart rate and sleep data" },
    ],
  },
  {
    id: "inbox-intel",
    name: "Inbox Intelligence",
    description: "Email triage and draft suggestions from your communication patterns",
    emoji: "📬",
    publisher: "Mailmind",
    category: "agents",
    featured: false,
    verified: true,
    scopes: [
      { name: "Gmail patterns", description: "Sender list and email frequency (no email content)" },
    ],
  },
  {
    id: "network-map",
    name: "Network Map",
    description: "Visualize your LinkedIn network by company and industry",
    emoji: "🕸",
    publisher: "Proximity",
    category: "tools",
    featured: false,
    verified: false,
    scopes: [
      { name: "LinkedIn connections", description: "Connection list with company and title metadata" },
    ],
  },
  {
    id: "sleep-score",
    name: "Sleep Score",
    description: "Sleep quality trends and recovery patterns over time",
    emoji: "🌙",
    publisher: "Restful",
    category: "productivity",
    featured: false,
    verified: true,
    scopes: [
      { name: "Apple Health sleep data", description: "Sleep duration and quality from the last 90 days" },
    ],
  },
  {
    id: "follower-mirror",
    name: "Follower Mirror",
    description: "X engagement analysis and content pattern suggestions",
    emoji: "📡",
    publisher: "Signal",
    category: "agents",
    featured: false,
    verified: false,
    scopes: [
      { name: "X post history", description: "Posts and engagement metrics from the last 6 months" },
      { name: "X following list", description: "Topics and accounts you follow" },
    ],
  },
  {
    id: "taste-panel",
    name: "Taste Panel",
    description: "Contribute your listening and shopping data to consumer insights research. Earn store credits.",
    emoji: "🛍",
    publisher: "Aperture Research",
    category: "earn",
    featured: false,
    verified: true,
    scopes: [
      { name: "Spotify listening history", description: "Tracks, artists, and genres from the last 12 months" },
      { name: "Shopify order history", description: "Purchase categories and frequency from the last 12 months" },
    ],
  },
  {
    id: "blueprint-research",
    name: "Blueprint Research",
    description: "Contribute your health data to longevity science. Earn a free DEXA body composition scan.",
    emoji: "🧬",
    publisher: "Blueprint",
    category: "earn",
    featured: false,
    verified: true,
    scopes: [
      { name: "Apple Health data", description: "Body composition, heart rate, and sleep data from the last 12 months" },
      { name: "Strava activities", description: "Exercise history and VO2 max estimates" },
    ],
  },
];
