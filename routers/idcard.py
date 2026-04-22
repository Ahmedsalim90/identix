from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class IDCard(BaseModel):
    card_id: str
    student_id: str
    issued_date: str
    expire_date: str

@router.post("/idcards")
def create_idcard(idcard: IDCard):
    return {
        "message": "ID Card created successfully",
        "idcard": idcard
    }

@router.get("/idcards")
def get_idcards():
    return {
        "idcards": [
            {
                "card_id": "CARD001",
                "student_id": "001",
                "issued_date": "2024-01-01",
                "expire_date": "2025-01-01"
            }
        ]
    }

@router.get("/idcards/{card_id}")
def get_idcard(card_id: str):
    return {
        "idcard": {
            "card_id": card_id,
            "student_id": "001",
            "issued_date": "2024-01-01",
            "expire_date": "2025-01-01"
        }
    }

@router.delete("/idcards/{card_id}")
def delete_idcard(card_id: str):
    return {
        "message": f"ID Card {card_id} deleted successfully"
    }