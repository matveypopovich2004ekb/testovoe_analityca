from fastapi import FastAPI

from app.api.mainrouter import router

app = FastAPI()

@app.get('/checkhealth')
def health_answer():
    return {'status':'backend is ready to work'}

app.include_router(router)