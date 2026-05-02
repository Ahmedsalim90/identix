
 # "/": means the home address of your API  Like the homepage of a website
 # get: means the frontend is requesting/reading data 

 #connecting three routers to your main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import students, idcard, admin, notifications, upload
from database import engine
import models

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="IDentix API",
    description="API for managing student ID cards",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=false,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(students.router)
app.include_router(idcard.router)
app.include_router(admin.router)
app.include_router(notifications.router)
app.include_router(upload.router)

@app.get("/")
def home():
    return {"message": "IDentix API is running!"}

  # from routers import students → imports your students router
  # app.include_router(students.router) → connects your students endpoints to the main API
  # allow_origins=["*"] → allows any frontend to connect to your API
 #  allow_methods=["*"] → allows GET, POST, PUT, DELETE
#   allow_headers=["*"] → allows any headers
# from database import engine → imports your database connection
# import models → imports your database tables
# models.Base.metadata.create_all(bind=engine) → automatically creates all tables in PostgreSQL when API starts!
