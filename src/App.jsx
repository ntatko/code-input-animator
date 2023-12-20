import React, { useEffect } from 'react';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism.css'; //Example style, you can use another
import html2canvas from 'html2canvas';
import GIF from 'gif.js';

const delay = 60

const captureScreenshot = async () => {
  const canvas = await html2canvas(document.getElementById('capture'));
  return canvas.toDataURL(); // Returns a data URL representing the captured screenshot
};

const createGif = (screenshots) => {
  const gif = new GIF({
    workers: 1,
    quality: 10,
    width: 300,
    height: 300,
  });

  screenshots.forEach((screenshot) => {
    console.log(`${screenshot}`)
    gif.addFrame(screenshot, { delay: delay });
  });

  gif.on('finished', (blob) => {
    // `blob` is the compiled GIF, you can save or display it as needed
    const gifURL = URL.createObjectURL(blob);
    console.log(gifURL);
  });

  gif.render();
};


function App() {
  const [isRecording, setIsRecording] = React.useState(false);
  const [codeSteps, setCodeSteps] = React.useState(
    [`function add(a, b) {\n  return a + b;\n}`]
  );
  const [playingCodeStep, setPlayingCodeStep] = React.useState(0);
  const [playing, setPlaying] = React.useState(false);
  const [screenshots, setScreenshots] = React.useState([]);

  useEffect(() => {
    captureScreenshot().then((dataURL) => {
      setScreenshots((prevScreenshots) => [...prevScreenshots, dataURL]);
    });
  }, [playingCodeStep]);

  const handleChange = code => {
    if (isRecording) {
      setCodeSteps([...codeSteps, code]);
    } else {
      setCodeSteps([...codeSteps.slice(0, codeSteps.length - 1), code]);
    }
  }

  useEffect(() => {
    if (playing) {
      const interval = setInterval(() => {
        if (playingCodeStep === codeSteps.length - 1) {
          setPlaying(false);
          createGif(screenshots);
          return;
        }
        setPlayingCodeStep(playingCodeStep => playingCodeStep + 1);
      }, delay);
      return () => clearInterval(interval);
    }
  }, [playing, codeSteps, playingCodeStep, screenshots]);

  return (
    <>
    <div>
      <Editor
        value={codeSteps[codeSteps.length - 1]}
        onValueChange={handleChange}
        highlight={code => highlight(code, languages.js)}
        padding={10}
        style={{
          fontFamily: '"Fira code", "Fira Mono", monospace',
          fontSize: 12,
        }}
      />
      <button onClick={() => setIsRecording(!isRecording)}>
        {isRecording ? 'Stop' : 'Start'} recording
      </button>
      </div>
      <div style={{ height: 50 }} />
      <div>
        <div id='capture' style={{ border: '20px solid green', backgroundColor: '#242424', borderRadius: 4}}>
          <div style={{ height: 30, display: 'flex', gap: 10, paddingLeft: 16, justifyContent: 'start', alignItems: "center", paddingTop: 7 }}>
            <div style={{ height: 10, width: 10, backgroundColor: '#ff5f56', borderRadius: '50%' }} />
            <div style={{ height: 10, width: 10, backgroundColor: '#ffbd2d', borderRadius: '50%' }} />
            <div style={{ height: 10, width: 10, backgroundColor: '#26c940', borderRadius: '50%' }} />
          </div>
          <Editor
            value={codeSteps[playingCodeStep] || ''}
            highlight={code => highlight(code, languages.js)}
            padding={10}
            style={{
              fontFamily: '"Fira code", "Fira Mono", monospace',
              fontSize: 12,
              height: 370,
              width: 400,
              color: 'white',
              outline: 'none',
            }}
          />
        </div>
        <button onClick={() => setPlaying(!playing)}>
          {playing ? 'Stop' : 'Start'} playing
        </button>
        <button onClick={() => setPlayingCodeStep(0)}>
          Reset
        </button>
      </div>
    </>
  );
}

export default App;