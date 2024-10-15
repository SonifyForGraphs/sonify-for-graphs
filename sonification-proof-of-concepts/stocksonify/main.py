import numpy as np
import matplotlib.pyplot as plt
import matplotlib.animation as animation
import yfinance as yf
from tones import SINE_WAVE
from tones.mixer import Mixer
from moviepy.editor import VideoFileClip, AudioFileClip

def main():
  # stock stuff
  ticker = yf.Ticker('SPY')
  # ['Open', 'High', 'Low', 'Close', 'Volume', 'Dividends', 'Stock Splits']
  hist = ticker.history(period='2y')
  x = np.array([i for i in range(len(hist))])
  y = np.array([row['Close'] for _, row in hist.iterrows()])

  # save animation
  fig = plt.figure()
  fig.suptitle(f'{ticker.ticker} Price Movement')
  def animate(n):
    line, = plt.plot(x[:n], y[:n], color='g')
    return line,
  
  fps = 30
  frames = len(y)
  video_time = frames / fps
  interval = 20
  ani = animation.FuncAnimation(fig=fig, func=animate, frames=frames, interval=interval, blit=True)
  Writer = animation.writers['ffmpeg']
  writer = Writer(fps=fps, metadata=dict(artist='Me'), bitrate=1800)
  ani.save('animation.mp4', writer=writer)
  #plt.show()

  # generate audio
  diff = 2
  notes = ['c', 'c#', 'd', 'd#', 'e', 'f', 'f#', 'g', 'g#', 'a', 'a#', 'b'] * (9 - 2 * diff)
  # (octaves are 0 - 8 as per tones package)
  # but skipping lowest 2 since you can't hear them and highest 2 since they sound bad

  num_notes = len(notes)
  high_price = max(y)
  low_price = min(y)
  price_range = np.linspace(low_price, high_price, num_notes)
  #hz_range = np.linspace(20, 15000, num_notes)
  mixer = Mixer(44100, 0.5)
  mixer.create_track(0, SINE_WAVE, attack=0.01, decay=0.1)
  
  def clamp(j, diff): # returns inner values (diff inside 9)
    return max(min(len(notes) // 12, j // 12 + diff), j // 12 - diff)
  
  for i, price in enumerate(y):
    for j, p in enumerate(price_range):
      if price < p:
        if i < len(y) - 1:
          if y[i + 1] > y[i] and j < len(price_range) - 1:
            mixer.add_note(0, note=notes[j], octave=clamp(j, diff), duration=video_time / len(y), endnote=notes[j + 1])
          else:
            mixer.add_note(0, note=notes[j], octave=clamp(j, diff), duration=video_time / len(y), endnote=notes[j - 1])
        break
  
  mixer.write_wav('tones.wav')

  
  # combine audio and video
  video = VideoFileClip('animation.mp4')
  audio = AudioFileClip('tones.wav')
  combined = video.set_audio(audio)
  combined.write_videofile(f'{ticker.ticker}.mp4', 
                           codec='libx264',
                           audio_codec='aac',
                           temp_audiofile='temp-audio.m4a',
                           remove_temp=True
                           )
  

if __name__ == '__main__':
  main()