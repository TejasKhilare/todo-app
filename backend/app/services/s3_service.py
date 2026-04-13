import boto3
import uuid
import os

BUCKET_NAME = os.getenv("AWS_BUCKET_NAME")
AWS_REGION = os.getenv("AWS_REGION", "ap-south-1")

s3 = boto3.client("s3")

def upload_file_to_s3(file):
    file_extension = file.filename.split(".")[-1]
    unique_filename = f"{uuid.uuid4()}.{file_extension}"

    s3.upload_fileobj(
        file.file,
        BUCKET_NAME,
        unique_filename,
        ExtraArgs={"ContentType": file.content_type}
    )

    return f"https://{BUCKET_NAME}.s3.{AWS_REGION}.amazonaws.com/{unique_filename}"