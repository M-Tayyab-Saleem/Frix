# """CLI entrypoint — starts the FastAPI server with uvicorn."""

# from __future__ import annotations

# import os

# import uvicorn


# def main() -> None:
#     uvicorn.run(
#         "app.api:app",
#         host=os.getenv("HOST", "127.0.0.1"),
#         port=int(os.getenv("PORT", "8000")),
#         reload=os.getenv("RELOAD", "true").lower() == "true",
#     )


# if __name__ == "__main__":
#     main()
