import { apiRequest } from "./apiRequest";

export async function createSession(
  title = "Smart Contract Explorer",
): Promise<string> {
  const response = await apiRequest("/session", "POST", { title });
  return response.result.id;
}

export async function queryContract(
  contractAddress: string,
  chainId: number,
  sessionId: string,
): Promise<string> {
  const message = `
    Give me the details of this contract and provide a structured list of all functions available in the smart contract deployed at address ${contractAddress} on chain ${chainId}. The response must strictly follow this format:

    ### Contract Details:
    - **Name:** <contractName>
    - **Address:** <contractAddress>
    - **Chain ID:** <chainId>
    - **Blockchain:** <blockchainName>

    ### Read-only Functions:
    1. **\`<functionName(parameters)\`**
       - **Returns:** <returnType>
       - **Description:** <brief description>

    ### Write-able Functions:
    1. **\`<functionName(parameters)\`**
       - **Returns:** <returnType>
       - **Description:** <brief description>
       - **Payable:** <true/false>
       - **Parameters:** <parameterName> <parameterType> <parameterDescription>

    If no functions exist in a category, include "None available." Ensure accuracy and conciseness.
  `.trim();

  const requestBody = {
    message,
    session_id: sessionId,
    context_filter: {
      chain_ids: [chainId.toString()],
      contract_addresses: [contractAddress],
    },
  };
  const response = await apiRequest("/chat", "POST", requestBody);
  return response.message;
}

export async function handleUserMessage(
  userMessage: string,
  sessionId: string,
  chainId: number,
  contractAddress: string,
): Promise<string> {
  const response = await apiRequest("/chat", "POST", {
    message: userMessage,
    session_id: sessionId,
    context_filter: {
      chain_ids: [chainId.toString()],
      contract_addresses: [contractAddress],
    },
  });
  return response.message;
}

export async function handleGeneralUserMessage(
  userMessage: string,
  sessionId: string,
): Promise<string> {
  const response = await apiRequest("/chat", "POST", {
    message: userMessage,
    session_id: sessionId,
  });
  return response.message;
}
