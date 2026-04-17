const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

type ApiErrorResponse = {
    error?: string;
};

export async function apiFetch<T>(
    path: string,
    options: RequestInit = {}
): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
        }
    })

    if (!response.ok) {
        let errorMessage = 'Something went wrong';

        try {
            const errorData: ApiErrorResponse = await response.json();
            errorMessage = errorData.error || errorMessage;
        } catch {
            errorMessage = response.statusText || errorMessage;
        }

        throw new Error(errorMessage);
    }

    return response.json();
}