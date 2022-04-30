export async function testservice(test:any){
    test = 'dummy test'
    return {
        data:{name:test},
        message:"test"
    }
}