from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from database import get_db
from pdf_generator import generate_id_card
import models
import os
import uuid
from datetime import datetime, timedelta

router = APIRouter()

# ── Folder where generated PDFs are saved and served ──────────────────────────
# Make sure your FastAPI app mounts this folder as a static directory:
#   from fastapi.staticfiles import StaticFiles
#   app.mount("/static", StaticFiles(directory="static"), name="static")
#
# And set your PUBLIC_BASE_URL env var (e.g. https://identix-api-production.up.railway.app)
PDF_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static", "idcards")
os.makedirs(PDF_DIR, exist_ok=True)

PUBLIC_BASE_URL = os.getenv("PUBLIC_BASE_URL", "http://127.0.0.1:8000")


# ══════════════════════════════════════════════════════════════════════════════
#  GET  /idcards/generate-card/{student_id}
#  Stream a single student's ID card PDF directly
# ══════════════════════════════════════════════════════════════════════════════
@router.get("/idcards/generate-card/{student_id}")
def generate_card_get(student_id: str, db: Session = Depends(get_db)):
    student = _get_student_or_404(student_id, db)
    pdf_path = _make_pdf(student)
    _save_card_record(student_id, db)
    return FileResponse(
        path=pdf_path,
        media_type="application/pdf",
        filename=f"id_card_{student_id}.pdf"
    )


# ══════════════════════════════════════════════════════════════════════════════
#  POST /idcards/generate
#  Generate cards for a list of student IDs.
#  Returns JSON with a pdf_url per student so the frontend can open/download
#  the real backend-designed PDF instead of building its own card.
# ══════════════════════════════════════════════════════════════════════════════
@router.post("/idcards/generate")
def generate_cards_post(payload: dict, db: Session = Depends(get_db)):
    student_ids = payload.get("studentIds", [])
    if not student_ids:
        raise HTTPException(status_code=422, detail="No studentIds provided")

    generated = []
    failed = []

    for sid in student_ids:
        try:
            student = _get_student_or_404(sid, db)

            # ── Generate the PDF and get its saved path ────────────────────
            pdf_path = _make_pdf(student)   # <-- NOW we keep the path!

            # ── Build a publicly accessible URL for the PDF ───────────────
            pdf_filename = os.path.basename(pdf_path)
            pdf_url = f"{PUBLIC_BASE_URL}/static/idcards/{pdf_filename}"

            card = _save_card_record(sid, db)

            generated.append({
                # ── Identity ──────────────────────────────────────────────
                "id":             card.card_id,
                "card_id":        card.card_id,
                "studentId":      student.student_id,
                "student_id":     student.student_id,
                "name":           f"{student.first_name} {student.last_name}",
                "first_name":     student.first_name,
                "last_name":      student.last_name,
                # ── Academic info ─────────────────────────────────────────
                "department":     student.department or "",
                "speciality":     student.speciality or "",
                "level":          student.level or "",
                "campus":         student.campus or "",
                "school":         student.school or "",
                # ── Contact / photo ───────────────────────────────────────
                "photo":          student.photo_url or "",
                "photo_url":      student.photo_url or "",
                "email":          student.email or "",
                # ── Dates ─────────────────────────────────────────────────
                "issued_date":    card.issued_date,
                "expire_date":    card.expire_date,
                "issuedAt":       card.issued_date,
                "expiryDate":     card.expire_date,
                "validUntil":     card.expire_date,
                "generationDate": card.issued_date,
                "enrolledAt":     None,
                # ── Status ────────────────────────────────────────────────
                "cardStatus":     "active",
                "status":         "generated",
                "idNumber":       student.student_id,
                # ── THE KEY FIELD: URL of the backend-generated PDF ───────
                "pdf_url":        pdf_url,
            })

        except HTTPException as e:
            failed.append({"student_id": sid, "reason": e.detail})
        except Exception as e:
            failed.append({"student_id": sid, "reason": str(e)})

    if not generated:
        raise HTTPException(
            status_code=500,
            detail=f"No cards could be generated. Details: {failed}"
        )

    return {
        "success":   True,
        "generated": generated,
        "failed":    failed,
        "total":     len(generated),
        # Convenience: list of all PDF URLs so the frontend can batch-download
        "pdf_urls":  [c["pdf_url"] for c in generated],
    }


# ══════════════════════════════════════════════════════════════════════════════
#  Helpers
# ══════════════════════════════════════════════════════════════════════════════

def _get_student_or_404(student_id: str, db: Session) -> models.Student:
    student = db.query(models.Student).filter(
        models.Student.student_id == student_id
    ).first()
    if not student:
        raise HTTPException(status_code=404, detail=f"Student {student_id} not found")
    return student


def _make_pdf(student: models.Student) -> str:
    """Generate the PDF using pdf_generator and save it to PDF_DIR.
    Returns the full path of the saved file."""
    student_data = {
        "student_id":    student.student_id,
        "first_name":    student.first_name,
        "last_name":     student.last_name,
        "department":    student.department,
        "speciality":    student.speciality,
        "photo_url":     student.photo_url,
        "level":         student.level,
        "campus":        student.campus,
        "gender":        student.gender,
        "school":        student.school,
        "date_of_birth": getattr(student, "date_of_birth", ""),
        "nationality":   getattr(student, "nationality", ""),
        "contact":       getattr(student, "phone", getattr(student, "contact", "")),
    }

    # Use a stable filename so re-generating overwrites the old file
    filename = f"id_card_{student.student_id}.pdf"
    output_path = os.path.join(PDF_DIR, filename)

    result = generate_id_card(student_data, output_path)
    if not result:
        raise Exception(f"PDF generation failed for student {student.student_id}")
    return result


def _save_card_record(student_id: str, db: Session) -> models.IDCard:
    issued = datetime.now().strftime("%Y-%m-%d")
    expire = (datetime.now() + timedelta(days=365 * 4)).strftime("%Y-%m-%d")
    existing = db.query(models.IDCard).filter(
        models.IDCard.student_id == student_id
    ).first()
    if existing:
        existing.issued_date = issued
        existing.expire_date = expire
        db.commit()
        db.refresh(existing)
        return existing
    card = models.IDCard(
        card_id=str(uuid.uuid4()),
        student_id=student_id,
        issued_date=issued,
        expire_date=expire,
    )
    db.add(card)
    db.commit()
    db.refresh(card)
    return card
