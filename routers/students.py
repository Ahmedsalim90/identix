from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from datetime import datetime
import models
import uuid

router = APIRouter()

class Student(BaseModel):
    student_id: str
    first_name: str
    last_name: str
    age: str
    place_of_birth: str
    department: str
    speciality: str
    parent_name: str
    contact: str
    email: str

@router.post("/students")
def create_student(student: Student, db: Session = Depends(get_db)):
    new_student = models.Student(**student.dict())
    db.add(new_student)
    db.commit()
    db.refresh(new_student)

    notification = models.Notification(
        id=str(uuid.uuid4()),
        message=f"New student added: {student.first_name} {student.last_name} from {student.department} department",
        is_read="false",
        created_at=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    )
    db.add(notification)
    db.commit()

    return {
        "message": "Student created successfully",
        "student": student
    }

@router.get("/students")
def get_students(db: Session = Depends(get_db)):
    students = db.query(models.Student).all()
    return {"students": students}

@router.get("/students/{student_id}")
def get_student(student_id: str, db: Session = Depends(get_db)):
    student = db.query(models.Student).filter(
        models.Student.student_id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return {"student": student}

@router.put("/students/{student_id}")
def update_student(student_id: str, student: Student,
                   db: Session = Depends(get_db)):
    existing_student = db.query(models.Student).filter(
        models.Student.student_id == student_id).first()
    if not existing_student:
        raise HTTPException(status_code=404, detail="Student not found")
    for key, value in student.dict().items():
        setattr(existing_student, key, value)
    db.commit()
    return {
        "message": "Student updated successfully",
        "student": student
    }

@router.delete("/students/{student_id}")
def delete_student(student_id: str, db: Session = Depends(get_db)):
    student = db.query(models.Student).filter(
        models.Student.student_id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    db.delete(student)
    db.commit()
    return {"message": f"Student {student_id} deleted successfully"}

#  db: Session = Depends(get_db) → connects to real database
# db.add() → saves to database
# db.commit() → confirms the save
# db.query() → fetches from database
# db.delete() → deletes from database
# HTTPException → returns proper error if student not found