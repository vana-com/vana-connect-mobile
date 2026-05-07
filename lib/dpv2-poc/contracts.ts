export const DPV2_POC_DATASET = "chatgpt-demo" as const;
export const DPV2_POC_HANDLE_VERSION = 1 as const;
export const DPV2_POC_DEFAULT_SCOPE = "chatgpt.memories" as const;

export type Dpv2PocScope = "chatgpt.memories" | "chatgpt.conversations";

export type Dpv2PocScenario = "happy_path" | "empty" | "expired" | "revoked";

export type Dpv2PocTypedError =
  | "ps_unavailable"
  | "not_seeded"
  | "grant_revoked"
  | "fee_required"
  | "grant_invalid"
  | "scope_not_allowed"
  | "invalid_demo_data_handle";

export type Dpv2DemoDataHandlePayload = {
  version: typeof DPV2_POC_HANDLE_VERSION;
  dataset: typeof DPV2_POC_DATASET;
  scope: Dpv2PocScope;
  ownerSub: string;
  scenario: Dpv2PocScenario;
  issuedAt: string;
  expiresAt: string;
  nonce: string;
};

export type Dpv2PsIngressRequest = {
  scope: Dpv2PocScope;
  scenario?: Dpv2PocScenario;
};

export type Dpv2PsIngressResponse = {
  ok: true;
  psUrl: string;
  scope: Dpv2PocScope;
  ownerSub: string;
  demoDataHandle: string;
  handlePayload: Dpv2DemoDataHandlePayload;
};

export type Dpv2PaymentReceipt = {
  paymentId: string;
  requestId: string;
  grantId: string;
  scope: Dpv2PocScope;
  status: "reserved";
  issuedAt: string;
  expiresAt: string;
};

export type Dpv2BuilderFetchRequest = {
  grantId: string;
  psUrl: string;
  scope: Dpv2PocScope;
  demoDataHandle: string;
  requestId?: string;
  paymentReceipt?: Dpv2PaymentReceipt;
};

export type Dpv2PsReadRequest = {
  grantId: string;
  scope: Dpv2PocScope;
  demoDataHandle: string;
  requestId: string;
  paymentReceipt?: Dpv2PaymentReceipt;
};

export type Dpv2PsReadSuccess<TData = unknown> = {
  ok: true;
  scope: Dpv2PocScope;
  data: TData;
  accessEvent: {
    accessEventId: string;
    grantId: string;
    scope: Dpv2PocScope;
    requestId: string;
    occurredAt: string;
  };
};

export type Dpv2PsReadFailure = {
  ok: false;
  error: Dpv2PocTypedError;
  message: string;
  status: number;
};

export type Dpv2PsReadResponse<TData = unknown> =
  | Dpv2PsReadSuccess<TData>
  | Dpv2PsReadFailure;

export type Dpv2NormalizedActionExchange = {
  grantId: string;
  psUrl: string;
  scopes: Dpv2PocScope[];
  raw: Record<string, unknown>;
};

export function isDpv2PocScope(value: unknown): value is Dpv2PocScope {
  return value === "chatgpt.memories" || value === "chatgpt.conversations";
}

