import { useState, useEffect } from 'react';
import cubeRunLogo from '../../textures/cuberun-logo.png';
import '../../styles/gameMenu.css';
import { useStore } from '../../state/useStore';

const GameOverScreen = () => {
  const previousScores = localStorage.getItem('highscores') ? JSON.parse(localStorage.getItem('highscores')) : [...Array(3).fill(0)];
  const [shown, setShown] = useState(false);
  const [opaque, setOpaque] = useState(false);
  const [highScores, setHighscores] = useState(previousScores);

  const gameOver = useStore((s) => s.gameOver);
  const score = useStore((s) => s.score);

  useEffect(() => {
    let t;
    if (gameOver !== opaque) t = setTimeout(() => setOpaque(gameOver), 500);
    return () => clearTimeout(t);
  }, [gameOver, opaque]);

  useEffect(() => {
    if (gameOver) {
      setShown(true);
      submitOrUpdateScore(score); // Attempt to submit the score or update it if it exists
    } else {
      setShown(false);
    }
  }, [gameOver]);

  useEffect(() => {
    if (gameOver) {
      if (highScores.some((previousScore) => score > previousScore)) {
        const sortedScores = highScores.sort((a, b) => a - b);
        sortedScores[0] = score.toFixed(0);
        const resortedScores = sortedScores.sort((a, b) => b - a);

        setHighscores(resortedScores);
        localStorage.setItem('highscores', JSON.stringify(resortedScores));
      }
    }
  }, [gameOver, highScores, score]);

  const submitOrUpdateScore = async (score) => {
    try {
      // Attempt to submit the score
      console.log('Submitting score:', score);
      const response = await fetch('https://virtual-gf-py.vercel.app/score/add_score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: 'user1234',
          score: parseInt(score, 10),
          type: 'game2',
        }),
      });

      // Check if the score already exists
      const data = await response.json();
      console.log('Score submission response:', data);
      if (data.error && data.error.includes("already exists")) {
        // If the score exists, update it instead
        await updateScore(score);
      } else {
        console.log('Score submitted successfully:', data);
      }
    } catch (error) {
      console.error('Error submitting score:', error);
    }
  };

  const updateScore = async (newScore) => {
    try {
      console.log('Updating score:', newScore);
      const response = await fetch('https://virtual-gf-py.vercel.app/score/update_score', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: 'user1234',
          new_score: parseInt(newScore, 10),
          type: 'game2',
        }),
      });
      const data = await response.json();
      console.log('Score update response:', data);
    } catch (error) {
      console.error('Error updating score:', error);
    }
  };

  const handleRestart = () => {
    window.location.reload(); // TODO: make a proper restart
  };

  return shown ? (
    <div className="game__container" style={{ opacity: shown ? 1 : 0, background: opaque ? '#141622FF' : '#141622CC' }}>
      <div className="game__menu">
        <img className="game__logo-small" width="512px" src={cubeRunLogo} alt="Cuberun Logo" />
        <h1 className="game__score-gameover">GAME OVER</h1>
        <div className="game__scorecontainer">
          <div className="game__score-left">
            <h1 className="game__score-title">SCORE</h1>
            <h1 className="game__score">{score.toFixed(0)}</h1>
          </div>
          <div className="game__score-right">
            <h1 className="game__score-title">HIGH SCORES</h1>
            {highScores.map((newScore, i) => (
              <div key={`${i}-${score}`} className="game__score-highscore">
                <span className="game__score-number">{i + 1}</span>
                <span
                  style={{ textDecoration: score.toFixed(0) === newScore ? 'underline' : 'none' }}
                  className="game__score-score"
                >
                  {newScore > 0 ? newScore : '-'}
                </span>
              </div>
            ))}
          </div>
        </div>
        <button onClick={handleRestart} className="game__menu-button">
          RESTART
        </button>
      </div>
    </div>
  ) : null;
};

export default GameOverScreen;
