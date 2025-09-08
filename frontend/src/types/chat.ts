import type { User } from "./auth"

export interface Chat {
    _id: string;
    users: User[];
    latestMessage?: {
        id: string;
        text: string;
        createdAt: string;
    };
    createdAt: string;
    updatedAt: string;
}
