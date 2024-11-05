import numpy as np
import matplotlib.pyplot as plt
import matplotlib.animation as animation
from moviepy.editor import VideoFileClip, AudioFileClip
import sys
sys.path.append("C:/path/to/surgepy/bindings")
from surgepy import constants as srgco
import surgepy
import wave

def main():
    function = "y = 2 * (x - floor(x)) - 1"
    x = np.linspace(0, 25 * np.pi, 400) /5 #uncomment /5 for saw, too fast otherwise
    y = 2 * (x - np.floor(x)) - 1
    #function = "y = sin(x)"
    #y = np.sin(x)
    #function = "y = x * sin(x)"
    #y = x * np.sin(x)
    fig = plt.figure()
    fig.suptitle(f'{function}')
    plt.xlabel('x [rad]')
    plt.ylabel('y')
    plt.grid()
    plt.ylim((min(y) - 1, max(y) + 1))
    
    def animate(n):
        line, = plt.plot(x[:n], y[:n], color = 'navy')
        return line,
    
    fps = 30
    sample_rate = 44100
    frames = len(y)
    video_time = frames / fps
    interval = 20
    ani = animation.FuncAnimation(fig=fig, func=animate, frames=frames, interval=interval, blit=True)
    Writer = animation.writers['ffmpeg']
    writer = Writer(fps=fps, metadata=dict(artist='Me'), bitrate=18000)
    ani.save('animation.mp4', writer=writer)
    surge = surgepy.createSurge(sample_rate) #create surge synthesizer with scene frequency=44100 Hz
    
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
    blocks_per_frame = sample_rate // fps // surge.getBlockSize() 
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
    
    output_filename = 'synth_audio.wav'
    with wave.open(output_filename, 'w') as wavefile:
        wavefile.setnchannels(1) 
        wavefile.setsampwidth(2)   
        wavefile.setframerate(44100)
        wavefile.writeframes(audio_data.tobytes())
    video = VideoFileClip('animation.mp4')
    audio = AudioFileClip('synth_audio.wav')
    combined = video.set_audio(audio)
    combined.write_videofile('saw.mp4',
                             codec='libx264',
                             audio_codec='aac',
                             temp_audiofile='temp-audio.m4a',
                             remove_temp=True)
    print(f'Audio saved to {output_filename}')
if __name__ == '__main__':
    main()
