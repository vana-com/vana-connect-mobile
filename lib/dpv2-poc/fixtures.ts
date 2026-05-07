import type { Dpv2PocScenario, Dpv2PocScope } from "./contracts";

export type ChatGptMemory = {
  id: string;
  content: string;
  created_at: string;
  updated_at?: string;
  type?: string;
};

export type ChatGptMemoriesEnvelope = {
  scope: Dpv2PocScope;
  collectedAt: string;
  data: {
    memories: ChatGptMemory[];
    total: number;
  };
};

const HAPPY_PATH_MEMORIES: ChatGptMemory[] = [
  {
    id: "mem_001",
    content: "Prefers concise, technical writing without filler.",
    created_at: "2026-02-04T15:21:00.000Z",
    type: "preference",
  },
  {
    id: "mem_002",
    content:
      "Working on Vana DPv2 POC: Personal Server boundary and Builder App read flow.",
    created_at: "2026-03-12T09:45:00.000Z",
    type: "project",
  },
  {
    id: "mem_003",
    content: "Uses Next.js App Router for most demo apps.",
    created_at: "2026-04-02T18:02:00.000Z",
    type: "working_style",
  },
  {
    id: "mem_004",
    content: "Likes prior-art research before designing new UI components.",
    created_at: "2026-04-19T11:30:00.000Z",
    type: "preference",
  },
];

export function getChatGptFixtureEnvelope({
  scope,
  scenario,
}: {
  scope: Dpv2PocScope;
  scenario: Dpv2PocScenario;
}): ChatGptMemoriesEnvelope {
  const memories = scenario === "empty" ? [] : HAPPY_PATH_MEMORIES;
  return {
    scope,
    collectedAt: new Date().toISOString(),
    data: {
      memories,
      total: memories.length,
    },
  };
}
