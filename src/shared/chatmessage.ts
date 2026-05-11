import * as z from 'zod';
export type Name = string;
// user session messages
//  This is the core part between server and browser.
// It defines every message that can travel over WebSocket using Zod schemas.
/*
login client → server register a username
call  client → server initiate a call to someone
accept client → server accept an incoming call 
logout client → server disconnect
*/
export type ChatMessage =
  | { type: 'login'; data: { name: Name } }
  | { type: 'call'; data: { name: Name } }
  | { type: 'accept'; data: { name: Name } }
  | {
      type: 'direct-message';
      data: {
        to?: Name;
        from?: Name;
        content: string;
        conversationId?: number;
        sentAt?: string;
      };
    }
  | { type: 'logout' };

const nameSchema = z.string();
const loginSchema = z.object({
  type: z.literal('login'),
  data: z.object({ name: nameSchema }),
});
const callSchema = z.object({
  type: z.literal('call'),
  data: z.object({ name: nameSchema }),
});
const acceptSchema = z.object({
  type: z.literal('accept'),
  data: z.object({ name: nameSchema }),
});
const logoutSchema = z.object({ type: z.literal('logout') });
const directMessageSchema = z.object({
  type: z.literal('direct-message'),
  data: z.object({
    to: nameSchema.optional(),
    from: nameSchema.optional(),
    content: z.string().min(1),
    conversationId: z.number().optional(),
    sentAt: z.string().optional(),
  }),
});

export const ChatMessageSchema = z.discriminatedUnion('type', [
  loginSchema,
  callSchema,
  acceptSchema,
  logoutSchema,
  directMessageSchema,
]);
