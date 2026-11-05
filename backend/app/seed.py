from sqlalchemy import select
from app.database.session import SessionLocal
from app.models import Task

SAMPLES = [
    ("Plan sprint review", "Prepare the agenda and collect team updates.", "todo"),
    ("Build task dashboard", "Create the initial task overview.", "in_progress"),
    ("Set up database", "Create the first migration and seed records.", "done"),
]

def seed() -> None:
    with SessionLocal() as db:
        if db.scalar(select(Task.id).limit(1)) is not None:
            return
        db.add_all(Task(title=title, description=description, status=status) for title, description, status in SAMPLES)
        db.commit()

if __name__ == "__main__":
    seed()
