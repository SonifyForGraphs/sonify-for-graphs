import numpy as np
import sympy as sp
from api.utils import MathWaveSonificationConfig

async def math_wave_sonify(config: MathWaveSonificationConfig):
  # parse function and return if invalid
  try:
    X = sp.symbols('x')
    function = sp.sympify(config.function, locals={'x': X, 'sin': sp.sin, 'cos': sp.cos, 'tan': sp.tan})
  except sp.SympifyError:
    return {"error": "Invalid function"}
  
  x = np.linspace(config.x_range_start, config.x_range_end, config.num_data_points)
  np_function = sp.lambdify(X, function, 'numpy')
  y = np_function(x)