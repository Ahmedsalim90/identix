from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
import models
from datetime import datetime

router = APIRouter()

@router.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    total_students   = db.query(models.Student).count()
    total_idcards    = db.query(models.IDCard).count()
    total_admins     = db.query(models.Admin).count()
    unread_notifs    = db.query(models.Notification).filter(
                           models.Notification.is_read == "false"
                       ).count()

    # Students without ID cards = pending
    students_with_card = db.query(models.IDCard.student_id).distinct()
    pending = db.query(models.Student).filter(
        ~models.Student.student_id.in_(students_with_card)
    ).count()

    return {
        # Fields the dashboard expects
        "totalStudents":    total_students,
        "total_students":   total_students,
        "generatedIds":     total_idcards,
        "generated_ids":    total_idcards,
        "enrolledStudents": total_students,
        "pendingRequests":  pending,
        "pending_requests": pending,
        "pending":          pending,
        "total_idcards":    total_idcards,
        "total_admins":     total_admins,
        "unread_notifications": unread_notifs,
        "expiringIds":      0,
        "expiredIds":       0,
        "generatedToday":   total_idcards,
        "total":            total_students,
    }

@router.get("/activity")
def get_activity(db: Session = Depends(get_db)):
    notifications = db.query(models.Notification).order_by(
        models.Notification.created_at.desc()
    ).limit(20).all()

    return {
        "activity": [
            {
                "id":        n.id,
                "type":      "enrollment",
                "message":   n.message,
                "title":     n.message,
                "is_read":   n.is_read,
                "createdAt": n.created_at,
                "time":      n.created_at,
            } for n in notifications
        ]
    }

@router.get("/requests")
def get_requests(db: Session = Depends(get_db)):
    students_with_card = db.query(models.IDCard.student_id).distinct()
    students_without = db.query(models.Student).filter(
        ~models.Student.student_id.in_(students_with_card)
    ).all()

    return {
        "pending_requests": [
            {
                "student_id": s.student_id,
                "name":       f"{s.first_name} {s.last_name}",
                "department": s.department,
                "email":      s.email,
                "status":     "pending",
                "photo_url":  s.photo_url or "",
            } for s in students_without
        ],
        "requests": [
            {
                "student_id": s.student_id,
                "name":       f"{s.first_name} {s.last_name}",
                "department": s.department,
                "email":      s.email,
                "status":     "pending",
                "photo_url":  s.photo_url or "",
            } for s in students_without
        ],
        "total": len(students_without)
    }

@router.get("/enrollments")
def get_enrollments(db: Session = Depends(get_db)):
    students = db.query(models.Student).all()
    return {
        "enrollments": [
            {
                "student_id": s.student_id,
                "name":       f"{s.first_name} {s.last_name}",
                "department": s.department,
                "level":      s.level,
                "school":     s.school,
                "campus":     s.campus,
                "status":     "enrolled",
            } for s in students
        ],
        "data":  [],
        "total": len(students)
    }