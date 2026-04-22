export type ClusterItemType = "text" | "image" | "link" | "audio";

export interface ClusterItem {
  id: string;
  type: ClusterItemType;
  title: string;
  content: string;
  meta?: string;
}

export interface Cluster {
  id: string;
  title: string;
  summary: string;
  itemCount: number;
  sourceLabel: string;
  previewItems: ClusterItem[];
  items: ClusterItem[];
}

export const CLUSTERS: Cluster[] = [
  {
    id: "music-q1-2026",
    title: "Music taste, Q1 2026",
    summary: "Heavy rotation: ambient, jazz-hop, and a surprising amount of 2000s R&B",
    itemCount: 847,
    sourceLabel: "Spotify",
    previewItems: [
      { id: "m1", type: "audio", title: "Weightless", content: "Marconi Union", meta: "847 plays" },
      { id: "m2", type: "audio", title: "Jazzmatazz Vol. 1", content: "Guru", meta: "412 plays" },
      { id: "m3", type: "audio", title: "Elevators", content: "OutKast", meta: "389 plays" },
    ],
    items: [
      { id: "m1", type: "audio", title: "Weightless", content: "Marconi Union", meta: "847 plays" },
      { id: "m2", type: "audio", title: "Jazzmatazz Vol. 1", content: "Guru", meta: "412 plays" },
      { id: "m3", type: "audio", title: "Elevators", content: "OutKast", meta: "389 plays" },
      { id: "m4", type: "audio", title: "Empty Streets", content: "Late Night Alumni", meta: "301 plays" },
      { id: "m5", type: "audio", title: "Since I Left You", content: "The Avalanches", meta: "278 plays" },
      { id: "m6", type: "audio", title: "Midnight City", content: "M83", meta: "255 plays" },
    ],
  },
  {
    id: "nyc-trip",
    title: "NYC trip planning",
    summary: "Flights, restaurants, and 14 saved neighborhoods. Mostly Brooklyn",
    itemCount: 63,
    sourceLabel: "Notion",
    previewItems: [
      { id: "n1", type: "link", title: "Lucali", content: "lucali.com", meta: "Carroll Gardens" },
      { id: "n2", type: "text", title: "Arrive JFK 6:40pm", content: "Mar 14, Delta 412", meta: "" },
      { id: "n3", type: "link", title: "Wythe Hotel", content: "wythehotel.com", meta: "Williamsburg" },
    ],
    items: [
      { id: "n1", type: "link", title: "Lucali", content: "lucali.com", meta: "Carroll Gardens" },
      { id: "n2", type: "text", title: "Arrive JFK 6:40pm", content: "Mar 14, Delta 412", meta: "" },
      { id: "n3", type: "link", title: "Wythe Hotel", content: "wythehotel.com", meta: "Williamsburg" },
      { id: "n4", type: "text", title: "Smorgasburg", content: "Every Saturday, 11am-6pm, Williamsburg", meta: "" },
      { id: "n5", type: "link", title: "MoMA", content: "moma.org", meta: "Midtown" },
    ],
  },
  {
    id: "books-systems",
    title: "Books about systems",
    summary: "Highlights from 11 books. Lots of Meadows, some Kauffman, one Hofstadter",
    itemCount: 214,
    sourceLabel: "Kindle",
    previewItems: [
      { id: "b1", type: "text", title: "Thinking in Systems", content: "A system is a set of elements interconnected in such a way that they produce their own pattern of behavior over time.", meta: "Donella Meadows" },
      { id: "b2", type: "text", title: "Godel Escher Bach", content: "In the long run, every program becomes rococo, then rubble.", meta: "Hofstadter" },
      { id: "b3", type: "text", title: "The Origins of Order", content: "Order for free arises when systems are poised near the edge of chaos.", meta: "Kauffman" },
    ],
    items: [
      { id: "b1", type: "text", title: "Thinking in Systems", content: "A system is a set of elements interconnected in such a way that they produce their own pattern of behavior over time.", meta: "Donella Meadows" },
      { id: "b2", type: "text", title: "Godel Escher Bach", content: "In the long run, every program becomes rococo, then rubble.", meta: "Hofstadter" },
      { id: "b3", type: "text", title: "The Origins of Order", content: "Order for free arises when systems are poised near the edge of chaos.", meta: "Kauffman" },
      { id: "b4", type: "text", title: "Seeing Like a State", content: "Legibility is a condition of manipulation.", meta: "James C. Scott" },
    ],
  },
  {
    id: "side-projects",
    title: "Ongoing side projects",
    summary: "Three active, two dormant. The dormant ones still feel important",
    itemCount: 38,
    sourceLabel: "GitHub",
    previewItems: [
      { id: "s1", type: "link", title: "hoe-kemon", content: "github.com/user/hoe-kemon", meta: "Last commit 3 days ago" },
      { id: "s2", type: "text", title: "vana-connect notes", content: "Permission modal needs work. QR flow not tested on Android.", meta: "" },
      { id: "s3", type: "link", title: "art-xyz", content: "github.com/user/art-xyz", meta: "Last commit 12 days ago" },
    ],
    items: [
      { id: "s1", type: "link", title: "hoe-kemon", content: "github.com/user/hoe-kemon", meta: "Last commit 3 days ago" },
      { id: "s2", type: "text", title: "vana-connect notes", content: "Permission modal needs work. QR flow not tested on Android.", meta: "" },
      { id: "s3", type: "link", title: "art-xyz", content: "github.com/user/art-xyz", meta: "Last commit 12 days ago" },
      { id: "s4", type: "text", title: "font rendering note", content: "Cofo Sans renders heavier on Windows Chrome at 13.5px. Investigate.", meta: "" },
    ],
  },
  {
    id: "health-sleep",
    title: "Health and sleep patterns",
    summary: "Average 6.8 hours. Better than last quarter. Still not enough",
    itemCount: 180,
    sourceLabel: "Apple Health",
    previewItems: [
      { id: "h1", type: "text", title: "Avg sleep this month", content: "6h 48m per night", meta: "+22m vs last month" },
      { id: "h2", type: "text", title: "Resting heart rate", content: "54 bpm", meta: "7-day avg" },
      { id: "h3", type: "text", title: "Steps this week", content: "47,203 steps", meta: "6,743/day avg" },
    ],
    items: [
      { id: "h1", type: "text", title: "Avg sleep this month", content: "6h 48m per night", meta: "+22m vs last month" },
      { id: "h2", type: "text", title: "Resting heart rate", content: "54 bpm", meta: "7-day avg" },
      { id: "h3", type: "text", title: "Steps this week", content: "47,203 steps", meta: "6,743/day avg" },
      { id: "h4", type: "text", title: "VO2 max", content: "42.1 mL/kg/min", meta: "Above average" },
    ],
  },
  {
    id: "substack-reads",
    title: "Substack reads",
    summary: "14 subscriptions. Actually read 6 of them. Owed money to approximately none",
    itemCount: 127,
    sourceLabel: "Substack",
    previewItems: [
      { id: "su1", type: "link", title: "Interconnected", content: "interconnected.org", meta: "Matt Webb" },
      { id: "su2", type: "link", title: "Dirt", content: "dirt.fyi", meta: "Kyle Chayka" },
      { id: "su3", type: "link", title: "The Convivial Society", content: "theconvivialsociety.substack.com", meta: "L.M. Sacasas" },
    ],
    items: [
      { id: "su1", type: "link", title: "Interconnected", content: "interconnected.org", meta: "Matt Webb" },
      { id: "su2", type: "link", title: "Dirt", content: "dirt.fyi", meta: "Kyle Chayka" },
      { id: "su3", type: "link", title: "The Convivial Society", content: "theconvivialsociety.substack.com", meta: "L.M. Sacasas" },
      { id: "su4", type: "link", title: "Garbage Day", content: "garbageday.email", meta: "Ryan Broderick" },
    ],
  },
];
