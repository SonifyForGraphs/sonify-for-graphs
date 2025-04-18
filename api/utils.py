# math sonification configuration
from typing import Optional, Dict, Any
import numpy as np
from pydantic import BaseModel


# NOTES
# COMMENTS = NEED TO ERROR CHECK = NEED TO TEST THIS TO MAKE SURE PROGRAM DOESN'T CRASH

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
  audioProcessing: Optional[str] = ''
  surgePath: Optional[str] = ''
  remoteURL: Optional[str] = ''



class StocksSonificationConfig(BaseModel):
  # ticker
  ticker: str = 'SPY'

  # general (here and below I just copied above so whenever changes are made there, reflect them here)
  num_days: Optional[int] = 400 # needs to be yfinance compatible. so may not just be int, might need string too.
  
  # related to plotting
  x_label: Optional[str] = "Time"
  y_label: Optional[str] = "Price"
  title: Optional[str] = "Price vs Time"
  graph_color: Optional[str] = 'navy' # make sure color is in matplotlib library

  # animation
  fps: Optional[int] = 30 # make sure greater than 0

  # audio
  audioProcessing: Optional[str] = ''
  surgePath: Optional[str] = ''
  remoteURL: Optional[str] = ''