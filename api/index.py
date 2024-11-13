from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.math_wave_sonification import math_wave_sonify
from api.utils import MathWaveSonificationConfig
from api.math_wave_sonification import parse_function, create_animation, create_audio, combine_video_audio

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

@app.post('/math')
async def math(config: MathWaveSonificationConfig):
  # run video creation
  try:
    # need better error handling here
    # if an invalid function is provided, the entire operation crashes
    res = await math_wave_sonify(config=config)
  except:
    print("Error")

  return {"result": res['status'] }

@app.post('/math/parse')
async def parse(config: MathWaveSonificationConfig):
  # parse function to make sure it's valid
  try:
    res = await parse_function(config=config)
  except:
    print('error parsing function')
    return {'status': 'fail'}
  
  return {'status': 'success'}

@app.post('/math/animation')
async def animation(config: MathWaveSonificationConfig):
  # create animation
  try:
    res = await create_animation(config=config)
  except:
    print('error creating animation')
    return {'status': 'fail'}
  
  return {'status': 'success'}

@app.post('/math/audio')
async def audio(config: MathWaveSonificationConfig):
  # create audio
  try:
    res = await create_audio(config=config)
  except:
    print('error creating audio')
    return {'status': 'fail'}
  
  return {'status': 'success'}

@app.post('/math/combine')
async def combine(config: MathWaveSonificationConfig):
  # combine animation and audio
  try:
    res = await combine_video_audio(config=config)
  except:
    print('error creating video')
    return {'status': 'fail'}
  
  return {'status': 'success'}