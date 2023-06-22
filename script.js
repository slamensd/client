// Airtable config
const baseId = 'appMJmaOUMG47GeY1';
const tableName = 'Slides';
const apiKey = 'keyzbt7lLQxpiP1MO';
const headers = { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' };

let slides = [];
let questions = [];

let emailAddress = '';

let currentSlideIndex = 0;

const setCurrentSlideIndex = (index) => {
  currentSlideIndex = index;
};

const createForm = (slideIndex) => {
  const form = document.createElement('form');
  form.className = 'slide-form';
  form.innerHTML = `
    ${slideIndex === 0 ? `
      <div class="slide-content">
        <h2 class="headline">Thank you for the opportunity to present our solution!</h2>
        <p class="slide-description">${slides[slideIndex].description}</p>
        <input type="email" name="email" id="email-input" placeholder="Your Email Address" required>
        <button type="submit" data-slide="${slideIndex}" class="buttons cta-button">Get Started</button>
      </div>
    ` : `
      <div class="slide-content">
        <h2 class="slide-title">${slides[slideIndex].title}</h2>
        <p class="slide-description">${slides[slideIndex].description}</p>
        <label for="question" class="form-label">Ask Us Anything About ${slides[slideIndex].title}</label>
        <textarea name="question" id="question" placeholder="Your Question"></textarea>
      </div>
      <div class="buttons">
        <button type="button" class="buttons prev" data-slide="${slideIndex}">Previous</button>
        <button type="submit" data-slide="${slideIndex}" class="buttons cta-button">Submit</button>
      </div>
    `}
  `;

  form.onsubmit = async (event) => {
    event.preventDefault();
    const { email, question } = event.target.elements;
    if (email) {
      emailAddress = email.value;
    }

    if (emailAddress && isValidCorbionEmail(emailAddress) && question) {
      await submitQuestion(slideIndex, emailAddress, question.value);
      event.target.reset();
    } else {
      alert('Please enter a valid @corbion.com email address.');
    }

    showNextSlide(slideIndex);
  };

  const prevButton = form.querySelector('.prev');
  if (prevButton) {
    prevButton.onclick = () => showPreviousSlide(slideIndex);
  }

  return form;
};

const isValidCorbionEmail = (email) => {
  const pattern = /^[a-zA-Z0-9._%+-]+@corbion\.com$/;
  return pattern.test(email);
};


const createSlide = (slideData, index) => {
  const slide = document.createElement('div');
  slide.className = 'slide-container';
  slide.innerHTML = `
    <div class="slide">
      ${index >= 0 ? `<img src="slides/Slide${index}.png" alt="Slide ${index}">` : ''}
    </div>
  `;
  slide.appendChild(createForm(index));
  return slide;
};

const createQuestionEntry = (questionData) => {
  const questionEntry = document.createElement('div');
  questionEntry.className = 'question-entry';
  questionEntry.innerHTML = `
    <p class="question-text">${questionData}</p>
  `;
  return questionEntry;
};

const submitQuestion = async (slideIndex, email, question) => {
  const data = {
    records: [
      {
        fields: {
          Slide: `Slide ${slideIndex}`,
          Email: email,
          Question: question,
        },
      },
    ],
  };
  await fetch(`https://api.airtable.com/v0/${baseId}/${tableName}`, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(data),
  });
};



const showNextSlide = (index) => {
  const currentSlide = document.querySelectorAll('.slide-container')[index];
  const emailInput = currentSlide.querySelector('#email-input');

  if (emailInput && !isValidCorbionEmail(emailInput.value)) {
    alert('Please enter a valid @corbion.com email address.');
    return;
  }

  currentSlide.style.display = 'none';
  const nextSlide = document.querySelectorAll('.slide-container')[index + 1];
  if (nextSlide) {
    nextSlide.style.display = 'flex';
    setCurrentSlideIndex(index + 1);
    fetchQuestions();
  }
};


const showPreviousSlide = (index) => {
  const currentSlide = document.querySelectorAll('.slide-container')[index];
  currentSlide.style.display = 'none';
  const previousSlide = document.querySelectorAll('.slide-container')[index - 1];
  if (previousSlide) {
    previousSlide.style.display = 'flex';
    setCurrentSlideIndex(index - 1);
    fetchQuestions();
  }
};

const fetchSlides = async () => {
  try {
    // Fetch your slide data or update it manually here
    // Example:
    slides = [
      { title: 'Complexity into Clarity', description: 'We are a digital solutions company' },
      { title: 'Complexity into Clarity', description: 'Slide 1 description' },
      { title: 'Our Objectives', description: 'Slide 2 description' },
      { title: 'The Agenda', description: 'Slide 3 description' },
      // Add more slides as needed
    ];
    updateSlides();
  } catch (error) {
    console.error('An error occurred while fetching slides data', error);
  }
};

const fetchQuestions = async () => {
  try {
    const response = await fetch(`https://api.airtable.com/v0/${baseId}/${tableName}`, {
      headers: headers,
    });
    if (response.ok) {
      const data = await response.json();
      const filteredQuestions = data.records
        .filter((record) => record.fields.Slide === `Slide ${currentSlideIndex}`)
        .map((record) => record.fields.Question);
      questions = filteredQuestions;
      showQuestions();
    } else {
      console.error('Failed to fetch questions data');
    }
  } catch (error) {
    console.error('An error occurred while fetching questions data', error);
  }
};

const showQuestions = () => {
  const questionsContainer = document.getElementById('questions-container');
  questionsContainer.innerHTML = '';
  questions.forEach((questionData) => {
    const questionEntry = createQuestionEntry(questionData);
    questionsContainer.appendChild(questionEntry);
  });
};

const updateSlides = () => {
  const container = document.getElementById('slides-container');
  container.innerHTML = '';
  slides.forEach((slideData, index) => {
    const slide = createSlide(slideData, index);
    slide.style.display = index === 0 ? 'flex' : 'none';
    container.appendChild(slide);
  });
};

fetchSlides();
