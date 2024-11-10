import numpy as np
import sympy as sp
import os
import matplotlib.pyplot as plt
import matplotlib.animation as animation
from tones import SINE_WAVE
from tones.mixer import Mixer
from moviepy.editor import VideoFileClip, AudioFileClip
from api.utils import MathWaveSonificationConfig

async def math_wave_sonify(config: MathWaveSonificationConfig):
  # parse function and return if invalid
  try:
    X = sp.symbols('x')
    function = sp.sympify(config.function, locals={'x': X, 'sin': sp.sin, 'cos': sp.cos, 'tan': sp.tan})
  except sp.SympifyError:
    return {"status": sp.SympifyError}
  
  x = np.linspace(config.x_range_start, config.x_range_end, config.num_data_points)
  np_function = sp.lambdify(X, function, 'numpy')
  y = np_function(x)
  
  # save animation
  fig = plt.figure()
  fig.suptitle(f'{function}')
  plt.xlabel(config.x_label)
  plt.ylabel(config.y_label)
  plt.grid()
  plt.ylim((min(y) - 1, max(y) + 1))
  
  
  def animate(n):
    line, = plt.plot(x[:n], y[:n], color=config.graph_color)
    return line,
  
  fps = config.fps
  frames = len(y)
  video_time = frames / fps
  interval = 1000 /fps
 
  ani = animation.FuncAnimation(fig=fig, func=animate, frames=frames, interval=interval, blit=True)
  Writer = animation.writers['ffmpeg']
  writer = Writer(fps=fps, metadata=dict(artist='Me'), bitrate=1800)

  # make sure directory exists
  output_dir = 'public/animations'
  os.makedirs(output_dir, exist_ok=True)
  file_path = os.path.join(output_dir, 'animation.mp4')
  ani.save(file_path, writer=writer)

  # generate audio
  diff = 2
  notes = ['c', 'c#', 'd', 'd#', 'e', 'f', 'f#', 'g', 'g#', 'a', 'a#', 'b'] * (9 - 2 * diff)
  # (octaves are 0 - 8 as per tones package)
  # but skipping lowest 2 since you can't hear them and highest 2 since they sound bad

  num_notes = len(notes)
  min_value = min(y)
  max_value = max(y)
  value_range = np.linspace(min_value, max_value, num_notes)
  mixer = Mixer(44100, 0.5)
  mixer.create_track(0, SINE_WAVE, attack=0.01, decay=0.1)

  def clamp(j, diff): # returns inner values (diff inside 9)
    return max(min(len(notes) // 12, j // 12 + diff), j // 12 - diff)

  for i, value in enumerate(y):
    for j, v in enumerate(value_range):
      if value < v:
        if i < len(y) - 1:
          if y[i + 1] > y[i] and j < len(value_range) - 1:
            mixer.add_note(0, note=notes[j], octave=clamp(j, diff), duration=video_time / len(y), endnote=notes[j + 1])
          else:
            mixer.add_note(0, note=notes[j], octave=clamp(j, diff), duration=video_time / len(y), endnote=notes[j - 1])
        break
  
  mixer.write_wav(output_dir + '/tones.wav')
  # combine audio and video
  video = VideoFileClip(output_dir + '/animation.mp4')
  audio = AudioFileClip(output_dir + '/tones.wav')
  combined = video.set_audio(audio)
  combined.write_videofile(f'{output_dir}/{function}.mp4', 
                           codec='libx264',
                           audio_codec='aac',
                           temp_audiofile='temp-audio.m4a',
                           remove_temp=True
                           )
  # cleanup
  plt.close(fig)
  combined.close()
  video.close()
  audio.close()
  return {"status": "Animation successful"}