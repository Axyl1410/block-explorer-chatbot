/* eslint-disable @typescript-eslint/no-explicit-any */
import { clsx, type ClassValue } from "clsx";
import { NextResponse } from "next/server";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const createResponse = (data: any, success = true, status = 200) => {
  return NextResponse.json({ success, data }, { status });
};

export const createErrorResponse = (error: string, status = 400) => {
  return NextResponse.json({ success: false, error }, { status });
};

export const getErrorMessage = (error: unknown): string => {
  return error instanceof Error ? error.message : "Unknown error";
};

export const formatAddress = (address: string) => {
  return `${address.substring(0, 6)}...${address.substring(
    address.length - 4,
  )}`;
};

export const isAddress = (address: string) => {
  return !/^0x[a-fA-F0-9]{40}$/.test(address);
};
