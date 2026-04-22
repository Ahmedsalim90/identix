from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class Admin(BaseModel):
    admin_id: str
    admin_name: str
    contact: str
    school: str
    email: str

@router.post("/admins")
def create_admin(admin: Admin):
    return {
        "message": "Admin created successfully",
        "admin": admin
    }

@router.get("/admins")
def get_admins():
    return {
        "admins": [
            {
                "admin_id": "ADM001",
                "admin_name": "Mr Salim",
                "contact": "677000001",
                "school": "YIBS",
                "email": "admin@school.com"
            }
        ]
    }

@router.get("/admins/{admin_id}")
def get_admin(admin_id: str):
    return {
        "admin": {
            "admin_id": admin_id,
            "admin_name": "Mr Salim",
            "contact": "677000001",
            "school": "YIBS",
            "email": "admin@school.com"
        }
    }

@router.put("/admins/{admin_id}")
def update_admin(admin_id: str, admin: Admin):
    return {
        "message": "Admin updated successfully",
        "admin_id": admin_id,
        "updated_data": admin
    }

@router.delete("/admins/{admin_id}")
def delete_admin(admin_id: str):
    return {
        "message": f"Admin {admin_id} deleted successfully"
    }