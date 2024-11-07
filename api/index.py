from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.math_wave_sonification import math_wave_sonify
from api.utils import MathWaveSonificationConfig

app = FastAPI()
origins = [
  'http://localhost:3000',
  'https://localhost:3000',
  'localhost:3000'

]
app.add_middleware(
  CORSMiddleware,
  allow_origins=['*'],# WRONG, but works. fix later
  allow_credentials=True,
  allow_methods=['*'],
  allow_headers=['*'],
)

# NOTES
# COMMENTS = NEED TO ERROR CHECK = NEED TO TEST THIS TO MAKE SURE PROGRAM DOESN'T CRASH


@app.post('/math')
async def math(config: MathWaveSonificationConfig):
  # run video creation
  try:
    await math_wave_sonify(config=config)
  except:
    print("Error")
  print('here')


  # upload video to supabase

  # return link to video
  
  return {"result": "nav"}

