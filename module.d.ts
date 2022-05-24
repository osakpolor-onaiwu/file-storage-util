// intellisense for process.env
declare namespace NodeJS {
  export interface ProcessEnv {
    DB_HOST: string;
    DB_NAME: string;
    SALT_ROUNDS: string;
    TOKEN_SECRET: string;
    REDIS_PORT: string;
  }
}