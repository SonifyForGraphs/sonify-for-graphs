from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import numpy as np
import sympy as sp

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

# NOTES s
# COMMENTS = NEED TO ERROR CHECK = NEED TO TEST THIS TO MAKE SURE PROGRAM DOESN'T CRASH

# math sonification configuration
class MathSonificationConfig(BaseModel):
  # base wave function
  function: str # string but will be parsed by sympy into a usable expression
 
  # general
  num_data_points: Optional[int] = 400 # make sure greater than 0
  x_range_start: Optional[float] = 0
  x_range_end: Optional[float] = 25 * np.pi # make sure greater than start range

  
  """
  # related to plotting
  x_label: Optional[str] = "x [rad]"
  y_label: Optional[str] = "y"
  title: Optional[str] = "y vs x"
  graph_color: Optional[str] = 'navy' # make sure color is in matplotlib library

  # animation
  fps: Optional[int] = 30 # make sure greater than 0

  # audio
  # will add in once everything else is working. right now just default will suffice.
  """

@app.post('/math')
async def math(config: MathSonificationConfig):
 
  # parse function and return if invalid
  try:
    X = sp.symbols('x')
    function = sp.sympify(config.function, locals={'x': X, 'sin': sp.sin, 'cos': sp.cos, 'tan': sp.tan})
  except sp.SympifyError:
    return {"error": "Invalid function"}
  
  x = np.linspace(config.x_range_start, config.x_range_end, config.num_data_points)
  np_function = sp.lambdify(X, function, 'numpy')
  y = np_function(x)
  
  return {"result": sum(y) / len(y)}
  
  #print(config.x_range_start)
  #return {"result": config.function}

