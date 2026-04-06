from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.schemas.task import TaskCreate, TaskUpdate, TaskOut
from app.services.task_service import (
    create_task,
    get_tasks,
    get_task_by_id,
    update_task,
    delete_task
)
from app.api.deps import get_db, get_current_user

router = APIRouter()

@router.post('/',response_model=TaskOut)
def create_new_task(
    task:TaskCreate,
    db:Session=Depends(get_db),
    user=Depends(get_current_user)
):
    return create_task(db,user.id,task.title)

@router.get("/", response_model=list[TaskOut])
def read_tasks(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    return get_tasks(db, user.id)


@router.put("/{task_id}", response_model=TaskOut)
def update_existing_task(
    task_id: int,
    task_update: TaskUpdate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    task = get_task_by_id(db, task_id, user.id)

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if task_update.title:
        return update_task(db, task, task_update.title)

    return task


@router.delete("/{task_id}")
def delete_existing_task(
    task_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    task = get_task_by_id(db, task_id, user.id)

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    delete_task(db, task)

    return {"message": "Task deleted successfully"}