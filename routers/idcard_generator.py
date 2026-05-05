from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from database import get_db
from pdf_generator import generate_id_card
import models, os, zipfile

router = APIRouter()

@router.post("/idcards/generate")
def generate_card_post(data: dict, db: Session = Depends(get_db)):
    student_ids = data.get("studentIds") or data.get("student_ids")
    if not student_ids:
        single = data.get("student_id")
        if single:
            student_ids = [single]
        else:
            raise HTTPException(status_code=400, detail="studentIds is required")
    
    generated = []
    os.makedirs("generated_cards", exist_ok=True)
    
    for sid in student_ids:
        student = db.query(models.Student).filter(
            models.Student.student_id == sid).first()
        if not student:
            continue
        student_data = {
            "student_id": student.student_id,
            "first_name": student.first_name,
            "last_name": student.last_name,
            "department": student.department,
            "speciality": getattr(student, "speciality", ""),
            "photo_url": student.photo_url,
        }
        output_path = f"generated_cards/{sid}.pdf"
        result = generate_id_card(student_data, output_path)
        if result:
            generated.append({
                "id": student.student_id,
                "name": f"{student.first_name} {student.last_name}",
                "studentId": student.student_id,
                "department": student.department,
                "pdf": output_path,
            })
    
    if not generated:
        raise HTTPException(status_code=404, detail="No students found for given IDs")
    
    return {"success": True, "generated": generated}

@router.get("/generate-card/{student_id}")
def generate_card_get(student_id: str, db: Session = Depends(get_db)):
    student = db.query(models.Student).filter(
        models.Student.student_id == student_id).first()

    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    student_data = {
        "student_id": student.student_id,
        "first_name": student.first_name,
        "last_name": student.last_name,
        "department": student.department,
        "speciality": getattr(student, "speciality", ""),
        "photo_url": student.photo_url,
    }

    os.makedirs("generated_cards", exist_ok=True)
    output_path = f"generated_cards/{student_id}.pdf"
    result = generate_id_card(student_data, output_path)

    if not result:
        raise HTTPException(status_code=500, detail="Failed to generate ID card")

    return FileResponse(
        output_path,
        media_type="application/pdf",
        filename=f"IDCard_{student_id}.pdf"
    )