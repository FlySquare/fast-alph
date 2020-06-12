const GameState = {
  PRE_GAME: 'pre-game',
  RUNNING: 'running',
  POST_GAME: 'post-game'
};

const LetterState = {
  ACTIVE: 'active',
  INACTIVE: 'inactive'
};

class SpeedTest {  
  constructor(gameContainer, letterContainer) {
    this.letters = [];
    this.remainingLetters = [];
    this.state = GameState.PRE_GAME;
    this.timer = null;
    this.gameContainer = gameContainer;
    this.letterContainer = letterContainer;
    this.highscore = Infinity;
    this.onKeyDown = this.onKeyDown.bind(this);
    this.restartGame = this.restartGame.bind(this);
  };

  init(restart) {
    const availableLanguages = ['en', 'nb', 'nn', 'no'];
    const preferredLanguage = SpeedTest.getPreferredLanguage(availableLanguages);
    this.letters = SpeedTest.getLetters(preferredLanguage);
    this.remainingLetters = this.letters;
    this.highscore = this.getHighscore();
    
    if (this.highscore && this.highscore !== Infinity) {
      this.updateHighscoreText(this.highscore);
    }

    const letterTemplate = this.letterContainer.querySelector(
      '.letter--template'
    );

    this.setTitle('Press A on your keyboard to start, and space bar to restart');
    
    this.renderLetters(letterTemplate);

    if (!restart) {
      this.addEventListeners();
      this.getHighscore();
      
    }
  };
  static getPreferredLanguage(langs) {
    const defaultLang = 'en';
    const navgLangs = navigator.languages;

    const preferredLang = navgLangs.filter(lang => langs.indexOf(lang) > -1)[0];

    return preferredLang || defaultLang;
  };
  static getLetters(preferredLang) {
    let letters = [];

    switch (preferredLang) {
      case 'nb':
      case 'nn':
      case 'no':
        letters = [
          'a',
          'b',
          'c',
          'd',
          'e',
          'f',
          'g',
          'h',
          'i',
          'j',
          'k',
          'l',
          'm',
          'n',
          'o',
          'p',
          'q',
          'r',
          's',
          't',
          'u',
          'v',
          'w',
          'x',
          'y',
          'z',
          'æ',
          'ø',
          'å'
        ];
        break;
      default:
        letters = [
          'a',
          'b',
          'c',
          'd',
          'e',
          'f',
          'g',
          'h',
          'i',
          'j',
          'k',
          'l',
          'm',
          'n',
          'o',
          'p',
          'q',
          'r',
          's',
          't',
          'u',
          'v',
          'w',
          'x',
          'y',
          'z'
        ];
        break;
    }

    return letters;
  };
  renderLetters(template) {
    let letterElement;

    this.letters.forEach((letter, index) => {
      letterElement = template.cloneNode(true);
      letterElement.classList.remove('letter--template');
      letterElement.dataset.letter = letter;
      letterElement.dataset.index = index;

      this.letterContainer.appendChild(letterElement);
    });

    // this.letterContainer.removeChild(template);
  };
  addEventListeners() {
    document.addEventListener('keydown', this.onKeyDown, false);
    
    const restartButton = this.gameContainer.querySelector('.restart-button');
    restartButton.addEventListener('click', this.restartGame, false);
  };
  onKeyDown(event) {
    if (event.key === ' ') {
      
      this.restartGame();
    } else if (this.remainingLetters[0].toUpperCase() === event.key.toUpperCase()) {
      if (this.state === GameState.PRE_GAME) {
        this.startGame();
      }
      
      this.updateLetter(this.remainingLetters[0], LetterState.ACTIVE);
      this.remainingLetters = this.remainingLetters.slice(1);

      if (this.remainingLetters.length === 0) {
        this.stopGame();
      } else if (this.remainingLetters.length < this.letters.length / 5) {
        this.setTitle('Only a few left, keep it up!');
      } else if (this.remainingLetters.length < this.letters.length / 2) {
        this.setTitle('Half-way there!');
      }
    } else {
      const nextLetterElement = this.letterContainer.querySelector(
        `[data-state=${LetterState.INACTIVE}]`
      );
      this.wrongLetter(nextLetterElement);
    }
  };
  startGame() {
    this.gameContainer.dataset.state = GameState.RUNNING;
    this.state = GameState.RUNNING;
    this.setTitle('GO GO GO');
    this.startTimer();
  };
  stopGame() {
    const t2 = this.stopTimer();
    const t1 = this.timer;
    this.gameContainer.dataset.state = GameState.POST_GAME;
    this.state = GameState.POST_GAME;

    let time = t2 - t1;
    time /= 1000;
    const timeString = this.formatTime(time);
    
    let newTitle = `You made it! ✨ It took ${timeString} seconds!`;
  
    if (this.highscore === null || time < this.highscore) {
      newTitle += ' That\'s a new record!';
      this.highscore = time;
      this.updateHighscoreText(time);
      this.setHighscore(time);
    }

    this.setTitle(newTitle);
  };
  restartGame() {
    this.state = GameState.PRE_GAME;
    this.gameContainer.dataset.state = GameState.PRE_GAME;

    const letterElements = this.letterContainer.querySelectorAll('[data-letter]');
    
    for (let i = 0; i < letterElements.length; i++) {
      this.letterContainer.removeChild(letterElements[i]);
    }
    
    this.init();
    
  };
  startTimer() {
    this.timer = performance.now();
  };
  stopTimer() {
    return performance.now();
  };
  wrongLetter(element) {
    if (!('animate' in element)) {
      return;
    }

    const styles = getComputedStyle(element);
    const backgroundColor = styles.getPropertyValue('--background-color');
    const errorRed = '#f15f79';

    const blinkAnimation = [
      {
        ['--background-color']: backgroundColor
      },
      {
        ['--background-color']: errorRed
      },
      {
        ['--background-color']: backgroundColor
      }
    ];

    const blinkTiming = {
      duration: 100,
      iterations: 1
    };

    element.animate(blinkAnimation, blinkTiming);
  };
  setTitle(text) {
    const title = this.gameContainer.querySelector('.title');
    title.innerText = text;
  };
  updateLetter(letter, state) {
    const element = this.letterContainer.querySelector(
      `[data-letter=${letter}]`
    );
    element.dataset.state = state;
  };
  getHighscore() {    
    let highscore = Infinity;
    if ('localStorage' in window) {
      highscore = window.localStorage.getItem('highscore');
    }
    
    if (highscore) {
      highscore = parseFloat(highscore);
    } else {
      highscore = Infinity;
    }
    
    return highscore;
  };
  setHighscore(highscore) {
    if ('localStorage' in window) {
      window.localStorage.setItem('highscore', highscore);
    }
  };
  updateHighscoreText(newHighscore) {    
    const highscoreContainer = this.gameContainer.querySelector(
      '.highscore-container'
    );
    
    highscoreContainer.innerText = `Personal best: ${this.formatTime(newHighscore)} seconds`;
  };
  formatTime(time) {
    return time.toLocaleString(undefined, {
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2
    }); 
  }
}

const gameContainer = document.querySelector('.game-container');
const letterContainer = document.querySelector('.letter__container');
const game = new SpeedTest(gameContainer, letterContainer);
game.init();