import type { User } from "./auth";

export interface Chat {
    _id: string;
    chatName: string;
    isGroupChat: boolean;
    users: User[];
    groupAdmin?: User; // present only in group chats
    latestMessage?: {
        id: string;
        text: string;
        createdAt: string;
    };
    createdAt: string;
    updatedAt: string;
}
