import type { Response } from "express";

// Error Keys System
export const ERROR_KEYS = {
	AUTH_REQUIRED: "AUTH_REQUIRED",
	AUTH_INVALID: "AUTH_INVALID",
	VALIDATION_FAILED: "VALIDATION_FAILED",
	NOT_FOUND: "NOT_FOUND",
	SERVER_ERROR: "SERVER_ERROR",
} as const;

export const ERROR_MESSAGES = {
	[ERROR_KEYS.AUTH_REQUIRED]: "Authentication required",
	[ERROR_KEYS.AUTH_INVALID]: "Invalid authentication",
	[ERROR_KEYS.VALIDATION_FAILED]: "Invalid request data",
	[ERROR_KEYS.NOT_FOUND]: "Resource not found",
	[ERROR_KEYS.SERVER_ERROR]: "Internal server error",
};

export const ERROR_STATUS_CODES = {
	[ERROR_KEYS.AUTH_REQUIRED]: 401,
	[ERROR_KEYS.AUTH_INVALID]: 401,
	[ERROR_KEYS.VALIDATION_FAILED]: 400,
	[ERROR_KEYS.NOT_FOUND]: 404,
	[ERROR_KEYS.SERVER_ERROR]: 500,
};

export interface ErrorResponse {
	error: string;
	code: string;
	message: string;
	timestamp: string;
	details?: { [key: string]: unknown };
}

export class AppError extends Error {
	constructor(
		public errorKey: keyof typeof ERROR_KEYS,
		message?: string,
		public details?: { [key: string]: unknown },
	) {
		super(message || ERROR_MESSAGES[errorKey]);
		this.name = "AppError";
	}
}

export const sendError = (
	res: Response,
	errorKey: keyof typeof ERROR_KEYS,
	customMessage?: string,
	details?: { [key: string]: unknown },
): void => {
	const statusCode = ERROR_STATUS_CODES[errorKey];
	const message = customMessage || ERROR_MESSAGES[errorKey];

	const errorResponse: ErrorResponse = {
		error: message,
		code: errorKey,
		message,
		timestamp: new Date().toISOString(),
		...(details && { details }),
	};

	res.status(statusCode).json(errorResponse);
};
