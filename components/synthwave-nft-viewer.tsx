'use client'

import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

const contractAddress = '0x1f7979C368c82dc647E075FfD61ed149052e3D6B';
const rpcUrl = 'https://base.meowrpc.com';

export function SynthwaveNftViewer() {
  const [tokenNumber, setTokenNumber] = useState('')
  const [status, setStatus] = useState('')
  const [svgContent, setSvgContent] = useState('')

  const fetchAndDisplaySVG = async () => {
    setStatus('Fetching data...')
    setSvgContent('')

    try {
      const data = {
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_call',
        params: [{
          to: contractAddress,
          data: `0xc87b56dd${parseInt(tokenNumber).toString(16).padStart(64, '0')}`
        }, 'latest']
      };

      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (result.error) {
        throw new Error(result.error.message);
      }

      setStatus('Decoding data...');
      const cleanedHex = result.result.slice(2);
      const offset = parseInt(cleanedHex.slice(0, 64), 16);
      const length = parseInt(cleanedHex.slice(64, 128), 16);
      const dataHex = cleanedHex.slice(128, 128 + length * 2);

      let tokenURI = '';
      for (let i = 0; i < dataHex.length; i += 2) {
        tokenURI += String.fromCharCode(parseInt(dataHex.slice(i, i + 2), 16));
      }

      if (!tokenURI.startsWith('data:application/json;base64,')) {
        throw new Error('Unexpected tokenURI format');
      }

      const jsonData = atob(tokenURI.split(',')[1]);
      const metadata = JSON.parse(jsonData);

      if (metadata.image) {
        const svgimg = atob(metadata.image.replace(/data:image\/svg\+xml;base64,/, ''));
        setSvgContent(svgimg);
        setStatus('Pepe displayed successfully!');
      } else {
        setStatus('No image data found in the metadata.');
      }
    } catch (error) {
      console.error('Error:', error);
      setStatus(`Error: ${error instanceof Error ? error.message : 'An unknown error occurred'}`);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-pink-800 to-orange-600 text-white p-4 font-['Orbitron']">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&display=swap');

        .synthwave-bg {
          background-image: 
            linear-gradient(to bottom, rgba(128, 0, 128, 0.5), rgba(255, 165, 0, 0.5)),
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(128, 128, 128, 0.3) 2px,
              rgba(128, 128, 128, 0.3) 4px
            );
          background-size: 100% 100%, 100% 20px;
          animation: scroll-background 5s linear infinite;
        }

        @keyframes scroll-background {
          from {
            background-position: 0 0, 0 0;
          }
          to {
            background-position: 0 100%, 0 100%;
          }
        }

        .neon-border {
          box-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 15px #fff, 0 0 20px #ff00de, 0 0 35px #ff00de, 0 0 40px #ff00de, 0 0 50px #ff00de, 0 0 75px #ff00de;
        }

        .neon-text {
          text-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 15px #fff, 0 0 20px #ff00de, 0 0 35px #ff00de, 0 0 40px #ff00de, 0 0 50px #ff00de, 0 0 75px #ff00de;
        }
      `}</style>

      <div className="container mx-auto max-w-2xl">
        <h1 className="text-4xl mb-4 text-center text-white neon-text">HAM PEPE VIEWER</h1>
        
        <Card className="mb-8 bg-black bg-opacity-50 neon-border rounded-lg">
          <CardHeader>
            <CardTitle className="text-xl text-center text-white neon-text">ENTER TOKEN NUMBER</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              <Input
                type="number"
                value={tokenNumber}
                onChange={(e) => setTokenNumber(e.target.value)}
                placeholder="TOKEN #"
                className="bg-purple-900 border-pink-500 text-white placeholder-pink-300 rounded"
              />
              <Button onClick={fetchAndDisplaySVG} className="bg-pink-600 hover:bg-pink-500 text-white neon-border rounded">GET IMAGE</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black bg-opacity-50 neon-border rounded-lg">
          <CardContent>
            <p className="text-pink-300 mb-4">{status}</p>
            {svgContent && (
              <div className="flex justify-center items-center w-full h-full">
                <div className="flex-1 flex justify-center items-center">
                  <div 
                    dangerouslySetInnerHTML={{ __html: svgContent }} 
                    style={{
                      imageRendering: 'pixelated',
                    }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}