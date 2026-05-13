import type { Request, Response } from 'express';
import { sendResponse } from '../../shared/apiResponse';
import { AppError } from '../units/app.errors';
import * as repo from '../repositories/chat.repository';
import * as connrepo from '../repositories/conn.repository';

import type { Conversation } from '../../shared/types';
import { getSenderId } from '../units/reqSender';
import type {
  ConversationSchema,
  FetchConversationSchema,
  SendConversationMessageSchema,
} from '../schemas/chat.schema';

export const createConversation = (req: Request, res: Response) => {
  const sender_id = getSenderId(req);
  const receiver_id = Number((req.body as ConversationSchema).user2_id);
  const result = repo.getOrCreateConversation(sender_id, receiver_id);
  sendResponse(res, 200, result, 'Record has been processed successfully');
};

export const fetchConversations = (req: Request, res: Response) => {
  const rows = repo.fetchConversations(req.body as FetchConversationSchema);
  if (!rows || rows.length === 0) throw new AppError('Request failed');

  const result: Conversation = {
    id: rows[0]!.conversation_id,
    messages: [],
    updated_at: rows[0]!.updated_at,
  };
  for (const row of rows) {
    if (row.message_id) {
      result.messages.push({
        id: row.message_id,
        sender_id: row.sender_id,
        type: row.type,
        content: row.content,
        created_at: row.created_at,
      });
    }
  }
  result.messages.reverse();
  sendResponse(res, 200, result, 'Conversation fetched');
};

export const sendConversationMessages = (req: Request, res: Response) => {
  const sender_id = getSenderId(req);
  const convoExist = connrepo.conversationExists((req.body as SendConversationMessageSchema).conversation_id);
  if (!convoExist) {
    throw new AppError("Sorry, Can't Sent Message Conversation Does Not Exists", 404);
  }
  const result = repo.sendConversationMessages(sender_id, req.body as SendConversationMessageSchema);
  sendResponse(res, 200, result, 'Message is sent Successfully');
};

export const fetchAllConversations = (req: Request, res: Response) => {
  const sender_id = getSenderId(req);
  const result = repo.fetchAllConversations(sender_id);
   
  sendResponse(res, 200, result, 'Records has been fetched successfully');
};

export const fetchP2PConversations = (req: Request, res: Response) => {
  const user1_id = getSenderId(req);
  const result = repo.fetchP2PConversations(user1_id, req.query as ConversationSchema);
  sendResponse(res, 200, result, 'Records has been fetched successfully');
};
