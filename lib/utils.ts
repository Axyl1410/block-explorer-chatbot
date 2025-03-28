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

// Error response utility function
export const createErrorResponse = (message: string, status = 400) => {
  return NextResponse.json({ success: false, message }, { status });
};

export const getErrorMessage = (error: unknown): string => {
  return error instanceof Error ? error.message : "Unknown error";
};
