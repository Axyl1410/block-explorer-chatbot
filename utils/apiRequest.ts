/* eslint-disable @typescript-eslint/no-explicit-any */
const API_BASE_URL = "https://nebula-api.thirdweb.com";
const NEBULA_SECRET_KEY = process.env.NEBULA_SECRET_KEY;

if (!NEBULA_SECRET_KEY) {
  throw new Error("SECRET_KEY is not defined");
}

export async function apiRequest(
  endpoint: string,
  method: string,
  body: any = {},
): Promise<any> {
  const response = await fetch(API_BASE_URL + endpoint, {
    method,
    headers: {
      "Content-Type": "application/json",
      "x-secret-key": NEBULA_SECRET_KEY as string,
    },
    body: Object.keys(body).length ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("API Response Error:", errorText);
    throw new Error(`API Error: ${response.statusText}`);
  }
  return response.json();
}
