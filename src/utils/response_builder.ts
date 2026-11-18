// Формирование ответа для успешного/неуспешного запроса единой структурой

export function responseSuccess(message: string, data: any) {
    return {message: message, data: data};
}

export function responseError(message: string) {
    return {message: message};
}