const STORAGE_KEY = 'code-coach-progress-v1';
const startingState = {
  messageComplete: false,
  comprehensionComplete: false,
  designGoalComplete: false,
  designDataComplete: false,
  reviewDue: false,
  reviewComplete: false,
  reviewLanguage: 'python',
  languagesCompleted: [],
  completedLessons: {},
  currentLessons: {},
  reflection: '',
  lastVisit: null,
};

let state = { ...startingState, ...readState() };
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const lessons = {
  python: {
    name: 'Python', title: 'Teach the computer to say hello', focus: 'show a message',
    intro: 'Python is a popular first language. This instruction asks it to show a message.',
    code: 'print("Hello!")', what: 'print tells Python to show these words as output.',
    why: 'Programs use output to share information with the person using them.',
    when: 'Use it to show a welcome, a score, or the result of a calculation.',
    practiceTitle: 'Make the computer greet you', practiceInstruction: 'Change the words inside the quotes, then run your code.',
    editorHint: 'Keep the parentheses and matching quotation marks.', check: 'What does print do?',
    answers: ['It shows information as output.', 'It stores a secret message for later.', 'It erases the program.'], correct: 0,
    hint: 'When you ran the code, the computer displayed a message. Which answer describes showing something?',
    correctFeedback: 'Correct! print shows information as output. You can use it for a message or a result.',
    wrongFeedback: 'Not quite. Think about what appeared when you ran the example. Try another answer.',
    runnable: true, sampleOutput: 'Hello!', review: 'What does print do?', reviewAnswer: 'It shows information as output.',
  },
  cpp: {
    name: 'C++', title: 'Send a message to the output', focus: 'display text with std::cout',
    intro: 'C++ is used for games and programs that need to run quickly. This line sends text to the program output.',
    code: 'std::cout << "Hello!" << std::endl;', what: 'std::cout is the program output. The << marks send text to it.',
    why: 'Programs need output so people can see results and messages.',
    when: 'Use it to show a score, a status message, or a calculation result.',
    practiceTitle: 'Find the message in the instruction', practiceInstruction: 'Read the line and find the words the program sends to output.',
    editorHint: 'This example is read-only until a C++ runner is added.', check: 'What does std::cout do?',
    answers: ['It sends information to the program output.', 'It saves information in a file.', 'It stops the program.'], correct: 0,
    hint: 'Look at the word cout: it is short for character output.',
    correctFeedback: 'Right. std::cout is where this C++ line sends its output.',
    wrongFeedback: 'Not quite. Look at the line again: which part is connected to the << output marks?',
    runnable: false, review: 'What is std::cout used for?', reviewAnswer: 'It sends information to the program output.',
  },
  csharp: {
    name: 'C#', title: 'Write a message on a new line', focus: 'display text with Console.WriteLine',
    intro: 'C# is used to build apps and games. This instruction writes a message and then starts a new line.',
    code: 'Console.WriteLine("Hello!");', what: 'Console.WriteLine displays the words and moves output to the next line.',
    why: 'Output lets a program tell the user what happened.',
    when: 'Use it to show instructions, scores, or the result of a task.',
    practiceTitle: 'Read the message instruction', practiceInstruction: 'Find the text that C# will display inside the quotation marks.',
    editorHint: 'This example is read-only until a C# runner is added.', check: 'What does Console.WriteLine do?',
    answers: ['It writes text to output and moves to a new line.', 'It creates a new computer screen.', 'It deletes the message.'], correct: 0,
    hint: 'The method name combines Write with Line. What might Line tell the program to do?',
    correctFeedback: 'Exactly. WriteLine displays text and ends by moving to the next line.',
    wrongFeedback: 'Not quite. Break the name into two parts: Write and Line. Try another answer.',
    runnable: false, review: 'What does Console.WriteLine do?', reviewAnswer: 'It displays text and moves to a new line.',
  },
  java: {
    name: 'Java', title: 'Print a line of text', focus: 'display text with System.out.println',
    intro: 'Java is used for many kinds of apps. This instruction sends a line of text to output.',
    code: 'System.out.println("Hello!");', what: 'System.out.println writes the words and ends the line.',
    why: 'Output helps people see what a program is doing.',
    when: 'Use it to show a message, a result, or a score.',
    practiceTitle: 'Read the Java instruction', practiceInstruction: 'Find the message inside the quotes and predict what appears.',
    editorHint: 'This example is read-only until a Java runner is added.', check: 'What does println tell Java to do?',
    answers: ['Write a line of text to output.', 'Repeat the program forever.', 'Hide the message.'], correct: 0,
    hint: 'The name ends with print and ln, short for line.',
    correctFeedback: 'Correct. println displays the message and moves to a new line.',
    wrongFeedback: 'Not quite. The method name gives a clue: print plus ln, meaning line.',
    runnable: false, review: 'What does println do?', reviewAnswer: 'It writes a line of text to output.',
  },
  javascript: {
    name: 'JavaScript', title: 'Show a message in the console', focus: 'display text with console.log',
    intro: 'JavaScript adds behavior to websites. console.log shows a message in the browser developer console.',
    code: 'console.log("Hello!");', what: 'console.log writes the words to the browser console, a place to inspect program output.',
    why: 'Developers use console output to check what their code is doing.',
    when: 'Use it while learning or debugging. Website visitors usually see page content instead.',
    practiceTitle: 'Find the message in the code', practiceInstruction: 'Read the line and predict what text appears in the console.',
    editorHint: 'This example is read-only until a JavaScript runner is added.', check: 'Where does console.log show this message?',
    answers: ['In the browser developer console.', 'As a printed sheet of paper.', 'Inside the computer memory only.'], correct: 0,
    hint: 'The command starts with the name of the place where the message goes.',
    correctFeedback: 'Right. console.log sends the message to the browser developer console.',
    wrongFeedback: 'Not quite. Read the first word in the instruction and look for the place it names.',
    runnable: false, review: 'Where does console.log show a message?', reviewAnswer: 'In the browser developer console.',
  },
  solidity: {
    name: 'Solidity', title: 'Store a greeting in a smart contract', focus: 'create a public state variable',
    intro: 'Solidity is used to write smart contracts: programs that run on blockchain networks. This example stores a greeting.',
    code: '// SPDX-License-Identifier: MIT\npragma solidity ^0.8.20;\n\ncontract HelloWorld {\n    string public greeting = "Hello!";\n}',
    what: 'greeting is a string variable that stores words. public lets outside code read its value.',
    why: 'Smart contracts need to keep track of data, such as a message or a game state.',
    when: 'Use state variables when a contract needs to remember information between actions.',
    practiceTitle: 'Find the information the contract remembers', practiceInstruction: 'Read the example. Which word names the stored greeting?',
    editorHint: 'This is a read-only example. Solidity code is not deployed or run here.', check: 'What does public mean for greeting?',
    answers: ['Code outside the contract can read its value.', 'The greeting appears on a computer screen.', 'The contract sends money to everyone.'], correct: 0,
    hint: 'public describes who is allowed to read the value.',
    correctFeedback: 'Exactly. public allows outside code to read this state variable.',
    wrongFeedback: 'Not quite. In Solidity, public describes who can read a variable. Try again.',
    runnable: false, review: 'What does public let other code do?', reviewAnswer: 'Read the value of the variable.',
  },
};

const followUp = (stage) => ({
  ...stage,
  name: stage.language,
  answers: [stage.right, ...stage.wrong],
  correct: 0,
  editorHint: `${stage.language} code examples are read-only in this prototype.`,
  runnable: false,
  review: stage.check,
  reviewAnswer: stage.right,
});

const followUpLessons = {
  python: [
    followUp({ language: 'Python', title: 'Give a value a name', focus: 'store information in a variable', intro: 'A variable is a name a program uses to remember information. Here, score remembers the number 3.', code: 'score = 3\nprint(score)', what: 'The equals sign stores 3 in the variable named score. The next line shows the value.', why: 'A named value is easier to reuse than typing the same information everywhere.', when: 'Use a variable for a score, a player name, or a number that can change.', practiceTitle: 'Store a game score', practiceInstruction: 'Read the code and find the name that holds the number 3.', check: 'What is score doing in this example?', right: 'It is a variable that remembers the value 3.', wrong: ['It is a command that ends the program.', 'It is the name of the Python language.'], hint: 'Look at the left side of the equals sign. That is the name receiving the value.', correctFeedback: 'Exactly. score is a variable, and it currently remembers 3.', wrongFeedback: 'Not quite. The value is placed into a named spot so the program can use it later.' }),
    followUp({ language: 'Python', title: 'Teach the program to choose', focus: 'make a choice with an if statement', intro: 'Programs can check whether something is true, then choose what to do. This game checks whether the score is high enough to win.', code: 'score = 10\nif score >= 10:\n    print("You win!")', what: 'if checks the condition. The indented instruction runs only when the condition is true.', why: 'Choices let games react differently to what the player does.', when: 'Use if to check for a match, a winning score, or an answer that is correct.', practiceTitle: 'Find the choice in the game', practiceInstruction: 'Read the condition and decide when the win message appears.', check: 'When will the indented message show?', right: 'When score is 10 or greater.', wrong: ['Every time, no matter what score is stored.', 'Only when score is less than 10.'], hint: 'The symbol >= means greater than or equal to.', correctFeedback: 'Right. The program checks the score before showing the win message.', wrongFeedback: 'Not quite. Read the comparison after if: it sets the condition that must be true.' }),
  ],
  cpp: [
    followUp({ language: 'C++', title: 'Give a value a name', focus: 'store information in a variable', intro: 'A variable is a named place to remember information. In C++, int tells us score will store a whole number.', code: 'int score = 3;\nstd::cout << score << std::endl;', what: 'The first line creates score and stores 3 in it. The second line displays the value.', why: 'A named value can be reused and changed as a program runs.', when: 'Use variables for a score, a number of tries, or a player name.', practiceTitle: 'Store a game score', practiceInstruction: 'Find the variable that remembers the number 3.', check: 'What does int score = 3; do?', right: 'It creates a whole-number variable named score and stores 3.', wrong: ['It prints the number three times.', 'It tells C++ to stop running.'], hint: 'int is the kind of value, score is its name, and 3 is what it remembers.', correctFeedback: 'Exactly. score is a whole-number variable that currently stores 3.', wrongFeedback: 'Not quite. Read the line in three parts: the type, the name, and the value.' }),
    followUp({ language: 'C++', title: 'Teach the program to choose', focus: 'make a choice with an if statement', intro: 'An if statement checks a condition. This game shows a win message only when the score reaches 10.', code: 'int score = 10;\nif (score >= 10) {\n    std::cout << "You win!" << std::endl;\n}', what: 'The condition inside parentheses is checked. Braces hold the instruction that runs if it is true.', why: 'Choices let a program respond to different scores or player actions.', when: 'Use if to check whether a player won or two game blocks match.', practiceTitle: 'Find the choice in the game', practiceInstruction: 'Read the condition and decide when the message appears.', check: 'When will the message inside the braces appear?', right: 'When score is 10 or greater.', wrong: ['Every time the program starts.', 'Only when score is less than 10.'], hint: 'The symbol >= means greater than or equal to.', correctFeedback: 'Right. The if statement checks the score before showing the message.', wrongFeedback: 'Not quite. The condition inside parentheses controls whether the code in braces runs.' }),
  ],
  csharp: [
    followUp({ language: 'C#', title: 'Give a value a name', focus: 'store information in a variable', intro: 'A variable gives a name to information the program should remember. int means score will hold a whole number.', code: 'int score = 3;\nConsole.WriteLine(score);', what: 'The first line creates score and stores 3. The second line displays the value.', why: 'Variables let programs reuse and update information while they run.', when: 'Use variables for scores, names, or the number of tries left.', practiceTitle: 'Store a game score', practiceInstruction: 'Find the name that remembers the number 3.', check: 'What does int score = 3; do?', right: 'It creates a whole-number variable named score and stores 3.', wrong: ['It displays three messages.', 'It ends the C# program.'], hint: 'int is the kind of value, score is its name, and 3 is the value.', correctFeedback: 'Exactly. score is a whole-number variable that currently stores 3.', wrongFeedback: 'Not quite. Break the line into its type, name, and starting value.' }),
    followUp({ language: 'C#', title: 'Teach the program to choose', focus: 'make a choice with an if statement', intro: 'An if statement checks a condition. This game shows a message only when the score reaches 10.', code: 'int score = 10;\nif (score >= 10)\n{\n    Console.WriteLine("You win!");\n}', what: 'The condition inside parentheses is checked. The braces hold what happens if it is true.', why: 'Choices let a program respond to a score or a player action.', when: 'Use if to check for a win, a correct answer, or a matching pair.', practiceTitle: 'Find the choice in the game', practiceInstruction: 'Read the condition and decide when the message appears.', check: 'When will the message inside the braces appear?', right: 'When score is 10 or greater.', wrong: ['Every time, regardless of the score.', 'Only when score is less than 10.'], hint: 'The symbol >= means greater than or equal to.', correctFeedback: 'Right. The if statement checks the score before showing the message.', wrongFeedback: 'Not quite. The condition in parentheses decides if the braced code runs.' }),
  ],
  java: [
    followUp({ language: 'Java', title: 'Give a value a name', focus: 'store information in a variable', intro: 'A variable is a named place to remember information. int tells Java that score will store a whole number.', code: 'int score = 3;\nSystem.out.println(score);', what: 'The first line creates score and stores 3. The second line displays its value.', why: 'Variables let a program reuse and update information as it runs.', when: 'Use variables for a score, a player name, or the number of turns left.', practiceTitle: 'Store a game score', practiceInstruction: 'Find the name that remembers the number 3.', check: 'What does int score = 3; do?', right: 'It creates a whole-number variable named score and stores 3.', wrong: ['It prints the number three times.', 'It shuts down the program.'], hint: 'int is the type, score is the variable name, and 3 is its starting value.', correctFeedback: 'Exactly. score is a whole-number variable that currently stores 3.', wrongFeedback: 'Not quite. Read the line from left to right: type, name, then value.' }),
    followUp({ language: 'Java', title: 'Teach the program to choose', focus: 'make a choice with an if statement', intro: 'An if statement checks a condition. The game shows a win message when the score is at least 10.', code: 'int score = 10;\nif (score >= 10) {\n    System.out.println("You win!");\n}', what: 'The condition in parentheses is checked. Braces hold the instruction that runs if it is true.', why: 'Choices let programs respond to different scores and player actions.', when: 'Use if to check if a player won or gave a correct answer.', practiceTitle: 'Find the choice in the game', practiceInstruction: 'Read the condition and decide when the message appears.', check: 'When will the message inside the braces appear?', right: 'When score is 10 or greater.', wrong: ['Every time the program starts.', 'Only when score is less than 10.'], hint: 'The symbol >= means greater than or equal to.', correctFeedback: 'Right. The if statement checks the score before showing the message.', wrongFeedback: 'Not quite. The condition inside parentheses controls whether the code in braces runs.' }),
  ],
  javascript: [
    followUp({ language: 'JavaScript', title: 'Give a value a name', focus: 'store information in a variable', intro: 'A variable is a name the program uses to remember information. Here, score remembers the number 3.', code: 'let score = 3;\nconsole.log(score);', what: 'let creates a variable named score and stores 3. The next line shows the value in the console.', why: 'Variables make it easy to reuse or change information in an interactive page.', when: 'Use variables for a score, a player name, or a button choice.', practiceTitle: 'Store a game score', practiceInstruction: 'Find the name that remembers the number 3.', check: 'What does let score = 3; do?', right: 'It creates a variable named score and stores 3.', wrong: ['It makes the browser show three web pages.', 'It removes the score from the program.'], hint: 'let introduces a variable, score is its name, and 3 is the value.', correctFeedback: 'Exactly. score is a variable that currently remembers 3.', wrongFeedback: 'Not quite. Look at the name between let and the equals sign.' }),
    followUp({ language: 'JavaScript', title: 'Teach the program to choose', focus: 'make a choice with an if statement', intro: 'An if statement checks a condition. This game shows a message only when the score reaches 10.', code: 'let score = 10;\nif (score >= 10) {\n  console.log("You win!");\n}', what: 'The condition inside parentheses is checked. Braces hold what happens if it is true.', why: 'Choices let a website react to clicks, scores, and answers.', when: 'Use if to check for a win, a correct answer, or a matching pair.', practiceTitle: 'Find the choice in the game', practiceInstruction: 'Read the condition and decide when the message appears.', check: 'When will the message inside the braces appear?', right: 'When score is 10 or greater.', wrong: ['Every time the page opens.', 'Only when score is less than 10.'], hint: 'The symbol >= means greater than or equal to.', correctFeedback: 'Right. The if statement checks the score before showing the message.', wrongFeedback: 'Not quite. The condition in parentheses decides whether the code inside braces runs.' }),
  ],
  solidity: [
    followUp({ language: 'Solidity', title: 'Store information in contract state', focus: 'store information in a state variable', intro: 'A state variable lets a smart contract remember information between transactions. This example stores a game score.', code: 'uint public score = 3;', what: 'uint is a whole number, score is its name, and public lets outside code read it.', why: 'Contracts need stored state to remember things like scores or game settings.', when: 'Use a state variable when contract data should remain saved on the blockchain.', practiceTitle: 'Find the saved game score', practiceInstruction: 'Read the declaration and identify the name of the stored value.', check: 'What information is stored in score?', right: 'The whole number 3.', wrong: ['The text "score" as a message.', 'A command to send 3 coins.'], hint: 'Look to the right of the equals sign for the value.', correctFeedback: 'Correct. The contract stores the whole number 3 in score.', wrongFeedback: 'Not quite. This declaration stores data; it does not display a message or send money.' }),
    followUp({ language: 'Solidity', title: 'Check whether two blocks match', focus: 'compare values in a smart contract', intro: 'A matching-block game needs to compare two hidden values. This function returns true when both values are the same.', code: 'function isMatch(uint first, uint second) public pure returns (bool) {\n    return first == second;\n}', what: 'The == symbol checks whether the two values are equal. The function returns the answer as true or false.', why: 'A contract can use comparisons to decide whether game actions follow the rules.', when: 'Use a comparison when a game needs to check for a match or a winning condition.', practiceTitle: 'Find the matching check', practiceInstruction: 'Read the comparison and decide what makes the function return true.', check: 'When does first == second return true?', right: 'When first and second have the same value.', wrong: ['Whenever either value is zero.', 'When the two values are different.'], hint: 'Two equals signs compare values; one equals sign stores a value.', correctFeedback: 'Exactly. == asks whether the two values are equal.', wrongFeedback: 'Not quite. The function compares the two inputs and returns true only when they match.' }),
  ],
};

const courses = Object.fromEntries(Object.keys(lessons).map((language) => [language, [lessons[language], ...followUpLessons[language]]]));

let selectedLanguage = localStorage.getItem('code-coach-language') || 'python';
if (!lessons[selectedLanguage]) selectedLanguage = 'python';
state.languagesCompleted = Array.isArray(state.languagesCompleted) ? state.languagesCompleted : [];
state.completedLessons = state.completedLessons && typeof state.completedLessons === 'object' ? state.completedLessons : {};
state.currentLessons = state.currentLessons && typeof state.currentLessons === 'object' ? state.currentLessons : {};
state.languagesCompleted.forEach((language) => { state.completedLessons[language] = Math.max(state.completedLessons[language] || 0, 1); });
state.reviewLanguage = state.reviewLanguage || 'python';
let mainAnswered = false;

function getCurrentLesson() {
  const index = Math.min(state.currentLessons[selectedLanguage] || 0, courses[selectedLanguage].length - 1);
  return courses[selectedLanguage][index];
}

function getCurrentLessonIndex() {
  return Math.min(state.currentLessons[selectedLanguage] || 0, courses[selectedLanguage].length - 1);
}

function readState() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
  catch { return {}; }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  renderProgress();
}

function renderProgress() {
  const completed = Object.values(state.completedLessons).reduce((total, count) => total + Math.min(Number(count) || 0, 3), 0);
  $('#progress-count').textContent = `${completed} of ${Object.keys(lessons).length * 3}`;
  const reflection = $('#reflection');
  if (reflection && !reflection.value) reflection.value = state.reflection || '';
}

function showView(viewName) {
  $$('.nav-button').forEach((button) => button.classList.toggle('active', button.dataset.view === viewName));
  $('#lesson-view').classList.toggle('active', viewName === 'lesson');
  $('#design-view').classList.toggle('active', viewName === 'design');
  if (viewName === 'lesson' && state.reviewDue && !state.reviewComplete && state.reviewLanguage === selectedLanguage) showReview();
}

function getActiveTopic() {
  return $('.nav-button.active')?.dataset.view === 'design'
    ? 'planning a matching-blocks game'
    : `Lesson ${getCurrentLessonIndex() + 1}: Learn ${getCurrentLesson().name}: ${getCurrentLesson().focus}`;
}

function renderLanguage() {
  const lesson = getCurrentLesson();
  const lessonIndex = getCurrentLessonIndex();
  $$('.language-card').forEach((button) => {
    const selected = button.dataset.language === selectedLanguage;
    button.classList.toggle('selected', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  $('#lesson-title').textContent = lesson.title;
  $('#lesson-intro').textContent = lesson.intro;
  $('#lesson-code').textContent = lesson.code;
  $('.explain-card:nth-child(1) p').textContent = lesson.what;
  $('.explain-card:nth-child(2) p').textContent = lesson.why;
  $('.explain-card:nth-child(3) p').textContent = lesson.when;
  $('#practice-title').textContent = lesson.practiceTitle;
  $('#practice-instruction').textContent = lesson.practiceInstruction;
  $('#editor-hint').textContent = lesson.editorHint;
  $('#check-question').textContent = lesson.check;
  $('#coach-message').placeholder = `I think ${lesson.focus} means...`;
  $('#nav-lesson-number').textContent = String(lessonIndex + 1);
  $('#nav-lesson-name').textContent = lesson.focus;
  $('#lesson-stage').textContent = `LESSON ${lessonIndex + 1} OF ${courses[selectedLanguage].length} · ${lesson.name.toUpperCase()}`;
  $('#code-input').value = lesson.code;
  $('#code-input').readOnly = !lesson.runnable;
  $('#run-code').hidden = !lesson.runnable;
  $('.output-panel').hidden = !lesson.runnable;
  let runnerNote = $('#runner-note');
  if (!runnerNote) {
    runnerNote = document.createElement('p');
    runnerNote.id = 'runner-note';
    runnerNote.className = 'runner-note';
    $('.try-section').append(runnerNote);
  }
  runnerNote.hidden = lesson.runnable;
  runnerNote.textContent = selectedLanguage === 'python'
    ? 'This Python example is read-only in this lesson. The runnable Python playground is in Lesson 1.'
    : `${lesson.name} examples are read-only in this prototype. A coding runner for this language will be added later.`;
  $('#code-output').textContent = lesson.sampleOutput || 'This code example is for reading and understanding.';
  $('#run-feedback').textContent = '';

  const answers = $$('.answer-option', $('#comprehension'));
  answers.forEach((button, index) => {
    button.textContent = lesson.answers[index];
    button.dataset.answer = index === lesson.correct ? 'correct' : `wrong-${index}`;
    button.classList.remove('correct', 'incorrect');
    button.disabled = false;
  });
  $('#answer-feedback').hidden = true;
  $('#answer-feedback').textContent = '';
  const lessonComplete = (state.completedLessons[selectedLanguage] || 0) > lessonIndex;
  mainAnswered = lessonComplete;
  $('#lesson-continue').hidden = !lessonComplete;
  if (lessonComplete) {
    const lastLesson = lessonIndex === courses[selectedLanguage].length - 1;
    $('#continue-note').textContent = lastLesson
      ? `You completed the ${courses[selectedLanguage].length}-lesson starter path. Try another practice problem or review a lesson.`
      : 'You got it! The next lesson is ready when you are.';
    $('#continue-lesson').textContent = lastLesson ? 'Review Lesson 1' : `Continue to Lesson ${lessonIndex + 2}`;
    const correctButton = answers.find((button) => button.dataset.answer === 'correct');
    correctButton?.classList.add('correct');
    $('#answer-feedback').hidden = false;
    $('#answer-feedback').className = 'answer-feedback good';
    $('#answer-feedback').textContent = lesson.correctFeedback;
  } else {
    $('#lesson-continue').hidden = true;
  }
  answers.forEach((button) => { button.disabled = lessonComplete; });
  if ($('#review-card')) $('#review-card').remove();
  if (state.reviewDue && !state.reviewComplete && state.reviewLanguage === selectedLanguage) showReview();
}

async function callTutor(body) {
  const response = await fetch('/api/coach', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || 'The coach could not respond right now. Please try again.');
  return result;
}

function showCoachFeedback(target, result) {
  target.replaceChildren();
  const heading = document.createElement('strong');
  heading.textContent = result.outcome === 'correct' ? 'You understand this idea' : result.outcome === 'partly-correct' ? 'You’re on the right track' : 'Let’s work through it';
  const explanation = document.createElement('p');
  explanation.textContent = result.explanation;
  const hint = document.createElement('p');
  hint.innerHTML = '<b>Hint:</b> ';
  hint.append(document.createTextNode(result.hint));
  const followUp = document.createElement('p');
  followUp.innerHTML = '<b>Think about:</b> ';
  followUp.append(document.createTextNode(result.followUpQuestion));
  target.append(heading, explanation, hint, followUp);
  target.classList.toggle('good', result.outcome === 'correct');
  target.classList.toggle('needs-work', result.outcome !== 'correct');
  target.hidden = false;
}

function setBusy(button, busy, busyLabel = 'Thinking…') {
  if (busy) {
    button.dataset.originalLabel = button.textContent;
    button.textContent = busyLabel;
    button.disabled = true;
  } else {
    button.textContent = button.dataset.originalLabel || button.textContent;
    button.disabled = false;
  }
}

async function requestFeedback({ message, responseTarget, button }) {
  if (!message.trim()) {
    responseTarget.hidden = false;
    responseTarget.className = 'ai-response needs-work';
    responseTarget.textContent = 'Write a short answer or question first, then your coach can help.';
    return;
  }
  responseTarget.hidden = true;
  setBusy(button, true);
  try {
    const result = await callTutor({
      action: 'feedback',
      topic: getActiveTopic(),
      learnerMessage: message.trim(),
      language: selectedLanguage,
      code: $('#code-input').value.slice(0, 400),
    });
    showCoachFeedback(responseTarget, result);
  } catch (error) {
    responseTarget.hidden = false;
    responseTarget.className = 'ai-response needs-work';
    responseTarget.textContent = error.message;
  } finally {
    setBusy(button, false);
  }
}

function showReview() {
  if ($('#review-card')) return;
  const lesson = getCurrentLesson();
  const review = document.createElement('div');
  review.className = 'review-card';
  review.id = 'review-card';
  review.innerHTML = '<div><span class="step-label">QUICK MEMORY CHECK</span><h3 id="review-question"></h3><p>Try to remember it without looking back at the lesson.</p><div class="review-options" role="group" aria-label="Answer the memory check"></div><div class="review-feedback" aria-live="polite"></div></div>';
  $('#review-question', review).textContent = lesson.review;
  lesson.answers.forEach((answer, index) => {
    const option = document.createElement('button');
    option.type = 'button';
    option.dataset.review = String(index);
    option.textContent = answer;
    $('.review-options', review).append(option);
  });
  const top = $('.lesson-card');
  top.prepend(review);
  $$('[data-review]', review).forEach((button) => button.addEventListener('click', () => {
    const feedback = $('.review-feedback', review);
    if (Number(button.dataset.review) === lesson.correct) {
      feedback.textContent = `That's right. You remembered the ${lesson.name} idea!`;
      feedback.classList.add('good');
      button.classList.add('correct');
      $$('[data-review]', review).forEach((option) => { option.disabled = true; });
      state.reviewComplete = true;
      saveState();
    } else {
      feedback.textContent = `Not quite. ${lesson.hint} Try again.`;
      feedback.classList.add('needs-work');
      button.classList.add('incorrect');
      button.disabled = true;
    }
  }));
}

$$('.nav-button').forEach((button) => button.addEventListener('click', () => showView(button.dataset.view)));

$$('.language-card').forEach((button) => button.addEventListener('click', () => {
  selectedLanguage = button.dataset.language;
  localStorage.setItem('code-coach-language', selectedLanguage);
  renderLanguage();
}));

$$('.language-card').forEach((button) => button.addEventListener('click', () => {
  selectedLanguage = button.dataset.language;
  localStorage.setItem('code-coach-language', selectedLanguage);
  renderLanguage();
}));

$('#copy-example').addEventListener('click', async (event) => {
  try {
    await navigator.clipboard.writeText(getCurrentLesson().code);
    event.currentTarget.textContent = 'Copied!';
    setTimeout(() => { event.currentTarget.textContent = 'Copy'; }, 1300);
  } catch {
    event.currentTarget.textContent = 'Select code';
  }
});

$('#run-code').addEventListener('click', () => {
  const code = $('#code-input').value.trim();
  const output = $('#code-output');
  const feedback = $('#run-feedback');
  const match = code.match(/^print\(\s*(["'])(.*?)\1\s*\)$/s);
  feedback.className = 'run-feedback';
  if (!match) {
    output.textContent = 'I could not run that line yet.';
    feedback.textContent = 'For this lesson, use print("your message") with the parentheses and matching quotation marks.';
    feedback.classList.add('error');
    return;
  }
  output.textContent = match[2];
  if (match[2] === 'Hello!') {
    feedback.textContent = 'Your code ran! Now change the words inside the quotes to make the message your own.';
    return;
  }
  feedback.textContent = 'Nice work! The computer followed your instruction.';
  state.messageComplete = true;
  state.reviewDue = true;
  state.reviewLanguage = 'python';
  state.lastVisit = new Date().toISOString();
  saveState();
});

const mainQuestion = $('#comprehension');
$$('.answer-option', mainQuestion).forEach((button) => button.addEventListener('click', () => {
  if (mainAnswered) return;
  const feedback = $('#answer-feedback');
  const lesson = getCurrentLesson();
  if (button.dataset.answer === 'correct') {
    button.classList.add('correct');
    feedback.hidden = false;
    feedback.className = 'answer-feedback good';
    feedback.textContent = lesson.correctFeedback;
    mainAnswered = true;
    const lessonIndex = getCurrentLessonIndex();
    state.completedLessons[selectedLanguage] = Math.max(state.completedLessons[selectedLanguage] || 0, lessonIndex + 1);
    if (selectedLanguage === 'python' && lessonIndex === 0) state.comprehensionComplete = true;
    saveState();
    $('#continue-note').textContent = lessonIndex === courses[selectedLanguage].length - 1
      ? `You completed the ${courses[selectedLanguage].length}-lesson starter path. Try another practice problem or review a lesson.`
      : 'You got it! The next lesson is ready when you are.';
    $('#continue-lesson').textContent = lessonIndex === courses[selectedLanguage].length - 1
      ? 'Review Lesson 1'
      : `Continue to Lesson ${lessonIndex + 2}`;
    $('#lesson-continue').hidden = false;
    $$('.answer-option', mainQuestion).forEach((option) => { option.disabled = true; });
  } else {
    button.classList.add('incorrect');
    button.disabled = true;
    feedback.hidden = false;
    feedback.className = 'answer-feedback needs-work';
    feedback.textContent = lesson.wrongFeedback;
  }
}));

$('#show-hint').addEventListener('click', () => {
  const feedback = $('#answer-feedback');
  feedback.hidden = false;
  feedback.className = 'answer-feedback';
  feedback.textContent = `Hint: ${getCurrentLesson().hint}`;
});

$('#continue-lesson').addEventListener('click', () => {
  const currentIndex = getCurrentLessonIndex();
  if (currentIndex >= courses[selectedLanguage].length - 1) {
    state.currentLessons[selectedLanguage] = 0;
  } else {
    state.currentLessons[selectedLanguage] = currentIndex + 1;
  }
  state.reviewDue = false;
  state.reviewComplete = false;
  saveState();
  renderLanguage();
  $('.lesson-card').scrollIntoView({ behavior: 'smooth', block: 'start' });
});

function connectDesignQuestion(questionId, correctAnswer, feedbackId, nextQuestionId, completionKey, explanation) {
  const question = $(`#${questionId}`);
  $$('.answer-option', question).forEach((button) => button.addEventListener('click', () => {
    const feedback = $(`#${feedbackId}`);
    if (button.disabled) return;
    if (button.dataset.answer === correctAnswer) {
      button.classList.add('correct');
      feedback.hidden = false;
      feedback.className = 'answer-feedback good';
      feedback.textContent = explanation;
      state[completionKey] = true;
      saveState();
      $$('.answer-option', question).forEach((option) => { option.disabled = true; });
      if (nextQuestionId) {
        $(`#${nextQuestionId}`).classList.remove('locked');
        $(`#${nextQuestionId}`).setAttribute('aria-disabled', 'false');
      } else {
        $('#reflection-box').hidden = false;
      }
    } else {
      button.classList.add('incorrect');
      button.disabled = true;
      feedback.hidden = false;
      feedback.className = 'answer-feedback needs-work';
      feedback.textContent = questionId === 'design-q1'
        ? 'That can be part of making a game fun. First, the program needs clear rules so it knows what players can do and what counts as a match. Try again.'
        : 'That information could be useful later, but the game needs to know which picture is on each block and whether it is showing. Try again.';
    }
  }));
}

connectDesignQuestion('design-q1', 'rules', 'design-feedback-1', 'design-q2', 'designGoalComplete', 'Exactly. Rules explain what players can do and how the game knows two blocks match. That gives us a target for the code.');
connectDesignQuestion('design-q2', 'data', 'design-feedback-2', null, 'designDataComplete', 'Good plan. The hidden value lets the game compare blocks; the showing state lets it decide what the player can see.');

$('#save-reflection').addEventListener('click', () => {
  state.reflection = $('#reflection').value.trim();
  saveState();
  $('#reflection-saved').hidden = false;
});

$('#ask-coach').addEventListener('click', (event) => requestFeedback({
  message: $('#coach-message').value,
  responseTarget: $('#ai-response'),
  button: event.currentTarget,
}));

$('#coach-reflection').addEventListener('click', (event) => requestFeedback({
  message: $('#reflection').value,
  responseTarget: $('#reflection-response'),
  button: event.currentTarget,
}));

$('#make-exercise').addEventListener('click', async (event) => {
  const button = event.currentTarget;
  const exerciseCard = $('#generated-exercise');
  exerciseCard.hidden = true;
  setBusy(button, true, 'Creating…');
  try {
    const exercise = await callTutor({ action: 'exercise', language: selectedLanguage, topic: getActiveTopic() });
    exerciseCard.replaceChildren();
    const title = document.createElement('h4');
    title.textContent = exercise.title;
    const goal = document.createElement('p');
    goal.textContent = exercise.goal;
    const prompt = document.createElement('p');
    prompt.textContent = exercise.prompt;
    const code = document.createElement('pre');
    code.textContent = exercise.starterCode;
    const criteria = document.createElement('p');
    criteria.innerHTML = '<b>How you’ll know:</b> ';
    criteria.append(document.createTextNode(exercise.successCriteria));
    const hint = document.createElement('details');
    const summary = document.createElement('summary');
    summary.textContent = 'Open a hint';
    const hintText = document.createElement('p');
    hintText.textContent = exercise.hint;
    hint.append(summary, hintText);
    const extension = document.createElement('p');
    extension.innerHTML = '<b>Ready for more?</b> ';
    extension.append(document.createTextNode(exercise.extension));
    exerciseCard.append(title, goal, prompt, code, criteria, hint, extension);
    exerciseCard.hidden = false;
  } catch (error) {
    exerciseCard.textContent = error.message;
    exerciseCard.hidden = false;
  } finally {
    setBusy(button, false);
  }
});

if (state.designGoalComplete) {
  $('#design-q2').classList.remove('locked');
  $('#design-q2').setAttribute('aria-disabled', 'false');
}
if (state.designDataComplete) $('#reflection-box').hidden = false;
renderLanguage();
renderProgress();
if (state.reviewDue && !state.reviewComplete && state.reviewLanguage === selectedLanguage) showReview();

// Review after a later return; same-session refreshes do not trigger the recall check.
const previousVisit = state.lastVisit ? new Date(state.lastVisit) : null;
if (state.messageComplete && previousVisit && (Date.now() - previousVisit.getTime() > 6 * 60 * 60 * 1000)) {
  state.reviewDue = true;
  state.reviewComplete = false;
  saveState();
}
