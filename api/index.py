from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os

from api.utils import MathWaveSonificationConfig, StocksSonificationConfig
from api.math_wave_sonification import (
    parse_function, create_animation, create_audio, create_surge_audio,
    combine_video_audio, delete_intermediate_files, math_wave_sonify
)
from api.stocks_sonification import (
    validate_ticker, create_stocks_animation, create_stocks_audio,
    combine_stocks_video_audio, delete_intermediate_stocks_files
)
from api.translation_sonification import create_translation, delete_intermediate_translation_files

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

# MATH STUFF
@app.post('/math')
async def math(config: MathWaveSonificationConfig):
    try:
        res = await math_wave_sonify(config=config)
    except Exception as e:
        print(f"Error: {e}")
        return {"result": "fail"}

    return {"result": res['status'] }

@app.post('/math/parse')
async def parse(config: MathWaveSonificationConfig):
  # parse function to make sure it's valid
  try:
    res = await parse_function(config=config)
  except Exception as e:
    print(f'error parsing function: {e}')
    return {'status': 'fail'}
  
  return {'status': 'success'}

@app.post('/math/animation')
async def animation(config: MathWaveSonificationConfig):
  # create animation
  try:
    res = await create_animation(config=config)
  except Exception as e:
    print(f'error creating animation: {e}')
    return {'status': 'fail'}
  
  return {'status': 'success'}

@app.post('/math/audio')
async def audio(config: MathWaveSonificationConfig):
    try:
        res = await create_audio(config=config)
    except Exception as e:
        print(f'error creating audio: {e}')
        return {'status': 'fail'}
    
    return {'status': 'success'}

@app.post('/math/combine')
async def combine(config: MathWaveSonificationConfig):
  # combine animation and audio
  try:
    res = await combine_video_audio(config=config)
  except Exception as e:
    print(f'error creating video: {e}')
    return {'status': 'fail'}
  
  return {'status': 'success'}

@app.post('/math/delete')
async def delete(config: MathWaveSonificationConfig):
  # delete all created files
  try:
    res = await delete_intermediate_files(config=config)
  except Exception as e:
    print(f'error deleting videos: {e}')
    return {'status': 'fail'}

  return {'status': 'success'}

@app.post('/math/surgeaudio')
async def surge_audio(config: MathWaveSonificationConfig):
  # create audio using surge
  try:
    res = await create_surge_audio(config=config)
  except Exception as e:
    print(f'error creating audio: {e}')
    return {'status': 'fail'}
  
  return {'status': 'success'}


# STOCK STUFF
@app.post('/stocks/ticker')
async def ticker(config: StocksSonificationConfig):
  # make sure ticker is valid
  try:
    res = await validate_ticker(config=config)
  except Exception as e:
    print(f'error with stock: {e}')
    return {'status': 'fail'}

  return {'status': 'success'}

@app.post('/stocks/animation')
async def stocks_animation(config: StocksSonificationConfig):
  # create animation
  try:
    res = await create_stocks_animation(config=config)
  except Exception as e:
    print(f'error creating animation: {e}')
    return {'status': 'fail'}
  
  return {'status': 'success'}

@app.post('/stocks/audio')
async def stocks_audio(config: StocksSonificationConfig):
  # create audio with the appropriate method based on config
  try:
    print(f"Creating stocks audio with processing type: {config.audioProcessing if hasattr(config, 'audioProcessing') else 'default'}")
    res = await create_stocks_audio(config=config)
  except Exception as e:
    print(f'error creating audio: {e}')
    return {'status': 'fail'}
  
  return {'status': 'success'}

@app.post('/stocks/combine')
async def stocks_combine(config: StocksSonificationConfig):
  # combine animation and audio
  try:
    res = await combine_stocks_video_audio(config=config)
  except Exception as e:
    print(f'error creating video: {e}')
    return {'status': 'fail'}
  
  return {'status': 'success'}

@app.post('/stocks/delete')
async def delete_stocks(config: StocksSonificationConfig):
  # delete all created files
  try:
    res = await delete_intermediate_stocks_files(config=config)
  except Exception as e:
    print(f'error deleting files: {e}')
    return {'status': 'fail'}
  
  return {'status': 'success'}


# translation wave
@app.post('/image/translation')
async def translation(file: UploadFile = File(...)):
  # doing everything at once cuz lazy
  try:
    res = await create_translation(file=file)
  except Exception as e:
    print(f'error creating translation sonification: {e}')
    return {'status': 'fail'}

  return {'status': 'success'}

@app.post('/image/delete')
async def delete_translation():
  # delete all created files
  try:
    res = await delete_intermediate_translation_files()
  except Exception as e:
    print(f'error deleting files: {e}')
    return {'status': 'fail'}
  
  return {'status': 'success'}