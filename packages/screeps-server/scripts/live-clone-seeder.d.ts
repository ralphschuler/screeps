export function buildSeedLiveCloneCommand(options: any, snapshot: any): string;
export function buildEnsureLiveCloneAuthCommand(options: any): string;
export function seedLiveCloneSnapshot(options: any, summary: any, cliEval: (command: string) => Promise<string>): Promise<void>;
export function ensureLiveCloneAuth(options: any, summary: any, cliEval: (command: string) => Promise<string>): Promise<void>;
