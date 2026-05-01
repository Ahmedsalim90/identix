from fastapi import APIRouter, File, UploadFile
from cloudinary_config import upload_photo

router = APIRouter()

@router.post("/upload/photo")
async def upload_student_photo(file: UploadFile = File(...)):
    contents = await file.read()
    url = upload_photo(contents)
    return {
        "message": "Photo uploaded successfully",
        "photo_url": url
    }