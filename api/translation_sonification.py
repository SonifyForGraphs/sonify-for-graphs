from fastapi import UploadFile, File
from PIL import Image
import numpy as np
import io
from tones import SINE_WAVE
from tones.mixer import Mixer
from moviepy.editor import VideoFileClip, AudioFileClip
import matplotlib.pyplot as plt
import matplotlib.animation as animation
import os
from pathlib import Path


# step 1. do everything
async def create_translation(file: UploadFile = File(...)):
  # read the image
  image_data = await file.read()

  # convert the image into a numpy array
  image = np.array(Image.open(io.BytesIO(image_data)).convert('L')) # L means grayscale
  height, width = image.shape

  # set up audio mixer
  sample_rate = 44100
  fps = 30
  interval = 1000 // fps
  video_time = interval * height
  mixer = Mixer(sample_rate=sample_rate, amplitude=0.5)
  mixer.create_track(0, SINE_WAVE, attack=0.1, decay=0.1)
  diff = 2
  notes = ['c', 'c#', 'd', 'd#', 'e', 'f', 'f#', 'g', 'g#', 'a', 'a#', 'b'] * (9 - 2 * diff)
  def clamp(j, diff): # returns inner values (diff inside 9)
    return max(min(len(notes) // 12, j // 12 + diff), j // 12 - diff)

  # set up fig and axis
  fig, ax = plt.subplots()
  ax.imshow(image, cmap='gray')
  ax.axis('off')

  # initialize wave line
  x = np.arange(width)
  wave_amplitude = np.zeros(width)
  wave, = ax.plot(x, wave_amplitude, color='r', lw=2)

  #for i in range(height + 1):
  #    mixer.create_track(i, SINE_WAVE, attack=0.1, decay=0.1)

  # update horizontal line's vertical position every frame
  def animate(n):
    # line reaches the top of the image
    if n >= height:
      ani.event_source.stop()
    
    row = image[height - n - 1, :]
    wave_amplitude = ((255 - row) / 255.0) * 20 - 10
    wave.set_ydata(wave_amplitude + height - n - 1)

    """
    # generate audio for the current row
    for i, brightness in enumerate(set(row)):
      note_index = int(np.interp(i, [0, width], [0, len(notes) - 1]))
      mixer.add_note(i, note=notes[note_index], octave=clamp(note_index, diff), amplitude=brightness / 255.0, duration=0.01)
    """
    average_brightness = np.mean(row)
    note_index = int(np.interp(average_brightness, [0, 255], [0, len(notes) - 1]))
    mixer.add_note(0, note=notes[note_index], octave=clamp(note_index, diff), amplitude=average_brightness / 255.0, duration= 1 / height)

    return wave,

  # make sure output directory exists
  output_dir = 'public/animations'
  os.makedirs(output_dir, exist_ok=True)

  # save animation
  ani = animation.FuncAnimation(fig=fig, func=animate, frames=height + 1, interval=interval)
  Writer = animation.writers['ffmpeg']
  writer = Writer(fps=fps, metadata=dict(artist='Me'), bitrate=1800)
  animation_filepath = os.path.join(output_dir, 'animation.mp4')
  ani.save(animation_filepath, writer=writer)

  
  # finalize audio
  #final_audio = np.concatenate(wave_audio)
  mixer.mix()
  mixer.write_wav(output_dir + '/tones.wav')
  #print(final_audio)

  # combine audio and video
  video = VideoFileClip(output_dir + '/animation.mp4')
  audio = AudioFileClip(output_dir + '/tones.wav')
  combined = video.set_audio(audio)
  combined.write_videofile(f'{output_dir}/translation_sonify.mp4', 
                           codec='libx264',
                           audio_codec='aac',
                           temp_audiofile='temp-audio.m4a',
                           remove_temp=True
                           )

  combined.close()
  video.close()
  audio.close()
  return {'status': 'success'}

async def delete_intermediate_translation_files():
  animation_file = Path(f'public/animations/animation.mp4')
  audio_file = Path(f'public/animations/tones.wav')
  final_video_file = Path(f'public/animations/translation_sonify.mp4')

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