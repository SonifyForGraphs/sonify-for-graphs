'use client';
import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';

// allows us to attach gainNode (volume setting) to the main Audio Context
interface CustomAudioContext extends AudioContext {
  gainNode?: GainNode;
}

export function Canvas() {
  // variable declaration
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pixelArrayRef = useRef<number[][][] | null>(null);
  const queueRef = useRef<number[][]>([]);
  const visitRef = useRef<boolean[][]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const audioRef = useRef<CustomAudioContext | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // sound stuff
  useLayoutEffect(() => {
    const context = new AudioContext();
    audioRef.current = context;

    // this is so audio doesn't blast at full volume and blow out your speakers
    const gainNode = context.createGain();
    // set volume to 10%
    gainNode.gain.setValueAtTime(0.1, context.currentTime);
    gainNode.connect(context.destination);

    audioRef.current.gainNode = gainNode;

    // if we get mp3s from Serum, could try the following where we map from 0 to 256 and use custom mp3s
    /*
      const sounds = useRef<Map<string, HTMLAudioElement>>(new Map());
      for (let i = 0; i < 256; i += 32) {
        const audio = new Audio(`frequency-${i}.mp3`);
        sounds.current.set(`color-${i}`, audio);
      }
    */
  }, []);

  // load canvas and populate bfs queue
  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (context) {
        // load background image
        const image = new Image();
        image.src = '/pink10.jpg';
        image.crossOrigin = 'anonymous';

        // draw image on canvas upon loading it
        image.onload = () => {
          console.log('image loaded: ', image.width, image.height);
          canvas.width = image.width;
          canvas.height = image.height;
          context.drawImage(image, 0, 0);

          // assign user image to imageRef
          imageRef.current = image;

          const imageData = context.getImageData(
            0,
            0,
            image.width,
            image.height
          );

          const pixels: number[][][] = [];
          // y in outer loop instead of x to simulate y going down the page and x going across the page
          // origin still in top corner
          for (let y = 0; y < image.height; y++) {
            const row = [];
            for (let x = 0; x < image.width; x++) {
              // image data is a flat 1D array
              // so we need to take the current height and multiply it by the number of columns to get the true postion
              // then add x to get the current column in the hypothetical row
              // multiplied by 4 since there are 4 items per pixel
              const i = (y * image.width + x) * 4;
              row.push([
                imageData.data[i],
                imageData.data[i + 1],
                imageData.data[i + 2],
                imageData.data[i + 3],
              ]);
            }
            pixels.push(row);
          }
          console.log(imageData);
          // populating the pixel array and visit refs for later sound and BFS
          pixelArrayRef.current = pixels;
          // fill grid with false since none have been visited yet
          visitRef.current = Array.from({ length: image.height }, () =>
            Array(image.width).fill(false)
          );
        };

        image.onerror = (error) =>
          console.error('error loading the image: ', error);
      }

    }
  }, []);
  const startBFS = useCallback(
    (startX: number, startY: number) => {
      // avoid multiple animations
      if (isAnimating) {
        return;
      }

      // helper functions
      const invalid = (r: number, c: number) => {
        return r < 0 || c < 0 || r >= visit[0].length || c >= visit.length;
      };

      const calculateAveragePixelColor = (
        pixels: number[][]
      ): [number, number, number] => {
        let rSum = 0,
          gSum = 0,
          bSum = 0;
        pixels.forEach(([r, g, b]) => {
          rSum += r;
          gSum += g;
          bSum += b;
        });
        return [
          rSum / pixels.length,
          gSum / pixels.length,
          bSum / pixels.length,
        ];
      };

      const colorToFrequency = ([r, g, b]: [
        number,
        number,
        number
      ]): number => {
        // luminance / brightness calculation
        // https://en.wikipedia.org/wiki/Relative_luminance
        const brightness = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        const lowerBoundFrequency = 100; // Hz
        const upperBoundFrequency = 500; // Hz

        // interpolate
        return (
          lowerBoundFrequency +
          (brightness / 255) * (upperBoundFrequency - lowerBoundFrequency)
        );
      };

      const playSound = (frequency: number) => {
        if (!frequency) {
          return;
        }
        const context = audioRef.current;
        const gainNode = context?.gainNode;
        if (context && gainNode) {
          const oscillator = context.createOscillator();
          oscillator.type = 'sawtooth'; // also custom, sawtooth, square, triangle, sine
          oscillator.frequency.setValueAtTime(frequency, context.currentTime);
          oscillator.connect(gainNode);
          oscillator.start();
          oscillator.stop(context.currentTime + 0.05); // plays sound for 0.05 seconds
        }
      };

      const queue = queueRef.current;
      const visit = visitRef.current;
      const neighbors = [
        [0, 1],
        [1, 0],
        [0, -1],
        [-1, 0],
        [1, 1],
        [1, -1],
        [-1, 1],
        [-1, -1],
      ];
      queue.push([startY, startX]);
      setIsAnimating(true);

      function BFS() {
        const context = canvasRef.current?.getContext('2d');
        // base case in case canvas or image didn't load
        if (!context || queue.length === 0) {
          setIsAnimating(false);
          return;
        }

        // clear the canvas for the new frame
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);

        // redraw the user image
        context.drawImage(imageRef.current!, 0, 0);

        // to keep track of the ring pixels: ie only pixels we want to print
        // also used to calculate the average color for the sound
        const ringPixels: number[][] = [];

        // do BFS
        for (let i = 0; i < queue.length; i++) {
          if (queue.length === 0) {
            break;
          }

          // pop the queue
          const [y, x] = queue.shift()!;

          // check if in visit
          if (visit[y][x]) {
            continue;
          }

          // otherwise mark as visited
          visit[y][x] = true;

          // draw the pixel
          context.fillStyle = 'rgba(255, 0, 0, 0.5)';
          context.fillRect(x, y, 2, 2);

          // store the pixel for average color calculation
          ringPixels.push(pixelArrayRef.current![y][x]);

          // add neighbors to the queue
          neighbors.forEach(([dy, dx]) => {
            if (!invalid(x + dx, y + dy) && !visit[y + dy][x + dx]) {
              queue.push([y + dy, x + dx]);
            }
          });
        }

        // perform average color calculation
        // and get the sound frequency
        const averageColor = calculateAveragePixelColor(ringPixels);
        const frequency = colorToFrequency(averageColor);
        console.log(`Frequency: ${frequency} Hz`);
        playSound(frequency);

        animationFrameRef.current = requestAnimationFrame(BFS);
      }
      BFS();
    },
    [isAnimating]
  );

  // get the coordinates when the canvas is clicked
  const handleCanvasClick = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (canvas && pixelArrayRef.current) {
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor(event.clientX - rect.left);
        const y = Math.floor(event.clientY - rect.top);
        const color = pixelArrayRef.current[y][x];
        console.log(`Clicked color at (${x}, ${y}): `, color);
        startBFS(x, y);
      }
    },
    [startBFS]
  );

  // end animation when the component unmounts
  useLayoutEffect(() => {
    const animationFrameID = animationFrameRef.current;
    return () => {
      if (animationFrameID) {
        cancelAnimationFrame(animationFrameID);
      }
    };
  }, []);

  return <canvas ref={canvasRef} onClick={handleCanvasClick} />;
}
