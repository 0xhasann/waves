import jwt from 'jsonwebtoken';

export type User = {
  id: number;
  username: string | null;
  google_id: string | null;
  provider: string;
  user_pass: string;
  mobile_no: string | null;
  email_id: string | null;
  avatar_url: string | null;
  first_name: string | null;
  last_name: string | null;
  last_chat?: string;
  created_at: string | null;
  updated_at: string | null;
};

export const RequestStatus = {
  pending: 'pending',
  accepted: 'accepted',
  rejected: 'rejected',
} as const;

export type FriendRow = {
  id: number;
};

export type RequestStatus = (typeof RequestStatus)[keyof typeof RequestStatus];

export type Message = {
  id: number;
  sender_id: number;
  type: string;
  content: string;
  created_at: string;
};

export type Conversation = {
  id: number;
  messages: Message[];
  updated_at: string;
};

export type JwtUser = jwt.JwtPayload & {
  userId: number;
};

export type Conversations = {
  peer_id: number;
  username: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;

  conversation_id: number;

  last_message: string | null;
  type: 'text' | 'image' | 'video' | null;
  sender_id: number | null;
  updated_at: string | null;
};

export type MessageDTO = {
  // message info
  id: number;
  content: string;
  type: 'text' | 'image' | 'video';
  sender_id: number;
  updated_at: string | null;

  // user2_id info
  peer_id: number;
  username: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
};

export type SearchConversations = {
  peer_id?: number;
  id?: number;

  username: string;

  first_name?: string;
  last_name?: string;

  avatar_url?: string;

  conversation_id?: number;

  last_message?: string;

  updated_at?: string;

  sender_id?: number;

  type?: string;
};

export type PendingFriendRequests = {
  id: number;

  sender_id: number;

  receiver_id: number;

  status: 'pending' | 'accepted' | 'rejected';

  created_at: string;

  username: string;

  first_name?: string;

  last_name?: string;

  avatar_url?: string;
};

export type FetchConversationsResponse = {
  conversation_id: number;
  updated_at: string;
  message_id: number;
  sender_id: number;
  type: string;
  content: string;
  created_at: string;
};

export type UserMeta = {
  id: number;
  username: string;
  full_name: string;
};

export type Users = {
  id: number;
  username: string;
};
