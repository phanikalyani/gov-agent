from fastapi import FastAPI, UploadFile, File
import pdfplumber
import shutil
import os

app = FastAPI()

UPLOAD_FOLDER = "uploads"

# Create uploads folder if not exists
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)


# 🚀 Upload & Extract API
@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):

    file_path = os.path.join(UPLOAD_FOLDER, file.filename)

    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Extract text from PDF
    extracted_text = ""

    try:
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    extracted_text += text + "\n"

    except Exception as e:
        return {"error": str(e)}

    # Simple data parsing (basic demo)
    data = {
        "name": "",
        "dob": "",
        "id_number": ""
    }

    lines = extracted_text.split("\n")

    for line in lines:
        if "name" in line.lower():
            data["name"] = line
        if "dob" in line.lower() or "date of birth" in line.lower():
            data["dob"] = line

        if "id" in line.lower() or "aadhaar" in line.lower():
            data["id_number"] = line

    return {
        "message": "File processed successfully",
        "data": data,
        "raw_text": extracted_text[:1000]  # preview
    }


# 🧪 Test Route
@app.get("/")
def home():
    return {"message": "Gov Agent FastAPI Running 🚀"}