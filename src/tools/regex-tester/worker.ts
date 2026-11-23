import {
  replaceRegex,
  testRegex,
  type RegexReplaceResult,
  type RegexSearchResult,
} from "./logic";

export interface RegexWorkerRequest {
  readonly id: number;
  readonly pattern: string;
  readonly flags: string;
  readonly input: string;
  readonly replacement: string;
}

export interface RegexWorkerResponse {
  readonly id: number;
  readonly search: RegexSearchResult;
  readonly replaced: RegexReplaceResult | null;
}

const scope = self as unknown as {
  onmessage: ((event: MessageEvent<RegexWorkerRequest>) => void) | null;
  postMessage: (message: RegexWorkerResponse) => void;
};

scope.onmessage = (event) => {
  const { id, pattern, flags, input, replacement } = event.data;
  const search = testRegex(pattern, flags, input);
  const replaced = search.ok ? replaceRegex(pattern, flags, input, replacement) : null;
  scope.postMessage({ id, search, replaced });
};
