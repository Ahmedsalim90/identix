from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
import models

router = APIRouter()

@router.get("/notifications")
def get_notifications(db: Session = Depends(get_db)):
    notifications = db.query(models.Notification).all()
    return {"notifications": notifications}

@router.put("/notifications/{notification_id}")
def mark_as_read(notification_id: str, db: Session = Depends(get_db)):
    notification = db.query(models.Notification).filter(
        models.Notification.id == notification_id).first()
    if notification:
        notification.is_read = "true"
        db.commit()
    return {"message": "Notification marked as read"}

@router.delete("/notifications/{notification_id}")
def delete_notification(notification_id: str, db: Session = Depends(get_db)):
    notification = db.query(models.Notification).filter(
        models.Notification.id == notification_id).first()
    if notification:
        db.delete(notification)
        db.commit()
    return {"message": "Notification deleted successfully"}