declare namespace NodeJS {
  export interface ProcessEnv {
    /** 서버에서만 사용하는 환경 변수 */
    readonly SERVER_VAR_1: string;

    /** 서버와 클라이언트에서 모두 사용하는 환경 변수 */
    readonly NEXT_PUBLIC_VAR_1: string;
  }
}
