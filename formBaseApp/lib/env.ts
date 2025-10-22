// src/lib/env.ts
export const ENV = {
    API_BASE: "https://comp2140a3.uqcloud.net/api" as string,
    API_JWT:  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic3R1ZGVudCIsInVzZXJuYW1lIjoiczQ4MzAxNDAifQ.8ps5b27sEWxbqk_fVt1GKlGJKwkJbSATjHXG7fuZezc" as string,
    VITE_USERNAME:"s4830140" as string
  };
  
  if (!ENV.API_BASE) console.warn('[env] VITE_API_BASE is not set');
  if (!ENV.API_JWT)  console.warn('[env] VITE_API_JWT is not set');
  
