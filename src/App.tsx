import React, { useState, useEffect } from 'react';
import styles from './App.module.scss';

function App() {
    const [inputText, setInputText] = useState('');
    const [outputText, setOutputText] = useState('');
    const [plotImage, setPlotImage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [typingIndex, setTypingIndex] = useState(-1);
  
    useEffect(() => {
      if (outputText && typingIndex < outputText.length) {
        const typingTimer = setTimeout(() => {
          setTypingIndex((prevIndex) => prevIndex + 1);
        }, 50);
  
        return () => clearTimeout(typingTimer);
      }
    }, [outputText, typingIndex]);
  
    const handleTranslate = async () => {
      try {
        setTypingIndex(-1); // Reset the typing index to -1 before fetching translation
        setIsLoading(true); // Set isLoading to true when starting the translation
  
        const response = await fetch('http://localhost:5000/translate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sentence: inputText,
          }),
        });
        const data = await response.json();
        setOutputText(data.prediction);
        setPlotImage(data.plot_image); // Update to the new key 'plot_image'
        setTypingIndex(0);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false); // Set isLoading to false when translation is complete
      }
    };
  
    const handleClear = () => {
      setInputText('');
      setOutputText('');
      setPlotImage('');
      setTypingIndex(0);
    };
  
    return (
      <div className={styles.App}>
        <div className={styles.navbar}>
          <img
            src="https://res.cloudinary.com/dgb2lnz2i/image/upload/v1689527286/ENHILI-1_cbns52.png"
            alt=""
            className={styles.logo}
          />
        </div>
        <div className={styles.body}>
          <div className={styles.header}>
            <h1 className={styles.headertext}>English</h1>
            <h1 className={styles.headertext}>Hiligaynon</h1>
          </div>
          <div className={styles.top}>
            <textarea
              className={styles.input}
              placeholder="Input English statements here..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <div className={styles.outputContainer}>
              <textarea
                className={styles.output}
                placeholder="hmmm...."
                value={outputText.slice(0, typingIndex)}
                disabled
              />
              <span className={styles.cursor}>
                {typingIndex < outputText.length ? '|' : ''}
              </span>
            </div>
          </div>
          <div className={styles.bottom}>
            <button className={styles.transBtn} onClick={handleTranslate}>
              Translate!
            </button>
            <button className={styles.clearBtn} onClick={handleClear}>
              Clear
            </button>
          </div>
          <div className={styles.bottom2}>
            <h1 className={styles.attHead}>Heat Map</h1>
            {plotImage && (
              <img
                src={`data:image/png;base64,${plotImage}`}
                alt="Attention Plot"
                className={styles.plotImg}
              />
            )}
          </div>
  
          {isLoading && ( // Render modal if isLoading is true
            <div className={styles.modalContainer}>
              <div className={styles.modalContent}>
                <div className={styles.loadingSpinner}></div>
                <p>Loading...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  export default App;