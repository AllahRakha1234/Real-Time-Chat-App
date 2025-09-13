import type { User } from "@/types/auth";

export const getReceiverUserName = (
    loggedUser: User,
    users: User[]
): string => {
    const otherUser = users.find((u) => u._id !== loggedUser._id);
    return otherUser ? otherUser.name : "";
};


export const getReceiverUser = (loggedUser: User, users: User[]): User | null => {
    return users.find((u) => u._id !== loggedUser._id) || null;
};
