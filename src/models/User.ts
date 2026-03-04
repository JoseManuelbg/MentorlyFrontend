export interface User{
    id: number;
    email: string;
    name: string;
    username: string;
roles: Array<{ name: string }> | string[];
    active: number;
}