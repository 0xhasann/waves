export type User = {
    id: number;
    username: string;
    user_pass: string;
    mobile_no: string | null;
    email_id: string | null;
    avatar_url: string | null;
    first_name: string | null;
    last_name: string | null;
    created_at: string | null;
    updated_at: string | null;
};

export const RequestStatus = {
    pending: "pending",
    accepted: "accepted",
    rejected: "rejected",
} as const;
export interface FriendRow {
  id: number;
}
export type RequestStatus = typeof RequestStatus[keyof typeof RequestStatus];