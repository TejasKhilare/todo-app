from sqlalchemy.orm import Session
from app.models.task import Task


def create_task(db: Session, user_id: int, title: str):
    task = Task(title=title, user_id=user_id)
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


def get_tasks(db: Session, user_id: int):
    return db.query(Task).filter(Task.user_id == user_id).all()


def get_task_by_id(db: Session, task_id: int, user_id: int):
    return db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == user_id
    ).first()


def update_task(db: Session, task: Task, title: str):
    task.title = title # type: ignore
    db.commit()
    db.refresh(task)
    return task


def delete_task(db: Session, task: Task):
    db.delete(task)
    db.commit()