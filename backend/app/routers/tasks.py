from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.task import TaskCreate, TaskRead, TaskUpdate
from app.services import task_service

router = APIRouter(prefix="/api/tasks", tags=["tasks"])
Db = Annotated[Session, Depends(get_db)]

@router.get("", response_model=list[TaskRead])
def list_tasks(db: Db):
    return task_service.list_tasks(db)

@router.get("/{task_id}", response_model=TaskRead)
def get_task(task_id: int, db: Db):
    task = task_service.get_task(db, task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.post("", response_model=TaskRead, status_code=status.HTTP_201_CREATED)
def create_task(payload: TaskCreate, db: Db):
    return task_service.create_task(db, payload)

@router.patch("/{task_id}", response_model=TaskRead)
def update_task(task_id: int, payload: TaskUpdate, db: Db):
    task = task_service.get_task(db, task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return task_service.update_task(db, task, payload)

@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_id: int, db: Db):
    task = task_service.get_task(db, task_id)
    if task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    task_service.delete_task(db, task)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
