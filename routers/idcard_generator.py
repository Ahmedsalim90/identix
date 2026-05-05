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
    return _generate_single(student_id, db)


# POST endpoint (for frontend) — accepts bulk { studentIds: [...] }
@router.post("/idcards/generate")
def generate_card_post(data: dict, db: Session = Depends(get_db)):
    # Accept array form: { "studentIds": ["id1", "id2", ...] }
    student_ids = data.get("studentIds") or data.get("student_ids")

    # Also accept legacy single-id form: { "student_id": "id1" }
    if not student_ids:
        single = data.get("student_id")
        if single:
            student_ids = [single]
        else:
            raise HTTPException(
                status_code=400,
                detail="studentIds (array) or student_id (string) is required"
            )

    os.makedirs("generated_cards", exist_ok=True)
    generated = []
    failed = []

    for sid in student_ids:
        student = db.query(models.Student).filter(
            models.Student.student_id == sid
        ).first()

        if not student:
            failed.append({"student_id": sid, "reason": "Student not found"})
            continue

        student_data = {
            "student_id": student.student_id,
            "first_name":  student.first_name,
            "last_name":   student.last_name,
            "department":  student.department,
            "speciality":  getattr(student, "speciality", ""),
            "photo_url":   student.photo_url,
        }

        output_path = f"generated_cards/{sid}.pdf"
        result = generate_id_card(student_data, output_path)

        if result:
            generated.append({
                "id":          student.student_id,
                "name":        f"{student.first_name} {student.last_name}",
                "studentId":   student.student_id,
                "department":  student.department,
                "enrolledAt":  getattr(student, "enrollment_date", None) or getattr(student, "created_at", None),
                "photo":       student.photo_url,
                "pdf":         output_path,
            })
        else:
            failed.append({"student_id": sid, "reason": "PDF generation failed"})

    if not generated:
        raise HTTPException(
            status_code=500,
            detail=f"No ID cards could be generated. Details: {failed}"
        )

    return {
        "success":   True,
        "generated": generated,
        "failed":    failed,
    }


# ── Internal helper (used by GET route above) ─────────────────────────────────
def _generate_single(student_id: str, db: Session):
    student = db.query(models.Student).filter(
        models.Student.student_id == student_id
    ).first()

    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    student_data = {
        "student_id": student.student_id,
        "first_name":  student.first_name,
        "last_name":   student.last_name,
        "department":  student.department,
        "speciality":  getattr(student, "speciality", ""),
        "photo_url":   student.photo_url,
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
