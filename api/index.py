from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

load_dotenv('.env.local')

print(f'Loaded SURGE_PYTHON_PATH: {os.environ.get('SURGE_PYTHON_PATH', 'Not set')}')

# Import standard modules
from api.utils import MathWaveSonificationConfig, StocksSonificationConfig

# Check environment variables for Surge configuration
USE_SURGE = os.environ.get('USE_SURGE', 'true').lower() == 'true'
USE_REMOTE_SURGE = os.environ.get('USE_REMOTE_SURGE', 'false').lower() == 'true'

# Print configuration for diagnostics
if USE_SURGE:
    if USE_REMOTE_SURGE:
        SURGE_PI_URL = os.environ.get('SURGE_PI_URL', 'http://localhost:8888')
        print(f"Using remote Surge processing at {SURGE_PI_URL}")
    else:
        print("Using local Surge processing (if available)")
else:
    print("Using standard tones.py processing (Surge disabled)")

# Import surge-enabled modules if configured to use Surge
if USE_SURGE:
    from api.surge_math_wave_sonification import (
        parse_function, create_animation, create_audio, create_surge_audio, 
        combine_video_audio, delete_intermediate_files, math_wave_sonify
    )
    from api.stocks_sonification import (
        validate_ticker, create_stocks_animation, create_stocks_audio,
        combine_stocks_video_audio, delete_intermediate_stocks_files
    )
    from api.translation_sonification import create_translation, delete_intermediate_translation_files
else:
    # Use standard modules if Surge is disabled
    from api.math_wave_sonification import (
        parse_function, create_animation, create_audio,
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
  # run video creation
  try:
    # need better error handling here
    # if an invalid function is provided, the entire operation crashes
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
  # create audio - use either standard method or surge depending on imports
  try:
    if USE_REMOTE_SURGE:
      res = await create_surge_audio(config=config)
    else:
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
  # create audio
  try:
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
async def delete(config: StocksSonificationConfig):
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