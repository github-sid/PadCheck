from pathlib import Path

from app.db.connection import get_connection

MIGRATIONS_DIR = Path(__file__).parent / "migrations"


def run_migrations() -> None:
    sql_files = sorted(MIGRATIONS_DIR.glob("*.sql"))

    with get_connection() as conn:
        with conn.cursor() as cur:
            for sql_file in sql_files:
                cur.execute(sql_file.read_text())
        conn.commit()


if __name__ == "__main__":
    run_migrations()
    print("Database migrations applied successfully.")
