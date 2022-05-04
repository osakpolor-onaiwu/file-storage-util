const handlefile =(req:any, res:any, next:any) =>{
    try {
        console.log(req)
        return next()
    } catch (error:any) {
        throw error
    }
}


export default handlefile;