import { ZodError } from "zod";

export function getZodErrorResponse(error: ZodError) {
    return {
        error: "Invalid request body",
        details: error.flatten(),
    };
}