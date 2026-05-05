from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from database import get_db
from pdf_generator import generate_id_card
import models
import os

router = APIRouter()

@router.get("/generate-card/{student_id}")
def generate_student_card(student_id: str, db: Session = Depends(get_db)):
    
    # Get student from database
    student = db.query(models.Student).filter(
        models.Student.student_id == student_id).first()
    
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Create student dictionary
    student_data = {
        "student_id": student.student_id,
        "first_name": student.first_name,
        "last_name": student.last_name,
        "department": student.department,
        "speciality": student.speciality,
        "photo_url": student.photo_url
    }
    
    # Create output folder
    os.makedirs("generated_cards", exist_ok=True)
    
    # Generate PDF
    output_path = f"generated_cards/{student_id}.pdf"
    result = generate_id_card(student_data, output_path)
    
    if not result:
        raise HTTPException(
            status_code=500, 
            detail="Failed to generate ID card"
        )
    
    # Return PDF file
    return FileResponse(
        output_path,
        media_type="application/pdf",
        filename=f"IDCard_{student_id}.pdf"
    )