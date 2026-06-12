from app.db import get_connection
from app.main import create_app

app = create_app()

if __name__ == "__main__":
    import uvicorn

    connection = get_connection()
    print(f"Connected to database: {connection}")

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        reload_dirs=["app"],
    )
