export interface NodeItem {
  title: string;
  content: string;
  meta?: string;
  source?: string;
}

export const NODE_ITEMS: Record<string, NodeItem[]> = {
  vana: [
    { title: "Data vault architecture v2", content: "Revised the DLP spec to handle batch exports from LinkedIn. Edge case: org accounts.", meta: "3 days ago", source: "Notion" },
    { title: "Token model notes", content: "VanaToken.sol staking mechanic — 6mo lockup, 14% APY floor discussion.", meta: "1 week ago", source: "Notion" },
    { title: "Team offsite recap", content: "Decided to push mobile SDK to Q3. Focus on DLP UX first.", meta: "2 weeks ago", source: "Google Docs" },
    { title: "Grant application — Filecoin Foundation", content: "Storage incentives proposal, $150k ask, 3-month build.", meta: "1 month ago", source: "Notion" },
    { title: "Demo day deck", content: "Framing: 'your data is worth money, you just never see it.'", meta: "1 month ago", source: "Google Slides" },
    { title: "LinkedIn post: data ownership thread", content: "Posted the thread on why app-owned data models are broken. 14k impressions, picked up by a few VCs.", meta: "5 days ago", source: "LinkedIn" },
    { title: "Connection request: Illia Polosukhin", content: "Near Protocol founder. Accepted. Might be worth a call re: data layer synergies.", meta: "2 weeks ago", source: "LinkedIn" },
  ],
  opendatalabs: [
    { title: "ODL weekly sync", content: "Data marketplace pipeline progressing. Airtable export connector done.", meta: "2 days ago", source: "Notion" },
    { title: "Research: LLM fine-tuning dataset quality", content: "Annotator agreement scores below threshold on 18% of batches.", meta: "5 days ago", source: "GitHub" },
    { title: "Partner onboarding checklist", content: "Step 4 (data schema validation) is the main drop-off point.", meta: "1 week ago", source: "Notion" },
    { title: "Infrastructure cost review", content: "S3 egress is 40% of monthly cloud bill. Explored CloudFront offset.", meta: "2 weeks ago", source: "Notion" },
    { title: "Hiring: senior data engineer", content: "Posted the JD. 3 strong applicants from the LinkedIn post. First rounds next week.", meta: "1 week ago", source: "LinkedIn" },
  ],
  paradigm: [
    { title: "Term sheet follow-up", content: "Waiting on legal review of the pro-rata clause. Anna following up.", meta: "1 week ago", source: "Gmail" },
    { title: "Portfolio co-invest opportunity", content: "Shared the Lattice deck with Paradigm team. Positive initial signal.", meta: "3 weeks ago", source: "Gmail" },
    { title: "Matt Huang liked the post", content: "The data sovereignty thread got a like from Matt. No DM but worth flagging.", meta: "5 days ago", source: "LinkedIn" },
  ],
  lfdt: [
    { title: "DIF working group notes", content: "DIDComm v2 spec nearing stable. LFDT endorsement expected next cycle.", meta: "4 days ago", source: "Notion" },
    { title: "Hyperledger Besu compatibility", content: "Tested VanaNode against Besu 23.10. Minor ABI discrepancy in events.", meta: "2 weeks ago", source: "GitHub" },
  ],
  podcast: [
    { title: "Ep 12 — Data sovereignty in practice", content: "Guest: Kaliya Young. Recorded, in edit.", meta: "5 days ago", source: "Notion" },
    { title: "Ep 11 — The personal AI stack", content: "Published. 1.4k listens, highest yet.", meta: "2 weeks ago", source: "Substack" },
  ],
  dean: [
    { title: "Lunch at The Dolphin", content: "Talked through the YC batch dynamics and why Kunal's company is the one to watch.", meta: "Yesterday", source: "iPhone Notes" },
    { title: "Morning walk, Centennial Park", content: "He mentioned he's thinking about the move. Lot to process.", meta: "3 days ago", source: "iPhone Notes" },
    { title: "Call — late night SF/BNE timezone gap", content: "That thing about the board dynamics was news to me.", meta: "1 week ago", source: "iPhone" },
    { title: "Birthday dinner", content: "Italian place on Crown St. Good night.", meta: "3 weeks ago", source: "iPhone Photos" },
    { title: "Co-working day at Fishburners", content: "Got a lot done. His \"momentum\" framing for teams stuck with me.", meta: "1 month ago", source: "iPhone Notes" },
    { title: "LinkedIn mutual: Priya Nair", content: "He introduced me to her at YC Demo Day. She's building in the same space.", meta: "2 weeks ago", source: "LinkedIn" },
  ],
  dobbie: [
    { title: "Morning run", content: "8k loop, he set the pace. Sub-5min for the last 2k.", meta: "2 days ago", source: "Strava" },
    { title: "Text thread: travel plans", content: "He's in Lisbon in June. Might overlap with my stopover.", meta: "1 week ago", source: "iPhone" },
    { title: "Intro to Yuki at Canva", content: "Connected them on the data provenance thing. They hit it off.", meta: "3 weeks ago", source: "Gmail" },
  ],
  oreo: [
    { title: "Walk — Centennial Park loop", content: "Found a new off-leash area near the duck pond. She loved it.", meta: "Yesterday", source: "iPhone Photos" },
    { title: "Vet checkup", content: "All clear. Weight: 28kg. Next boosters in 6 months.", meta: "2 weeks ago", source: "iPhone Notes" },
    { title: "Dog beach trip", content: "Bondi. Chaos. She swam for an hour straight.", meta: "1 month ago", source: "iPhone Photos" },
  ],
  family: [
    { title: "Family group chat", content: "Mum's retirement party planning — venue shortlist to 3 options.", meta: "Today", source: "iPhone" },
    { title: "Dad's health update", content: "Post-op check was good. Walking more now.", meta: "4 days ago", source: "iPhone" },
    { title: "Video call — everyone together", content: "First time in 6 months all of us were on at once. Loud.", meta: "2 weeks ago", source: "FaceTime" },
    { title: "Flights booked — Christmas", content: "BNE→SYD Dec 23, return Jan 2.", meta: "1 month ago", source: "Gmail" },
  ],
  cz: [
    { title: "Twitter DM", content: "Short exchange about the BNB chain dev grants program.", meta: "2 months ago", source: "X / Twitter" },
  ],
  yoga: [
    { title: "Morning practice", content: "60 min vinyasa. Picked up where I left off with backbends.", meta: "Today", source: "Apple Health" },
    { title: "New studio: Modo Yoga", content: "Hot yoga class. Good instructors, better playlists.", meta: "4 days ago", source: "iPhone Notes" },
    { title: "Personal practice notes", content: "Shoulder opener sequence before inversions is working. Keep it.", meta: "1 week ago", source: "iPhone Notes" },
    { title: "Workshop: Yin + Fascia", content: "3-hr workshop at Stretch Lab. The hip meridian stuff was new.", meta: "3 weeks ago", source: "iPhone Calendar" },
  ],
  swimming: [
    { title: "Ocean swim — Bronte to Coogee", content: "2.4km. Conditions choppy. Time: 48:20.", meta: "3 days ago", source: "Strava" },
    { title: "Pool session", content: "2km continuous. Focused on bilateral breathing.", meta: "1 week ago", source: "Apple Health" },
    { title: "Signed up: Bondi Classic", content: "Open water race, 1km course. February.", meta: "3 weeks ago", source: "Gmail" },
  ],
  handstands: [
    { title: "30-day challenge progress", content: "Day 22. Freestanding holds up to 12 seconds now.", meta: "Today", source: "iPhone Notes" },
    { title: "Wall handstand: alignment notes", content: "Ears between arms. Stop letting the lower back arch.", meta: "5 days ago", source: "iPhone Notes" },
    { title: "First press to handstand attempt", content: "Not there yet. But getting the hollow body position.", meta: "2 weeks ago", source: "iPhone Notes" },
  ],
  sleep: [
    { title: "This week avg: 7h 02m", content: "Best stretch in months. No late screens after 10pm helped.", meta: "Today", source: "Apple Health" },
    { title: "Sleep experiment: no alcohol", content: "2-week trial. Deep sleep up 18%. Keeping this.", meta: "1 week ago", source: "Apple Health" },
    { title: "Apple Watch sleep data", content: "REM: 22%, Deep: 19%, Core: 51%, Awake: 8%.", meta: "2 weeks ago", source: "Apple Health" },
    { title: "Highlight: Why We Sleep", content: "'After 16 hours of being awake the brain begins to fail. Eight hours of sleep is not optional — it is non-negotiable.' — Matthew Walker", meta: "1 month ago", source: "Kindle" },
    { title: "Watched: Andrew Huberman on sleep protocols", content: "The non-sleep deep rest (NSDR) thing is worth trying. 10 min after lunch.", meta: "3 weeks ago", source: "YouTube" },
  ],
  crochet: [
    { title: "WIP: market bag pattern", content: "Row 34 of 60. The chevron stripe is working. Yarn: Paintbox Simply DK.", meta: "Yesterday", source: "iPhone Notes" },
    { title: "Finished: beanie for Dean", content: "Moss stitch, charcoal grey. Took about 4 evenings.", meta: "2 weeks ago", source: "iPhone Photos" },
    { title: "Pattern collection", content: "156 saved. 12 rated 5 stars. Actually made: 9.", meta: "Ongoing", source: "Ravelry" },
    { title: "Yarn haul — Lincraft", content: "Merino DK in terracotta and cream. And some cotton for summer.", meta: "1 month ago", source: "iPhone Notes" },
    { title: "Watched: Tunisian entrelac tutorial", content: "Finally makes sense. The turning chain is the key I was missing.", meta: "2 days ago", source: "YouTube" },
    { title: "Watched: finishing seams without sewing", content: "Slip stitch join method. Game changer for the market bag.", meta: "1 week ago", source: "YouTube" },
    { title: "Highlight: The Gentle Art of Japanese Welcoming", content: "The chapter on boro (patching) reframed imperfection as accumulation of care.", meta: "3 weeks ago", source: "Kindle" },
  ],
  "music-rec": [
    { title: "Playlist: late work sessions", content: "Floating Points, Four Tet, Nils Frahm. 3h 22m.", meta: "Updated this week", source: "Spotify" },
    { title: "Record: Burial — Untrue", content: "Revisited. Still one of the best things ever made.", meta: "5 days ago", source: "Spotify" },
    { title: "Shazam: that café track", content: "Khruangbin — Lady and Man. Added to rotation.", meta: "2 weeks ago", source: "Shazam" },
    { title: "Watched: 4 Producers Make A Beat From Scratch", content: "YouTube. Came for the drums, stayed for the argument about sample clearance.", meta: "3 days ago", source: "YouTube" },
    { title: "Watched: Burial — a documentary", content: "Fan-made but surprisingly good. Reinforces that the mystique is part of the art.", meta: "1 week ago", source: "YouTube" },
  ],
  writing: [
    { title: "Essay draft: on legibility", content: "Working title: 'What gets measured.' Arguing against the quantified self by way of Scott and Meadows.", meta: "3 days ago", source: "Notion" },
    { title: "Newsletter issue #14", content: "Sent. 847 opens, 62 replies — best engagement yet.", meta: "1 week ago", source: "Substack" },
    { title: "Shortlist: Substack vs personal site", content: "Leaning toward keeping both. Different voices.", meta: "3 weeks ago", source: "iPhone Notes" },
    { title: "Highlight: Thinking in Systems", content: "'A system is more than the sum of its parts. It may exhibit adaptive, dynamic, goal-seeking, self-preserving behavior.' — Meadows", meta: "2 weeks ago", source: "Kindle" },
    { title: "Highlight: The Dispossessed", content: "'You can't crush ideas by suppressing them. You can only crush them by ignoring them.' — Le Guin", meta: "3 weeks ago", source: "Kindle" },
    { title: "Watched: George Saunders on short fiction", content: "MasterClass clip. His point about 'the story knows more than the writer' stuck.", meta: "4 days ago", source: "YouTube" },
    { title: "Watched: Joan Didion documentary", content: "The Center Will Not Hold. Watched twice. The bit about self-respect essay is the whole thing.", meta: "2 weeks ago", source: "YouTube" },
  ],
  brisbane: [
    { title: "Lease renewal — West End", content: "Signed 12-month extension. Rent held, small win.", meta: "2 weeks ago", source: "Gmail" },
    { title: "Favourite spots doc", content: "Eat: Gauge, Julius, Honto. Coffee: Campos, Fonzie Abbott.", meta: "Ongoing", source: "Apple Maps" },
    { title: "Photo: New Farm riverbank", content: "Shot on the X100VI. Golden hour was perfect.", meta: "1 month ago", source: "iPhone Photos" },
  ],
  nyc: [
    { title: "Trip: March 14–22", content: "Staying in Williamsburg. Agenda: meetings Mon–Wed, free Thurs–Sun.", meta: "Upcoming", source: "Notion" },
    { title: "Saved: Lucali, Frankie's 457, Superiority Burger", content: "All in Brooklyn. This is going to be a food trip.", meta: "Last visited: 2 yrs ago", source: "Apple Maps" },
    { title: "Museums shortlist", content: "The Shed, ICP (if there's a show), Morgan Library.", meta: "", source: "iPhone Notes" },
  ],
  "timor-leste": [
    { title: "2023 trip notes", content: "Dili → Atauro Island → Baucau. Rent a motorbike for the east coast route.", meta: "2023", source: "iPhone Notes" },
    { title: "Contact: Ana at FONGTIL", content: "She runs the digital literacy programs in Dili. Stay in touch.", meta: "Met 2023", source: "iPhone" },
  ],
  house: [
    { title: "Maintenance list", content: "Kitchen tap dripping — plumber booked for Thursday. Gutters need clearing before wet season.", meta: "Active", source: "iPhone Notes" },
    { title: "Photo: living room repaint", content: "Finally did the feature wall. Raw umber, Haymes.", meta: "3 weeks ago", source: "iPhone Photos" },
    { title: "Garden notes", content: "Lemon tree fruiting well. Basil died again. Try grow bags next time.", meta: "Ongoing", source: "iPhone Notes" },
  ],
  karma: [
    { title: "The running tally", content: "Some things you can't quantify.", meta: "Always", source: "iPhone Notes" },
  ],
};
