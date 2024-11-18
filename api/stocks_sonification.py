import numpy as np
import os
import matplotlib.pyplot as plt
import matplotlib.animation as animation
from tones import SINE_WAVE
from tones.mixer import Mixer
from moviepy.editor import VideoFileClip, AudioFileClip
from api.utils import StocksSonificationConfig
from pathlib import Path
import yfinance as yf

# step 1. validate stock
async def validate_ticker(config: StocksSonificationConfig):
  ticker = yf.Ticker(config.ticker)
  return ticker

# step 2. create animation
async def create_stocks_animation(config: StocksSonificationConfig):
  ticker = yf.Ticker(config.ticker)
  # ['Open', 'High', 'Low', 'Close', 'Volume', 'Dividends', 'Stock Splits']
  hist = ticker.history(period='2y')
  x = np.array([i for i in range(len(hist))])
  y = np.array([row['Close'] for _, row in hist.iterrows()])

  # save animation
  fig = plt.figure()
  fig.suptitle(config.title)
  plt.xlabel(config.x_label)
  plt.ylabel(config.y_label)
  plt.grid()
  
  def animate(n):
    line, = plt.plot(x[:n], y[:n], color=config.graph_color)
    return line,
  
  fps = config.fps
  frames = len(y)
  interval = 1000 / fps

  ani = animation.FuncAnimation(fig=fig, func=animate, frames=frames, interval=interval, blit=True)
  Writer = animation.writers['ffmpeg']
  writer = Writer(fps=fps, metadata=dict(artist='Me'), bitrate=1800)

  # make sure directory exists
  output_dir = 'public/animations'
  os.makedirs(output_dir, exist_ok=True)
  file_path = os.path.join(output_dir, 'animation.mp4')
  ani.save(file_path, writer=writer)
  plt.close(fig)
  return {'status': 'success'}

# step 3. create audio
async def create_stocks_audio(config: StocksSonificationConfig):
  ticker = yf.Ticker(config.ticker)
  hist = ticker.history(period='2y')
  x = np.array([i for i in range(len(hist))])
  y = np.array([row['Close'] for _, row in hist.iterrows()])
  output_dir = 'public/animations'
  video_time = len(y) / config.fps

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
  return {'status': 'success'}


# step 4. combine video and audio
async def combine_stocks_video_audio(config: StocksSonificationConfig):
  # combine audio and video
  output_dir = 'public/animations'
  print('before video')
  video = VideoFileClip(output_dir + '/animation.mp4')
  print('after video')
  audio = AudioFileClip(output_dir + '/tones.wav')
  combined = video.set_audio(audio)
  
  combined.write_videofile(f'{output_dir}/{config.ticker}.mp4', 
                           codec='libx264',
                           audio_codec='aac',
                           temp_audiofile='temp-audio.m4a',
                           remove_temp=True
                           )
  # cleanup
  combined.close()
  video.close()
  audio.close()
  return {'status': 'success'}


# step 5. delete intermediate video, audio, and final video
async def delete_intermediate_stocks_files(config: StocksSonificationConfig):
  animation_file = Path(f'public/animations/animation.mp4')
  audio_file = Path(f'public/animations/tones.wav')
  final_video_file = Path(f'public/animations/{config.ticker}.mp4')

  # put in list to iterate
  to_delete = [animation_file, audio_file, final_video_file]

  # iterate
  for file_path in to_delete:
    try:
      # check if exists first
      if file_path.exists():
        # delete the file
        file_path.unlink()
        print(f'deleted: {file_path}')
      
      else:
        print(f'file not found. skipping {file_path}')
    except Exception as e:
      print(f'error deleting {file_path}: {e}')