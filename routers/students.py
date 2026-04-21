
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class Student(BaseModel):
    name: str
    student_id: str
    classe: str
    date_of_birth: str
    photo_url: str

@router.post("/students")
def create_student(student: Student):
    return {
        "message": "Student created successfully",
        "student": student
    }

@router.get("/students")
def get_students():
    return {
        "students": [
            {"name": "Waah Sudais", "student_id": "001", "classe": "Level 1", "date_of_birth": "2000-01-01", "photo_url": ""},
            {"name": "Ndam Alfred", "student_id": "002", "classe": "Level 1", "date_of_birth": "2001-03-15", "photo_url": ""}
        ]
    }

@router.get("/students/{student_id}")
def get_student(student_id: str):
    return {
        "student": {
            "name": "Kum Boris",
            "student_id": student_id,
            "classe": "Level 1",
            "date_of_birth": "2008-03-22",
            "photo_url": ""
        }
    }

@router.put("/students/{student_id}")
def update_student(student_id: str, student: Student):
    return {
        "message": "Student updated successfully",
        "student_id": student_id,
        "updated_data": student
    }

@router.delete("/students/{student_id}")
def delete_student(student_id: str):
    return {
        "message": "Student {student_id} deleted successfully"
    }