export interface AccountConnectedExternal {
  provider?: string | null;
  emailAddress?: string | null;
  username?: string | null;
}

export interface AccountEmailAddress {
  emailAddress?: string | null;
}

export interface AccountUser {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
  imageUrl?: string | null;
  primaryEmailAddress?: AccountEmailAddress | null;
  externalAccounts?: AccountConnectedExternal[];
  createdAt?: unknown;
  updatedAt?: unknown;
  update?: (payload: {
    firstName?: string;
    lastName?: string;
  }) => Promise<unknown>;
  updatePassword?: (payload: {
    currentPassword: string;
    newPassword: string;
  }) => Promise<unknown>;
  setProfileImage?: (payload: { file: File | null }) => Promise<unknown>;
  delete?: () => Promise<unknown>;
}
