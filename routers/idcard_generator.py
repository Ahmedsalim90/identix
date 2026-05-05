from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from database import get_db
from pdf_generator import generate_id_card
import models
import os

router = APIRouter()

# GET endpoint (for testing in docs)
@router.get("/generate-card/{student_id}")
def generate_card_get(student_id: str, db: Session = Depends(get_db)):
    return generate_card(student_id, db)

# POST endpoint (for frontend team)
@router.post("/idcards/generate")
def generate_card_post(data: dict, db: Session = Depends(get_db)):
    student_id = data.get("student_id")
    if not student_id:
        raise HTTPException(status_code=400, detail="student_id is required")
    return generate_card(student_id, db)

def generate_card(student_id: str, db: Session):
    student = db.query(models.Student).filter(
        models.Student.student_id == student_id).first()

    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    student_data = {
        "student_id": student.student_id,
        "first_name": student.first_name,
        "last_name": student.last_name,
        "department": student.department,
        "speciality": student.speciality,
        "photo_url": student.photo_url
    }

    os.makedirs("generated_cards", exist_ok=True)
    output_path = f"generated_cards/{student_id}.pdf"
    result = generate_id_card(student_data, output_path)

    if not result:
        raise HTTPException(
            status_code=500,
            detail="Failed to generate ID card"
        )

    return FileResponse(
        output_path,
        media_type="application/pdf",
        filename=f"IDCard_{student_id}.pdf"
    )