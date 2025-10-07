import type { User } from "./auth";
import type { Chat } from "./chat";

export interface Message {
    sender: User;
    content: string;
    chat: Chat;
    createdAt: string;
    updatedAt: string;
    _id: string;
}