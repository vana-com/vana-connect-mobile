export type DemoJson =
  | string
  | number
  | boolean
  | null
  | DemoJson[]
  | { [key: string]: DemoJson };

export type AccountActionExchangeResult = {
  ok: true;
  result: Record<string, DemoJson>;
};

export type AccountActionError = {
  error: string;
  details?: DemoJson;
};

export type DemoSession = {
  subject: string;
  vanaUserId: string | null;
  issuer: string | null;
  audience: string[];
  scope: string[];
  clientId: string;
  nonceVerified: boolean | null;
  tokenType: string | null;
  hasAccessToken: boolean;
  hasRefreshToken: boolean;
  userInfo: Record<string, DemoJson> | null;
  issuedAt: string;
};
