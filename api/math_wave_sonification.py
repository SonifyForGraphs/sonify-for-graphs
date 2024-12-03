import numpy as np
import sympy as sp
import os
import matplotlib.pyplot as plt
import matplotlib.animation as animation
from tones import SINE_WAVE
from tones.mixer import Mixer
from moviepy.editor import VideoFileClip, AudioFileClip
from api.utils import MathWaveSonificationConfig
from pathlib import Path

# surge imports
import sys
sys.path.append('surge/ignore/bpy/src/surge-python')
import surgepy
from surgepy import constants as srgco
import wave


# step 1. parse function
async def parse_function(config: MathWaveSonificationConfig):
  X = sp.symbols('x')
  function = sp.sympify(config.function, locals={'x': X, 'sin': sp.sin, 'cos': sp.cos, 'tan': sp.tan})
  return X, function

# step 2. create animation
async def create_animation(config: MathWaveSonificationConfig):
  # guaranteed to work now
  X, function = await parse_function(config=config)

  x = np.linspace(config.x_range_start, config.x_range_end, config.num_data_points)
  np_function = sp.lambdify(X, function, 'numpy')
  y = np_function(x)
 
  # save animation
  fig = plt.figure()
  fig.suptitle(f'{config.title}')
  plt.xlabel(config.x_label)
  plt.ylabel(config.y_label)
  plt.grid()
  plt.ylim((min(y) - 1, max(y) + 1))
  
  def animate(n):
    line, = plt.plot(x[:n], y[:n], color=config.graph_color)
    return line,
  
  fps = config.fps
  frames = len(y)
  interval = 1000 /fps
 
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
async def create_audio(config: MathWaveSonificationConfig):
  X, function = await parse_function(config=config)
  x = np.linspace(config.x_range_start, config.x_range_end, config.num_data_points)
  np_function = sp.lambdify(X, function, 'numpy')
  y = np_function(x)
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
async def combine_video_audio(config: MathWaveSonificationConfig):
  # combine audio and video
  output_dir = 'public/animations'
  video = VideoFileClip(output_dir + '/animation.mp4')
  audio = AudioFileClip(output_dir + '/tones.wav')
  combined = video.set_audio(audio)
  
  combined.write_videofile(f'{output_dir}/{config.function}.mp4', 
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
# assumes video was uploaded successfully
# NEED NICK TO UPDATE TONES.WAV WITH WHATEVER FILE SURGE PRODUCES
async def delete_intermediate_files(config: MathWaveSonificationConfig):
  animation_file = Path(f'public/animations/animation.mp4')
  audio_file = Path(f'public/animations/tones.wav')
  final_video_file = Path(f'public/animations/{config.function}.mp4')

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

async def math_wave_sonify(config: MathWaveSonificationConfig):
  # parse function and return if invalid
  try:
    X, function = await parse_function(config=config)
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
  output_dir = '/animations'
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


# step 3a. create surge audio
# code is originally from Nick. just modified to integrate into the project
async def create_surge_audio(config: MathWaveSonificationConfig):
  X, function = await parse_function(config=config)
  x = np.linspace(config.x_range_start, config.x_range_end, config.num_data_points)
  np_function = sp.lambdify(X, function, 'numpy')
  y = np_function(x)
  video_time = len(y) / config.fps
  sample_rate = 44100
  print('sup here')  
  surge = surgepy.createSurge(sample_rate)
  
  #Following section created with the help of the example here:https://github.com/surge-synthesizer/surge/blob/main/scripts/ipy/Demonstrate%20Surge%20in%20Python.ipynb
    
  cg_OSC = surge.getControlGroup(srgco.cg_OSC) #query for oscillator control group constants
  osc0 = cg_OSC.getEntries()[0]       #get first oscillator
  osc0_parameters = osc0.getParams()  #get oscillator parameters
  osc0_pitch = osc0_parameters[2]    #grab pitch control parameter
  osc0_type = osc0_parameters[0] #grab oscillator type control
  surge.setParamVal(osc0_type, 1)#[0 = saw; 1 = sin; 2 = ] 
    
  mod_wheel = surge.getModSource(srgco.ms_modwheel) #grab mod wheel
  surge.setModDepth01(osc0_pitch, mod_wheel, 1)      #attach mod wheel to pitch with full range (1)
    
  min_value = min(y)
  max_value = max(y)
  value_range = max_value - min_value
  normalized_values = [(v - min_value) / value_range for v in y]  #normalize to 0-1 scale
    
  #see surge starter file in repository for derivation
  blocks_per_frame = sample_rate // config.fps // surge.getBlockSize() 
  total_samples = int(video_time * sample_rate)
  #create output array of size = [# of blocks][size of block]
  audio_data = np.zeros((total_samples // surge.getBlockSize(), surge.getBlockSize()))   
  
  surge.playNote(0, 60, 127, 0)       # Middle C Midi = pressed
  pos = 0
  #pitch bend max/min parameters are +7/-7, therefore we must normalize the function output between (+/-)7
  for i, value in enumerate(normalized_values):   #for each frame of animation
      pitch_bend_amount = value * 14 - 7          #scale to middle of (-7 ... +7)
      surge.setParamVal(osc0_pitch, pitch_bend_amount) #set oscillator pitch bend
        
      for _ in range(blocks_per_frame):           #for each block in this frame
          surge.process()                         #write current block with adjusted pitch
          audio_data[pos, :] = surge.getOutput()[0, :]   #write most recent block to audio_data
          pos += 1
  surge.releaseNote(0, 60, 0) #release Middle C
    
  #must normalize between (-32767 ... 32767) as 16 bit integers (PCM encoding for .wav format)
  #credit to Bartosz Zaczyński at realpython.com (https://realpython.com/python-wav-files/) for their helpful article providing an example to learn from
  audio_max = np.max(np.abs(audio_data))
  audio_data /= audio_max
  audio_data = (audio_data * 32767).astype(np.int16)

  #mixer.write_wav(output_dir + '/tones.wav')
  output_filename = 'public/animations/tones.wav'
  with wave.open(output_filename, 'w') as wavefile:
        wavefile.setnchannels(1) 
        wavefile.setsampwidth(2)   
        wavefile.setframerate(44100)
        wavefile.writeframes(audio_data.tobytes())

  return {'status': 'success'}