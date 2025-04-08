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
import requests

# surge imports
"""import sys
sys.path.append('surge/ignore/bpy/src/surge-python')
import surgepy
from surgepy import constants as srgco"""
import wave

def grab_patch(surge_path):
    """
    Find the Surge patch file path based on the surge-python bindings path.
    
    Args:
        surge_path: Path to the surge-python bindings provided by the user
        
    Returns:
        String containing the path to the patch file or "Not Found"
    """
    import os
    
    # Normalize path separators for cross-platform compatibility
    surge_path = os.path.normpath(surge_path)
    
    # The user is providing the path to the surge-python bindings
    # We need to navigate to the patch directory from there
    
    # Try multiple approaches to find the patch
    
    # Approach 1: Check if there's a resources directory in any parent dir
    current_dir = surge_path
    for _ in range(10):  # Limit search depth to 10 levels up
        parent_dir = os.path.dirname(current_dir)
        if parent_dir == current_dir:  # Reached the root
            break
            
        # Check if resources/data exists in this parent
        resources_path = os.path.join(parent_dir, "resources", "data")
        if os.path.exists(resources_path):
            patch_path = os.path.join(resources_path, "patches_factory", "Polysynths", "Filter Sweep.fxp")
            if os.path.exists(patch_path):
                return patch_path
        
        # Move up one directory
        current_dir = parent_dir
    
    # Approach 2: Try to find the patch directly in common patterns
    # Pattern: surge-python is often in a subdirectory of the main surge directory
    parts = surge_path.split(os.sep)
    
    # Look for "surge" in the path components
    surge_indices = [i for i, part in enumerate(parts) if part.lower() == "surge"]
    
    for idx in surge_indices:
        # Reconstruct path up to this "surge" directory
        surge_dir = os.path.join(*parts[:idx+1])
        
        # Check common patch locations
        possible_paths = [
            os.path.join(surge_dir, "resources", "data", "patches_factory", "Polysynths", "Filter Sweep.fxp"),
            os.path.join(surge_dir, "..", "resources", "data", "patches_factory", "Polysynths", "Filter Sweep.fxp"),
            os.path.join(surge_dir, "..", "..", "resources", "data", "patches_factory", "Polysynths", "Filter Sweep.fxp"),
        ]
        
        for path in possible_paths:
            normalized_path = os.path.normpath(path)
            if os.path.exists(normalized_path):
                return normalized_path
    
    # Approach 3: Look for a surge-data directory which might contain resources
    for idx, part in enumerate(parts):
        if "surge" in part.lower():
            # Check if there's a resources directory nearby
            base_dir = os.path.join(*parts[:idx+1])
            possible_data_dirs = [
                os.path.join(base_dir, "resources"),
                os.path.join(base_dir, "data"),
                os.path.join(base_dir, "..", "resources"),
                os.path.join(base_dir, "..", "data"),
            ]
            
            for data_dir in possible_data_dirs:
                normalized_data_dir = os.path.normpath(data_dir)
                if os.path.exists(normalized_data_dir):
                    patch_path = os.path.join(normalized_data_dir, "patches_factory", "Polysynths", "Filter Sweep.fxp")
                    normalized_patch_path = os.path.normpath(patch_path)
                    if os.path.exists(normalized_patch_path):
                        return normalized_patch_path
    
    # If we reached here, we couldn't find the patch file
    print(f"Could not find patch file. Looking for 'Filter Sweep.fxp' relative to: {surge_path}")
    return "Not Found"
    
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

# step 3. create audio with tones
async def create_tones_audio(config: MathWaveSonificationConfig):
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
async def create_surge_audio_local(config):
    # Try to import Surge only when this function is called
    try:
        import sys
        import os
        
        # Use the path provided in the request
        if hasattr(config, 'surgePath') and config.surgePath:
            surge_path = config.surgePath
            # Clean and normalize the path
            surge_path = os.path.normpath(surge_path)
            
            # Add to Python path if it exists
            if os.path.exists(surge_path):
                sys.path.append(surge_path)
                print(f"Added surge path to system: {surge_path}")
            else:
                print(f"Warning: Provided surge path does not exist: {surge_path}")
            
        # Now try to import Surge
        import surgepy
        from surgepy import constants as srgco
        
        X, function = await parse_function(config=config)
        x = np.linspace(config.x_range_start, config.x_range_end, config.num_data_points)
        np_function = sp.lambdify(X, function, 'numpy')
        y = np_function(x)
        video_time = len(y) / config.fps
        sample_rate = 44100
    
        print("Creating Surge instance...")
        surge = surgepy.createSurge(sample_rate)
        
        # Try to load a patch
        if hasattr(config, 'surgePath') and config.surgePath:
            print(f"Finding patch from path: {config.surgePath}")
            patch_path = grab_patch(config.surgePath)
            
            if patch_path != "Not Found":
                try:
                    print(f"Loading patch from: {patch_path}")
                    surge.loadPatch(patch_path)
                    print("Patch loaded successfully")
                except Exception as e:
                    print(f"Error loading patch: {e}")
            else:
                print("No patch found, using default")
        
        # Continue with pitch configuration
        cg_Global = surge.getControlGroup(srgco.cg_GLOBAL)
        globalEnts = cg_Global.getEntries()
        globalPar = globalEnts[1].getParams()
        pitch = globalPar[1]  # global scene pitch parameter
        
        min_value = min(y)
        max_value = max(y)
        value_range = max_value - min_value
        normalized_values = [(v - min_value) / value_range for v in y]  # normalize to 0-1 scale
        
        # Calculate blocks needed for audio
        blocks_per_frame = int(sample_rate // config.fps // surge.getBlockSize()) 
        total_samples = int(np.ceil(video_time * sample_rate))
        
        # Calculate number of blocks needed and create the audio data array
        num_blocks = (total_samples + surge.getBlockSize() - 1) // surge.getBlockSize()
        audio_data = np.zeros((num_blocks, surge.getBlockSize()))
        
        print(f"Generating audio with {len(normalized_values)} frames...")
        surge.playNote(0, 60, 127, 0)  # Middle C Midi = pressed
        pos = 0
        
        # Generate audio blocks
        for i, value in enumerate(normalized_values):
            pitch_bend_amount = value * 14 - 7  # scale to middle of (-7 ... +7)
            surge.setParamVal(pitch, pitch_bend_amount)
            
            for _ in range(blocks_per_frame):
                if pos >= len(audio_data):
                    break  # Prevent index out of bounds
                    
                surge.process()
                audio_data[pos, :] = surge.getOutput()[0, :]
                pos += 1
                
        surge.releaseNote(0, 60, 0)  # release Middle C
        
        # Normalize and convert to 16-bit PCM
        audio_max = np.max(np.abs(audio_data))
        if audio_max > 0:  # Avoid division by zero
            audio_data /= audio_max
        audio_data = (audio_data * 32767).astype(np.int16)

        output_filename = 'public/animations/tones.wav'
        with wave.open(output_filename, 'w') as wavefile:
            wavefile.setnchannels(1) 
            wavefile.setsampwidth(2)   
            wavefile.setframerate(44100)
            wavefile.writeframes(audio_data.tobytes())

        print("Audio generation completed successfully")
        return {'status': 'success'}
    except ImportError as error:
        print(f"Failed to import Surge: {error}")
        print("Falling back to tones")
        return await create_tones_audio(config)
    except Exception as e:
        print(f"Error during surge audio generation: {e}")
        print("Falling back to tones")
        return await create_tones_audio(config)

# step 3b. create surge audio - remote version
async def create_surge_audio_remote(config):
    try:
        # Prepare the data
        X, function = await parse_function(config=config)
        data = {
            "function": config.function,
            "x_range_start": config.x_range_start,
            "x_range_end": config.x_range_end,
            "num_data_points": config.num_data_points,
            "fps": config.fps
        }
        
        # Send request to remote server
        response = requests.post(f"{SURGE_PI_URL}/math_audio", json=data, timeout=30)
        
        if response.status_code != 200:
            print(f"Error from remote Surge server: {response.text}")
            print("Falling back to local tones.py method")
            return await create_tones_audio(config)
        
        # Save the received WAV file
        output_dir = 'public/animations'
        os.makedirs(output_dir, exist_ok=True)
        
        with open(os.path.join(output_dir, 'tones.wav'), 'wb') as f:
            f.write(response.content)
        
        return {'status': 'success'}
    except Exception as e:
        print(f"Error with remote Surge processing: {e}")
        print("Falling back to local tones.py method")
        return await create_tones_audio(config)
        
async def create_surge_audio(config: MathWaveSonificationConfig):
    # Default to tones unless specifically configured otherwise
    if hasattr(config, 'audioProcessing'):
        if config.audioProcessing == 'surge-local':
            return await create_surge_audio_local(config)
        elif config.audioProcessing == 'surge-remote':
            remote_url = config.remoteUrl if hasattr(config, 'remoteUrl') else 'http://localhost:8888'
            return await create_surge_audio_remote(config, remote_url)
    
    # Default to standard audio
    return await create_tones_audio(config)
async def create_audio(config):
    """Create audio using the method specified in the config."""
    if hasattr(config, 'audioProcessing'):
        if config.audioProcessing == 'surge-local':
            return await create_surge_audio_local(config)
        elif config.audioProcessing == 'surge-remote':
            remote_url = config.remoteUrl if hasattr(config, 'remoteUrl') and config.remoteUrl else 'http://localhost:8888'
            return await create_surge_audio_remote(config, remote_url)
    
    # Default to tones.py
    return await create_tones_audio(config)
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

async def math_wave_sonify(config):
    # parse function and return if invalid
    try:
        X, function = await parse_function(config=config)
    except sp.SympifyError:
        return {"status": sp.SympifyError}
    
    # Create animation
    animation_result = await create_animation(config)
    if animation_result['status'] != 'success':
        return {"status": "Animation failed"}
    
    # Create audio with selected method
    audio_result = await create_audio(config)
    if audio_result['status'] != 'success':
        return {"status": "Audio generation failed"}
    
    # Combine animation and audio
    combine_result = await combine_video_audio(config)
    if combine_result['status'] != 'success':
        return {"status": "Video combination failed"}
    
    return {"status": "Animation successful"}
