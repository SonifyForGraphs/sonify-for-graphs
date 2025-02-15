# Surge Synthesizer Python Sonification

## Overview
This file demonstrates how to use the Surge Synthesizer with Python bindings to create an audio representation of a mathematical function.
For an extensive tutorial on how to use the Surge Synthesizer broadly, please see their manual on Github: https://surge-synthesizer.github.io/manual/#getting-started

## Key Concepts

### Block in Surge Synthesizer
A "Block" is a discrete unit of synth control, measured in individual samples:

1. **Block Size Calculation**:
   - $\text{Block Size} =\frac{\text{Samples}}{\text{Block}}$


2. **Blocks per Frame Equation**:
   - $\text{Number of Blocks per Frame} = \frac{\frac{\text{Sample Rate}}{\text{FPS}}}{\text{Block Size}}$

## Prerequisites
- Python libraries:
  - NumPy
  - Matplotlib
  - MoviePy
  - SurgePy
- FFmpeg

## Code Explanation

### Imports and Setup
```python
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.animation as animation
from moviepy.editor import VideoFileClip, AudioFileClip
import sys
sys.path.append("C:/path/to/surgepy/bindings") #Replace this path with the appropriate path based on your system's Surge build
import surgepy
from surgepy import constants as srgco
import wave
```

### Audio Synthesis Process
1. Create Surge synthesizer instance
2. Grab Surge oscillator controls
3. Normalize function values
4. Generate audio and modulate pitch
5. Convert audio to WAV format

## Workflow
1. Generate mathematical function data (Passed by user in final product)
2. Create animated plot
3. Initialize Surge synthesizer
4. Map function values to audio pitch
5. Generate audio samples
6. Combine animation and audio


## References
- [Surge Synthesizer GitHub Repository](https://github.com/surge-synthesizer/surge)
- [Real Python WAV File Tutorial](https://realpython.com/python-wav-files/)
