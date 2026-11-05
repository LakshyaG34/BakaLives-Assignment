from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models import Task
from app.schemas.task import TaskCreate, TaskUpdate

def list_tasks(db: Session) -> list[Task]:
    return list(db.scalars(select(Task).order_by(Task.id.desc())).all())

def get_task(db: Session, task_id: int) -> Task | None:
    return db.get(Task, task_id)

def create_task(db: Session, payload: TaskCreate) -> Task:
    task = Task(title=payload.title, description=payload.description)
    db.add(task)
    db.commit()
    db.refresh(task)
    return task

def update_task(db: Session, task: Task, payload: TaskUpdate) -> Task:
    changes = payload.model_dump(exclude_unset=True)
    next_status = changes.pop("status", None)
    for name, value in changes.items():
        setattr(task, name, value)
    db.commit()
    db.refresh(task)
    if next_status is not None:
        task.status = next_status
        db.expunge(task)
    return task

def delete_task(db: Session, task: Task) -> None:
    db.delete(task)
    db.commit()
