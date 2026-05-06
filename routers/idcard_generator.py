from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from database import get_db
from pdf_generator import generate_id_card
import models
import os
import tempfile

router = APIRouter()


# GET endpoint (for testing in docs)
@router.get("/idcards/generate-card/{student_id}")
def generate_card_get(student_id: str, db: Session = Depends(get_db)):
    return _generate_single(student_id, db)


# POST endpoint (for frontend) — accepts bulk { studentIds: [...] }
@router.post("/idcards/generate")
def generate_cards_post(payload: dict, db: Session = Depends(get_db)):
    student_ids = payload.get("studentIds", [])

    if not student_ids:
        raise HTTPException(status_code=422, detail="No studentIds provided")

    results = []
    for sid in student_ids:
        result = _generate_single(sid, db)
        results.append(result)

    return {"generated": results}


# Shared helper
def _generate_single(student_id: str, db: Session):

    # 1. Fetch student from DB
    student = db.query(models.Student).filter(
        models.Student.student_id == student_id
    ).first()

    if not student:
        raise HTTPException(status_code=404, detail=f"Student {student_id} not found")

    # 2. Build the data dict for pdf_generator
    student_data = {
        "student_id": student.student_id,
        "first_name": student.first_name,
        "last_name":  student.last_name,
        "department": student.department,
        "speciality": student.speciality,
        "photo_url":  student.photo_url,
        "level":      student.level,
        "campus":     student.campus,
        "gender":     student.gender,
        "school":     student.school,
    }

    # 3. Generate PDF to a temp file
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
    tmp.close()
    output = generate_id_card(student_data, tmp.name)

    if not output:
        raise HTTPException(status_code=500, detail="PDF generation failed")

    # 4. Return the PDF file
    return FileResponse(
        path=output,
        media_type="application/pdf",
        filename=f"id_card_{student_id}.pdf"
    )