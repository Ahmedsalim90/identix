from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
import models

router = APIRouter()

@router.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    total_students = db.query(models.Student).count()
    total_idcards = db.query(models.IDCard).count()
    total_admins = db.query(models.Admin).count()
    unread_notifications = db.query(models.Notification).filter(
        models.Notification.is_read == "false"
    ).count()

    return {
        "total_students": total_students,
        "total_idcards": total_idcards,
        "total_admins": total_admins,
        "unread_notifications": unread_notifications
    }

@router.get("/activity")
def get_activity(db: Session = Depends(get_db)):
    notifications = db.query(models.Notification).order_by(
        models.Notification.created_at.desc()
    ).limit(20).all()

    return {
        "activity": [
            {
                "id": n.id,
                "message": n.message,
                "is_read": n.is_read,
                "created_at": n.created_at
            } for n in notifications
        ]
    }

@router.get("/requests")
def get_requests(db: Session = Depends(get_db)):
    students_without_idcard = db.query(models.Student).filter(
        ~models.Student.idcards.any()
    ).all()

    return {
        "pending_requests": [
            {
                "student_id": s.student_id,
                "name": f"{s.first_name} {s.last_name}",
                "department": s.department,
                "email": s.email
            } for s in students_without_idcard
        ],
        "total": len(students_without_idcard)
    }

@router.get("/enrollments")
def get_enrollments(db: Session = Depends(get_db)):
    students = db.query(models.Student).all()

    return {
        "enrollments": [
            {
                "student_id": s.student_id,
                "name": f"{s.first_name} {s.last_name}",
                "department": s.department,
                "level": s.level,
                "school": s.school,
                "campus": s.campus
            } for s in students
        ],
        "total": len(students)
    }