export class BlockedError extends Error {
  constructor() {
    super("USER_BLOCKED");
    this.name = "BlockedError";
  }
}

export function assertNotBlocked(user: {
  id: string;
  is_blocked?: boolean | null;
}): void {
  if (user?.is_blocked === true) throw new BlockedError();
}
