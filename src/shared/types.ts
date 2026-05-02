export type CreateUserInput = {
    email?: string;
    password: string;
    username: string;
    first_name?: string | null;
    last_name?: string | null;
    avatar_url?: string | null;
    mobile_no?: string | null;
};

export type User = {
    id: number;
    username: string;
    user_pass: string;
    email_id?: string | null;
    mobile_no?: string | null;
};