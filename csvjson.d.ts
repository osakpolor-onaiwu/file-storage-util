declare module 'csvjson' {
    function toObject(data:any, options?:object);
    function toArray(data:any, options?:object);
    function toSchemaObject(data:any, options?:object);
    function toCSV (data:any, options?:object);
    function toColumnArray (data:any, options?:object);
    export default csvjson = {
        toCSV,
        toArray,
        toObject,
        toColumnArray,
        toSchemaObject
    }
}
  