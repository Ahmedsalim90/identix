
 # "/": means the home address of your API  Like the homepage of a website
 # get: means the frontend is requesting/reading data 

 #connecting this router to your main.py

from fastapi import FastAPI
from routers import students

app = FastAPI()

app.include_router(students.router)

@app.get("/")
def home():
    return {"message": "IDentix API is running!"}

            #from routers import students → imports your students router
  # app.include_router(students.router) → connects your students endpoints to the main API