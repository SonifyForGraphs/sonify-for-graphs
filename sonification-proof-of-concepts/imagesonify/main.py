import numpy as np
import matplotlib.pyplot as plt
import matplotlib.animation as animation
from PIL import Image
from tones import SINE_WAVE
from tones.mixer import Mixer
from moviepy.editor import VideoFileClip, AudioFileClip

# generating a sonification wave that moves upwards

def load_image(path):
  # load image in grayscale 
  # such that bright pixels will be 0 and dark pixels will be 255
  image = Image.open(path).convert('L')
  return np.array(image)

def main():
  image = load_image('chat.png')
  height, width = image.shape

  # set up audio mixer
  sample_rate = 44100
  mixer= Mixer(sample_rate=sample_rate, amplitude=0.5)
  mixer.create_track(0, SINE_WAVE, attack=0.1, decay=0.1)
  diff = 2
  notes = ['c', 'c#', 'd', 'd#', 'e', 'f', 'f#', 'g', 'g#', 'a', 'a#', 'b'] * (9 - 2 * diff)
  def clamp(j, diff): # returns inner values (diff inside 9)
    return max(min(len(notes) // 12, j // 12 + diff), j // 12 - diff)
  wave_audio = []

  # set up fig and axis
  fig, ax = plt.subplots()
  ax.imshow(image, cmap='gray')
  ax.axis('off')

  # initialize wave line
  x = np.arange(width)
  wave_amplitude = np.zeros(width)
  wave, = ax.plot(x, wave_amplitude, color='r', lw=2)

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
    row_audio = []
    for i, brightness in enumerate(row):
      note_index = int(np.interp(i, [0, width], [0, len(notes) - 1]))
      mixer.add_note(0, note=notes[note_index], octave=clamp(note_index, diff), amplitude=brightness / 255.0, duration=0.1)
    
    row_audio.append(mixer.mix())
    wave_audio.extend(row_audio)
    """
    return wave,

  # save animation
  fps = 30
  interval = 1000 // fps
  ani = animation.FuncAnimation(fig=fig, func=animate, frames=height + 1, interval=interval)
  Writer = animation.writers['ffmpeg']
  writer = Writer(fps=fps, metadata=dict(artist='Me'), bitrate=1800)
  ani.save('animation.mp4', writer=writer)

  """
  # finalize audio
  final_audio = np.concatenate(wave_audio)
  mixer.write_wav('tones.wav', data=final_audio)

  # combine audio and video
  video = VideoFileClip('animation.mp4')
  audio = AudioFileClip('tones.wav')
  combined = video.set_audio(audio)
  combined.write_videofile(f'image_sonify.mp4', 
                           codec='libx264',
                           audio_codec='aac',
                           temp_audiofile='temp-audio.m4a',
                           remove_temp=True
                           )
  """
if __name__ == '__main__':
  main()