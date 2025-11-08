import time
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()

        response = await call_next(request)

        process_time = (time.time() - start_time) * 1000  # in ms
        formatted_time = f"{process_time:.2f}ms"

        log_message = (
            f"[INFO] {request.method} {request.url.path} "
            f"- {response.status_code} ({formatted_time})"
        )

        print(log_message)
        return response
