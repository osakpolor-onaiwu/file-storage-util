
export function jsonS (res:any, message:any, data:any) {
    res.status(200).json({
        status: "success",
        message: message,
        data: data,
    })
}

