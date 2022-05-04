export interface responseInterface {
    status?: string;
    message: string;
    data: any;
}

export function jsonS (res:any, message:string, data:any) {
    res.status(200).json({
        status: "success",
        message: message,
        data: data,
    })
}

