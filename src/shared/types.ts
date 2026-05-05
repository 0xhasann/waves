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

export type Message = {
  id: number;
  sender_id: number;
  type: "text";
  content: string;
  created_at: string;
};

export type Conversation = {
  id: number;
  messages: Message[];
  updated_at: string;
};

export type FetchConversationsResponse = {
  conversations: Conversation[];
};

export type Row = {
  conversation_id: number;
  updated_at: string;
  message_id: number | null;
  sender_id: number | null;
  type: string | null;
  content: string | null;
  created_at: string | null;
};