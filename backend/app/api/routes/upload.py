from fastapi import APIRouter, UploadFile, File
from app.services.s3_service import upload_file_to_s3


router = APIRouter()


@router.post("/upload")
def upload_profile_image(
    file: UploadFile = File(...)
):
    file_url = upload_file_to_s3(file)

    return {
        "message": "Upload successful",
        "url": file_url
    }