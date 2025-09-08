export interface User {
    _id: string;
    name: string;
    email: string;
    isAdmin?: boolean;
    pic?: string;
    token?: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}
