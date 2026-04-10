import boto3
import uuid

BUCKET_NAME = "tejas-todo-profile-images"

s3 = boto3.client("s3")
def upload_file_to_s3(file):
    try:
        file_extension = file.filename.split(".")[-1]
        unique_filename = f"{uuid.uuid4()}.{file_extension}"

        s3.upload_fileobj(
            file.file,
            BUCKET_NAME,
            unique_filename,
            ExtraArgs={"ContentType": file.content_type}
        )

        file_url = f"https://{BUCKET_NAME}.s3.amazonaws.com/{unique_filename}"
        return file_url

    except Exception as e:
        raise Exception(f"S3 Upload Failed: {str(e)}")