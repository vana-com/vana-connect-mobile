import type { Dpv2PocScenario, Dpv2PocScope } from "./contracts";

export type ChatGptMemory = {
  id: string;
  text: string;
  createdAt: string;
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
    text: "Prefers concise, technical writing without filler.",
    createdAt: "2026-02-04T15:21:00.000Z",
  },
  {
    id: "mem_002",
    text: "Working on Vana DPv2 POC: Personal Server boundary and Builder App read flow.",
    createdAt: "2026-03-12T09:45:00.000Z",
  },
  {
    id: "mem_003",
    text: "Lives in NYC; uses Next.js App Router for most demo apps.",
    createdAt: "2026-04-02T18:02:00.000Z",
  },
  {
    id: "mem_004",
    text: "Likes prior-art research before designing new UI components.",
    createdAt: "2026-04-19T11:30:00.000Z",
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
