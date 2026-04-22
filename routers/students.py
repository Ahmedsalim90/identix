from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

class Student(BaseModel):
    student_id: str
    first_name: str
    last_name: str
    place_of_birth: str
    department: str
    speciality: str
    parent_name: str
    contact: str
    email: str

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
            {
                "student_id": "001",
                "first_name": "Waah",
                "last_name": "Sudais",
                "place_of_birth": "Yaounde",
                "department": "Computer Science",
                "speciality": "Software Engineering",
                "parent_name": "James Doe",
                "contact": "677000000",
                "email": "john.doe@email.com"
            }
        ]
    }

@router.get("/students/{student_id}")
def get_student(student_id: str):
    return {
        "student": {
            "student_id": student_id,
            "first_name": "Nabil",
            "last_name": "Patricia",
            "place_of_birth": "Yaounde",
            "department": "Computer Science",
            "speciality": "Software Engineering",
            "parent_name": "James Doe",
            "contact": "677000000",
            "email": "john.doe@email.com"
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
        "message": f"Student {student_id} deleted successfully"
    }