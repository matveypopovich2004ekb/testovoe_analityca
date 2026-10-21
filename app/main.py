from fastapi import FastAPI

app = FastAPI()

@app.get('/checkhealth')
def health_answer():
    return {'status':'backend is ready to work'}

