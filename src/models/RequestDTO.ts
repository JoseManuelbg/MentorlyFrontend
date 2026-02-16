export default interface RequestDTO{
    id: number,
    idStudent: number,
    idAvailability: number, 
    status: Status,
    appointmentTime: string
}

export type Status = "ACCEPTED" | "PENDING" | "REJECTED"