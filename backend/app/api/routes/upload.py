from fastapi import APIRouter, UploadFile, File, Depends
from app.services.s3_service import upload_file_to_s3
from app.api.deps import get_current_user

router = APIRouter()


@router.post("/upload")
def upload_profile_image(
    file: UploadFile = File(...),
    user=Depends(get_current_user)
):
    file_url = upload_file_to_s3(file)

    return {
        "message": "Upload successful",
        "url": file_url
    }