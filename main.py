
 # "/": means the home address of your API  Like the homepage of a website
 # get: means the frontend is requesting/reading data 

 #connecting three routers to your main.py
from fastapi import FastAPI
from routers import students, idcard, admin

app = FastAPI(
    title="IDentix API",
    description="API for managing student ID cards",
    version="1.0.0"
)

app.include_router(students.router)
app.include_router(idcard.router)
app.include_router(admin.router)

@app.get("/")
def home():
    return {"message": "IDentix API is running!"}


  #from routers import students → imports your students router
  # app.include_router(students.router) → connects your students endpoints to the main API