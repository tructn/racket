/// <reference types="vite/client" />
interface ImportMetaEnv {
    readonly VITE_API_URL: string;
    readonly VITE_AUTH0_DOMAIN: string;
    readonly VITE_AUTH0_CLIENTID: string;
    readonly VITE_AUTH0_AUDIENCE: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}