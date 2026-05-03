from fastapi import APIRouter, Depends, HTTPException, Form, File, UploadFile
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from database import get_db
from datetime import datetime
import models
import uuid
import os
import cloudinary
import cloudinary.uploader

# ── Cloudinary configuration ──────────────────────────────────────────────────
# Set these in your Railway environment variables — never hardcode them
cloudinary.config(
    cloud_name = os.environ.get("CLOUDINARY_CLOUD_NAME"),
    api_key    = os.environ.get("CLOUDINARY_API_KEY"),
    api_secret = os.environ.get("CLOUDINARY_API_SECRET"),
    secure     = True   # always use HTTPS URLs
)

router = APIRouter()


async def upload_to_cloudinary(img: UploadFile, ref: str) -> str:
    """
    Upload an image file to Cloudinary and return the secure HTTPS URL.
    Images are stored in the 'identix/students' folder on Cloudinary,
    named by the student's reference number so they're easy to find.
    """
    try:
        # Read the file bytes
        contents = await img.read()

        # Upload to Cloudinary
        result = cloudinary.uploader.upload(
            contents,
            folder         = "identix/students",   # organized folder on Cloudinary
            public_id      = ref,                   # filename = student ref e.g. IDX-A3F9C12B
            overwrite      = True,
            resource_type  = "image",
            transformation = [
                # Auto-crop to a nice portrait format for ID cards
                {"width": 400, "height": 500, "crop": "fill", "gravity": "face"},
                {"quality": "auto"},                # auto-optimize file size
                {"fetch_format": "auto"},           # auto-choose best format (webp etc.)
            ]
        )

        # Return the secure HTTPS URL of the uploaded image
        return result["secure_url"]

    except Exception as e:
        # If upload fails, log the error and return empty string
        # Registration still succeeds — photo is just missing
        print(f"Cloudinary upload failed for {ref}: {e}")
        return ""


@router.post("/students")
async def create_student(
    # ── Step 1 — Personal info ────────────────────────────────────────
    firstname:      str = Form(...),
    secondname:     str = Form(...),
    email:          str = Form(...),
    contact:        str = Form(...),
    date:           str = Form(...),
    place:          str = Form(...),
    gender:         str = Form(...),

    # ── Step 2 — Institution ──────────────────────────────────────────
    school:         str = Form(...),
    Department:     str = Form(...),
    campus:         str = Form(...),
    specialty:      str = Form(...),
    level:          str = Form(...),

    # ── Step 3 — Address ─────────────────────────────────────────────
    address:        str = Form(...),
    nationality:    str = Form(...),
    city:           str = Form(...),

    # ── Step 4 — Emergency + photo ────────────────────────────────────
    emergencyName:  str = Form(...),
    emergencyPhone: str = Form(...),
    img: UploadFile = File(None),

    db: Session = Depends(get_db)
):
    # Generate unique student reference number
    ref = "IDX-" + uuid.uuid4().hex[:8].upper()

    # ── Upload photo to Cloudinary ────────────────────────────────────
    # Only the URL is saved to the database — no image data stored locally
    photo_url = ""
    if img and img.filename:
        photo_url = await upload_to_cloudinary(img, ref)

    # ── Save student to database ──────────────────────────────────────
    # Map frontend field names → database model field names
    new_student = models.Student(
        student_id     = ref,
        first_name     = firstname,
        last_name      = secondname,
        email          = email,
        contact        = contact,
        date_of_birth  = date,
        place_of_birth = place,
        department     = Department,
        speciality     = specialty,
        parent_name    = emergencyName,
        photo_url      = photo_url,     # Cloudinary HTTPS URL stored here
        age            = "",
        gender         = gender,
        school         = school,
        campus         = campus,
        address        = address,
        nationality    = nationality,
        city           = city,
        emergencyName  = emergencyName,
        emergencyPhone = emergencyPhone,



    )

    db.add(new_student)
    db.commit()
    db.refresh(new_student)

    # ── Create notification ───────────────────────────────────────────
    notification = models.Notification(
        id         = str(uuid.uuid4()),
        message    = (
            f"New student registered: {firstname} {secondname} "
            f"from {Department} — Ref: {ref}"
        ),
        is_read    = "false",
        created_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    )
    db.add(notification)
    db.commit()

    return JSONResponse(
        status_code=201,
        content={
            "message":    "Student registered successfully",
            "ref_number": ref,
            "photo_url":  photo_url,
            "student": {
                "name":   f"{firstname} {secondname}",
                "email":  email,
                "school": school,
                "ref":    ref,
            }
        }
    )


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
def update_student(student_id: str,
                   first_name: str = Form(...),
                   last_name:  str = Form(...),
                   db: Session = Depends(get_db)):
    existing = db.query(models.Student).filter(
        models.Student.student_id == student_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Student not found")
    existing.first_name = first_name
    existing.last_name  = last_name
    db.commit()
    return {"message": "Student updated successfully"}


@router.delete("/students/{student_id}")
def delete_student(student_id: str, db: Session = Depends(get_db)):
    student = db.query(models.Student).filter(
        models.Student.student_id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    db.delete(student)
    db.commit()
    return {"message": f"Student {student_id} deleted successfully"}
