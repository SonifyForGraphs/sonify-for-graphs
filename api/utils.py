# math sonification configuration
from typing import Optional
import numpy as np
from pydantic import BaseModel


class MathWaveSonificationConfig(BaseModel):
  # base wave function
  function: str # string but will be parsed by sympy into a usable expression
 
  # general
  num_data_points: Optional[int] = 400 # make sure greater than 0
  x_range_start: Optional[float] = 0
  x_range_end: Optional[float] = 25 * np.pi # make sure greater than start range
  
  # related to plotting
  x_label: Optional[str] = "x [rad]"
  y_label: Optional[str] = "y"
  title: Optional[str] = "y vs x"
  graph_color: Optional[str] = 'navy' # make sure color is in matplotlib library

  # animation
  fps: Optional[int] = 30 # make sure greater than 0

  # audio
  # will add in once everything else is working. right now just default will suffice.
