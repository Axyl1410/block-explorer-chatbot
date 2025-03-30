import { createThirdwebClient } from "thirdweb";

const clientId = process.env.NEXT_PUBLIC_TEMPLATE_CLIENT_ID;
const secretKey = process.env.NEBULA_SECRET_KEY;

if (!clientId) {
  throw new Error("Missing environment variables");
}

export default createThirdwebClient(secretKey ? { secretKey } : { clientId });
