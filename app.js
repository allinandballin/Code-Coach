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
let selectedLanguage = localStorage.getItem('code-coach-language') || 'python';
if (!lessons[selectedLanguage]) selectedLanguage = 'python';
state.languagesCompleted = Array.isArray(state.languagesCompleted) ? state.languagesCompleted : [];
state.reviewLanguage = state.reviewLanguage || 'python';
let mainAnswered = false;

function readState() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
  catch { return {}; }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  renderProgress();
}

function renderProgress() {
  $('#progress-count').textContent = `${state.languagesCompleted.length} of ${Object.keys(lessons).length}`;
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
    : `Learn ${lessons[selectedLanguage].name}: ${lessons[selectedLanguage].focus}`;
}

function renderLanguage() {
  const lesson = lessons[selectedLanguage];
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
  $( '.nav-button[data-view="lesson"]' ).textContent = 'Lesson 1 - ' + lessons[selectedLanguage].name;
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
  runnerNote.textContent = `${lesson.name} examples are read-only in this prototype. Their language-specific coding runners will be added as those courses are built.`;
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
  mainAnswered = false;
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
  const lesson = lessons[selectedLanguage];
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
    await navigator.clipboard.writeText(lessons[selectedLanguage].code);
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
  const lesson = lessons[selectedLanguage];
  if (button.dataset.answer === 'correct') {
    button.classList.add('correct');
    feedback.hidden = false;
    feedback.className = 'answer-feedback good';
    feedback.textContent = lesson.correctFeedback;
    mainAnswered = true;
    if (!state.languagesCompleted.includes(selectedLanguage)) state.languagesCompleted.push(selectedLanguage);
    if (selectedLanguage === 'python') state.comprehensionComplete = true;
    saveState();
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
  feedback.textContent = `Hint: ${lessons[selectedLanguage].hint}`;
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
