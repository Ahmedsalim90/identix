import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv
import os

load_dotenv()

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)

def upload_photo(file):
    result = cloudinary.uploader.upload(file)
    return result["secure_url"]

def upload_pdf(file_path: str, public_id: str) -> str:
    """Upload a PDF to Cloudinary and return its permanent URL."""
    result = cloudinary.uploader.upload(
        file_path,
        public_id=public_id,
        resource_type="raw",   # required for PDFs
        folder="idcards",
        overwrite=True,
        access_mode="public",        # re-generating overwrites the old file
    )
    return result["url"]