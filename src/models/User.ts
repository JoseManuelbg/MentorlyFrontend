export interface User{
    id: number;
    email: string;
    name: string;
    username: string;
role: Array<{ name: string }> | string[];
    active: number;
}