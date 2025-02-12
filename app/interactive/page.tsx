'use client';
import React, { useState, useRef, useLayoutEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { InteractiveBreadcrumb } from '@/components/interactive-breadcrumb';

// allows us to attach gainNode (volume setting) to the main Audio Context
interface CustomAudioContext extends AudioContext {
  gainNode?: GainNode;
}

export default function Interactive() {
  // state variables
  const [image, setImage] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    // file found
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setImage(e.target.result as string);
        drawImageOnCanvas(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const drawImageOnCanvas = (src: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const maxWidth = 600
      const maxHeight = 600;
      const aspectRatio = img.width / img.height;
      console.log(img.width, img.height, aspectRatio);
      // doesn't work. right now I just set max height to be like 700 in the canvas element
      // works but it warps the aspect ratio so everything looks a little off
      if (img.width > maxWidth) {
        canvas.width = maxWidth;
        canvas.height = Math.round(canvas.width / aspectRatio);
      } else if (img.height > maxHeight) {
        canvas.height = maxHeight;
        canvas.width = Math.round(canvas.height * aspectRatio);
      } else {
        canvas.width = img.width;
        canvas.height = img.height;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      imageRef.current = img;

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels: number[][][] = [];

      for (let y = 0; y < canvas.height; y++) {
        const row = [];
        for (let x = 0; x < canvas.width; x++) {
          const i = (y * canvas.width + x) * 4;
          row.push([
            imageData.data[i],
            imageData.data[i + 1],
            imageData.data[i + 2],
            imageData.data[i + 3],
          ]);
        }
        pixels.push(row);
      }

      pixelArrayRef.current = pixels;
      visitRef.current = Array.from({ length: canvas.height }, () =>
        Array(canvas.width).fill(false)
      );
    };
    img.src = src;
  };

  const startBFS = useCallback(
    (startX: number, startY: number) => {
      // avoid multiple animations
      if (isAnimating) {
        return;
      }

      const canvas = canvasRef.current;
      if (!canvas) return;
      // reset everything
      queueRef.current = [];
      visitRef.current = Array.from({ length: canvas.height }, () =>
        Array(canvas.width).fill(false)
      );

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

  const handleCanvasClick = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (canvas && pixelArrayRef.current) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const x = Math.floor((event.clientX - rect.left) * scaleX);
        const y = Math.floor((event.clientY - rect.top) * scaleY);

        if (
          y < 0 ||
          y >= pixelArrayRef.current.length ||
          x < 0 ||
          x >= pixelArrayRef.current[0].length
        ) {
          console.log(`Invalid click coordinates: (${x}, ${y})`);
          return;
        }

        const color = pixelArrayRef.current[y][x];
        console.log(`Clicked color at (${x}, ${y}): `, color);
        startBFS(x, y);
      }
    },
    [startBFS]
  );

  useLayoutEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <InteractiveBreadcrumb />
        <div className='flex flex-1 items-center gap-4 p-4 pt-0'>
          <Card className='w-full p-4'>
            <CardContent className='flex flex-col gap-4 justify-items-end'>
              <canvas
                ref={canvasRef}
                onClick={handleCanvasClick}
                className='border rounded-md shadow-sm max-h-[calc(700px)]'
                aria-label='Image canvas where users can click to generate sonification waves that begin from the clicked point'
                role='img'
              />
              <input
                type='file'
                accept='image/*'
                onChange={handleFileChange}
                ref={fileInputRef}
                className='hidden'
                aria-labelledby='upload-button'
              />

              <Button onClick={() => fileInputRef.current?.click()} id='upload-button' aria-label='Upload an image'>
                Upload Image
              </Button>

              {image && (
                <Button
                  variant='destructive'
                  onClick={() => {
                    setImage(null);
                    if (canvasRef.current) {
                      const ctx = canvasRef.current.getContext('2d');
                      ctx?.clearRect(
                        0,
                        0,
                        canvasRef.current.width,
                        canvasRef.current.height
                      );
                    }
                  }}
                  aria-label='Clear the uploaded image.'
                >
                  Clear Image
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
