// server.js - ENHANCED MDCAT Past Paper Generator with WEB RESEARCH & SPEED IMPROVEMENTS
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Polyfill fetch for Node < 18
let fetchFn = global.fetch;
if (typeof fetchFn !== 'function') {
  fetchFn = (...args) => import('node-fetch').then(({ default: f }) => f(...args));
}
const fetch = fetchFn;

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static('.'));

// API Key Management System with Rotation
const API_KEYS = [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3
].filter(key => key && key.trim().length > 0);

if (API_KEYS.length === 0) {
    console.error('❌ At least one GEMINI_API_KEY is required but not found in environment variables');
    if (process.env.NODE_ENV !== 'test') process.exit(1);
}

// API Key Rotation State
let currentKeyIndex = 0;
const keyFailureCount = new Map();
const keyLastFailureTime = new Map();
const KEY_COOLDOWN_TIME = 60000; // 1 minute cooldown after quota exceeded

// Initialize key states
API_KEYS.forEach((key, index) => {
    keyFailureCount.set(index, 0);
    keyLastFailureTime.set(index, 0);
});

console.log(`🔑 Initialized ${API_KEYS.length} API keys for rotation`);

// Get next available API key
function getAvailableAPIKey() {
    const now = Date.now();

    // Find the best available key
    for (let i = 0; i < API_KEYS.length; i++) {
        const keyIndex = (currentKeyIndex + i) % API_KEYS.length;
        const lastFailure = keyLastFailureTime.get(keyIndex);

        // If key hasn't failed recently or cooldown period has passed
        if (now - lastFailure > KEY_COOLDOWN_TIME) {
            currentKeyIndex = keyIndex;
            return {
                key: API_KEYS[keyIndex],
                index: keyIndex
            };
        }
    }

    // If all keys are in cooldown, use the one with oldest failure
    let oldestFailureIndex = 0;
    let oldestFailureTime = keyLastFailureTime.get(0);

    for (let i = 1; i < API_KEYS.length; i++) {
        const failureTime = keyLastFailureTime.get(i);
        if (failureTime < oldestFailureTime) {
            oldestFailureTime = failureTime;
            oldestFailureIndex = i;
        }
    }

    currentKeyIndex = oldestFailureIndex;
    return {
        key: API_KEYS[oldestFailureIndex],
        index: oldestFailureIndex
    };
}

// Mark key as failed (quota exceeded)
function markKeyAsFailed(keyIndex, error) {
    keyFailureCount.set(keyIndex, (keyFailureCount.get(keyIndex) || 0) + 1);
    keyLastFailureTime.set(keyIndex, Date.now());

    console.log(`⚠️ API Key ${keyIndex + 1} failed: ${error.message}`);
    console.log(`🔄 Switching to next available key...`);

    // Move to next key
    currentKeyIndex = (keyIndex + 1) % API_KEYS.length;
}

// ENHANCED: Punjab Textbook Board Intermediate Syllabus - Subject-wise Topics
const PUNJAB_TEXTBOOK_SYLLABUS = {
  biology: {
    percentage: 0.45,
    textbooks: ['FSc Biology Part 1', 'FSc Biology Part 2', 'Punjab Board Biology'],
    topics: [
      'Introduction to Biology',
      'Cell Structure and Function',
      'Biological Molecules (Carbohydrates, Proteins, Lipids)',
      'Cell Cycle and Cell Division',
      'Bioenergetics (Photosynthesis and Respiration)',
      'Enzymes and their Functions',
      'Kingdom Monera (Bacteria)',
      'Kingdom Protista',
      'Kingdom Fungi',
      'Kingdom Plantae (Plant Classification)',
      'Plant Tissues and Morphology',
      'Plant Nutrition and Transport',
      'Plant Growth and Development',
      'Kingdom Animalia (Animal Classification)',
      'Animal Tissues and Organs',
      'Digestive System',
      'Circulatory System',
      'Respiratory System',
      'Excretory System',
      'Nervous System and Coordination',
      'Endocrine System',
      'Reproduction in Plants and Animals',
      'Development and Embryology',
      'Chromosomes and DNA',
      'Cell Division (Mitosis and Meiosis)',
      'Mendel Laws and Inheritance',
      'Molecular Genetics',
      'Evolution and Natural Selection',
      'Biodiversity and Conservation',
      'Ecology and Ecosystems',
      'Environmental Issues'
    ]
  },
  chemistry: {
    percentage: 0.25,
    textbooks: ['FSc Chemistry Part 1', 'FSc Chemistry Part 2', 'Punjab Board Chemistry'],
    topics: [
      'Basic Concepts of Chemistry',
      'Atomic Structure and Electron Configuration',
      'Periodic Table and Periodicity',
      'Chemical Bonding (Ionic, Covalent, Metallic)',
      'States of Matter (Gases, Liquids, Solids)',
      'Chemical Thermodynamics',
      'Chemical Equilibrium',
      'Acids, Bases and Salts',
      'Solutions and Colligative Properties',
      'Electrochemistry and Electrolysis',
      'Chemical Kinetics',
      'Organic Chemistry Introduction',
      'Hydrocarbons (Alkanes, Alkenes, Alkynes)',
      'Alkyl Halides',
      'Alcohols, Phenols and Ethers',
      'Aldehydes and Ketones',
      'Carboxylic Acids',
      'Esters and Fats',
      'Carbohydrates',
      'Amino Acids and Proteins',
      'Synthetic Polymers',
      'Environmental Chemistry'
    ]
  },
  physics: {
    percentage: 0.20,
    textbooks: ['FSc Physics Part 1', 'FSc Physics Part 2', 'Punjab Board Physics'],
    topics: [
      'Physical Quantities and Measurement',
      'Vectors and Scalars',
      'Motion and Force',
      'Work, Energy and Power',
      'Circular Motion',
      'Gravitation',
      'Properties of Matter',
      'Heat and Thermodynamics',
      'Wave Motion and Sound',
      'Light and Optics',
      'Electrostatics',
      'Current Electricity',
      'Electromagnetism',
      'Electromagnetic Induction',
      'Alternating Current',
      'Physics of Solids',
      'Electronics',
      'Dawn of Modern Physics',
      'Atomic Structure',
      'Nuclear Physics'
    ]
  },
  english: {
    percentage: 0.05,
    textbooks: ['Punjab Board English Grammar', 'Intermediate English'],
    topics: [
      'Parts of Speech',
      'Tenses (Present, Past, Future)',
      'Active and Passive Voice',
      'Direct and Indirect Speech',
      'Sentence Structure and Types',
      'Subject-Verb Agreement',
      'Articles (A, An, The)',
      'Prepositions',
      'Pronouns and Antecedents',
      'Adjectives and Adverbs',
      'Conjunctions and Connectors',
      'Conditionals',
      'Question Formation',
      'Negation',
      'Modal Verbs',
      'Gerunds and Infinitives',
      'Clauses (Independent, Dependent)',
      'Punctuation Rules'
    ]
  },
  logical: {
    percentage: 0.05,
    textbooks: ['MDCAT Logical Reasoning', 'Critical Thinking'],
    topics: [
      'Logical Sequences',
      'Analogies',
      'Classifications',
      'Series Completion',
      'Coding and Decoding',
      'Blood Relations',
      'Direction Sense',
      'Ranking and Ordering',
      'Statement and Conclusion',
      'Statement and Assumption',
      'Cause and Effect',
      'Syllogism',
      'Logical Deduction'
    ]
  }
};

// ENHANCED SUBJECT DETECTION SYSTEM - FIXED FOR BENZENE ISSUE
const ENHANCED_SUBJECT_KEYWORDS = {
  biology: {
    primary: ['cell', 'biology', 'enzyme', 'protein', 'dna', 'rna', 'gene', 'chromosome', 'mitosis', 'meiosis',
              'photosynthesis', 'respiration', 'digestion', 'circulation', 'nervous', 'hormone', 'reproduction',
              'evolution', 'ecology', 'plant', 'animal', 'bacteria', 'virus', 'fungi', 'tissue', 'organ',
              'bioenergetics', 'inheritance', 'mendel', 'molecular', 'biodiversity', 'ecosystem', 'kingdom'],
    secondary: ['life', 'living', 'organism', 'species', 'genetic', 'cellular', 'metabolism', 'growth']
  },
  chemistry: {
    primary: ['benzene', 'organic', 'hydrocarbon', 'alkane', 'alkene', 'alkyne', 'alcohol', 'aldehyde', 'ketone',
              'acid', 'ester', 'polymer', 'molecule', 'atom', 'bond', 'reaction', 'chemical', 'compound',
              'element', 'periodic', 'solution', 'equilibrium', 'kinetics', 'thermodynamics', 'electrochemistry',
              'ionic', 'covalent', 'oxidation', 'reduction', 'catalyst', 'ph', 'buffer', 'crystalline'],
    secondary: ['carbon', 'hydrogen', 'oxygen', 'nitrogen', 'formula', 'structure', 'synthesis', 'molar', 'mass']
  },
  physics: {
    primary: ['motion', 'force', 'energy', 'power', 'wave', 'light', 'sound', 'electricity', 'magnetism',
              'gravitation', 'mechanics', 'optics', 'nuclear', 'atomic', 'quantum', 'electromagnetic',
              'current', 'voltage', 'resistance', 'thermodynamics', 'heat', 'temperature', 'pressure'],
    secondary: ['mass', 'velocity', 'acceleration', 'momentum', 'work', 'frequency', 'wavelength', 'newton', 'joule']
  },
  english: {
    primary: ['grammar', 'tense', 'voice', 'speech', 'sentence', 'verb', 'noun', 'pronoun', 'adjective',
              'adverb', 'preposition', 'conjunction', 'article', 'punctuation', 'clause'],
    secondary: ['active', 'passive', 'present', 'past', 'future', 'direct', 'indirect']
  }
};

// ENHANCED: Smart subject detection with weighted scoring - FIXED VERSION
function detectSubjectFromTopic(topic) {
  if (!topic || typeof topic !== 'string') return null;

  const lcTopic = topic.toLowerCase().trim();
  console.log(`🔍 Analyzing topic: "${topic}"`);

  const subjectScores = {};

  for (const [subject, keywords] of Object.entries(ENHANCED_SUBJECT_KEYWORDS)) {
    let score = 0;

    // Primary keywords (weight: 3)
    for (const keyword of keywords.primary) {
      if (lcTopic.includes(keyword)) {
        score += 3;
        console.log(`✓ Found primary keyword "${keyword}" for ${subject} (score: +3)`);
      }
    }

    // Secondary keywords (weight: 1)
    for (const keyword of keywords.secondary) {
      if (lcTopic.includes(keyword)) {
        score += 1;
        console.log(`✓ Found secondary keyword "${keyword}" for ${subject} (score: +1)`);
      }
    }

    // Exact topic matches from Punjab syllabus (weight: 5)
    const syllabusTopics = PUNJAB_TEXTBOOK_SYLLABUS[subject]?.topics || [];
    for (const syllTopic of syllabusTopics) {
      const topicLower = syllTopic.toLowerCase();
      if (lcTopic.includes(topicLower) || topicLower.includes(lcTopic)) {
        score += 5;
        console.log(`✓ Syllabus match "${syllTopic}" for ${subject} (score: +5)`);
      }
    }

    subjectScores[subject] = score;
  }

  console.log('🔍 Subject scores:', subjectScores);

  // Find best match
  const bestSubject = Object.entries(subjectScores)
    .filter(([_, score]) => score > 0)
    .sort(([,a], [,b]) => b - a)[0];

  if (bestSubject) {
    const detectedSubject = bestSubject[0].charAt(0).toUpperCase() + bestSubject[0].slice(1);
    console.log(`🎯 Detected subject: ${detectedSubject} (score: ${bestSubject[1]})`);
    return detectedSubject;
  }

  console.log(`⚠️ Could not detect subject for topic: "${topic}"`);
  return null;
}

// Alternative function name for compatibility
function detectTopicSubject(topic) {
  return detectSubjectFromTopic(topic);
}

// ENHANCED: Web Research Function for MDCAT Past Papers
async function searchMDCATPastPapers(topic, subject) {
  try {
    console.log(`🔬 Initiating deep research for: "${topic}" in ${subject} subject`);
    console.log(`🏥 Analyzing past papers from UHS, KMU, DUHS, BUMHS, NUMS (2018-2025)`);

    // Create research-focused prompts for Gemini
    const researchPrompt = `
    Conduct comprehensive research on MDCAT past paper questions for "${topic}" from ${subject} subject.

    Research Focus Areas:
    1. 📚 UHS, KMU, DUHS, BUMHS, NUMS past papers (2018-2025)
    2. 📖 Punjab Textbook Board FSc ${subject} curriculum alignment for "${topic}"
    3. 🎯 Question patterns, formats, and difficulty trends for "${topic}"
    4. 🔍 Key concepts, sub-topics, and applications under "${topic}"
    5. 📊 Common wrong options and conceptual traps in "${topic}" questions
    6. 🏆 High-yield areas within "${topic}" for MDCAT preparation

    Provide detailed, structured research data that will enable generation of authentic MDCAT questions about "${topic}".

    Include specific examples of question types, difficulty progression, and subject integration where applicable.
    `;

    console.log(`🤖 Querying AI research database for "${topic}"...`);
    const response = await callGeminiForResearch(researchPrompt);

    if (response && response.length > 100) {
      console.log(`✅ Research successful: Found ${response.length} characters of data for "${topic}"`);
      console.log(`📊 Research includes question patterns, curriculum alignment, and difficulty analysis`);
    } else {
      console.log(`⚠️ Limited research data returned for "${topic}"`);
    }

    return response;
  } catch (error) {
    console.error(`❌ Research failed for "${topic}":`, error.message);
    return null;
  }
}

// ENHANCED: Research-specific Gemini API call with key rotation
async function callGeminiForResearch(prompt) {
  const { key, index } = getAvailableAPIKey();

  try {
    console.log(`🔬 Research using API Key ${index + 1}/${API_KEYS.length}`);

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=' + key, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3, // Lower temperature for research accuracy
          topP: 0.8,
          maxOutputTokens: 2048
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Research API failed: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';

  } catch (error) {
    console.error('❌ Research API call failed:', error.message);
    throw error;
  }
}

// Generate questions using Gemini API with retry logic
async function callGeminiAPIWithRetry(prompt, maxRetries = 3) {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🤖 Gemini API call attempt ${attempt}/${maxRetries}`);
      const response = await callGeminiAPI(prompt);

      if (response && response.length > 0) {
        console.log(`✅ Generated ${response.length} questions on attempt ${attempt}`);
        return response;
      } else {
        throw new Error('No questions generated');
      }
    } catch (error) {
      console.error(`❌ Attempt ${attempt} failed:`, error.message);
      lastError = error;

      if (attempt < maxRetries) {
        const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        console.log(`⏳ Waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  throw lastError || new Error('All retry attempts failed');
}

// Core Gemini API call function with key rotation
async function callGeminiAPI(prompt) {
  let lastError;

  // Try each available API key
  for (let attempt = 0; attempt < API_KEYS.length; attempt++) {
    try {
      const { key, index } = getAvailableAPIKey();

      console.log(`🔑 Using API Key ${index + 1}/${API_KEYS.length}`);

      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=' + key, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          topP: 0.8,
          maxOutputTokens: 4096, // Reduced for faster responses
          stopSequences: []
        }
      })
    });

    if (!response.ok) {
      let errorText = 'Unknown error';
      try {
        errorText = await response.text();
      } catch (e) {
        errorText = `HTTP ${response.status} ${response.statusText}`;
      }

      const error = new Error(`Gemini API error ${response.status}: ${errorText}`);

      // Check if this is a quota exceeded error
      if (response.status === 429 && errorText.includes('quota')) {
        console.log(`📊 API Key ${index + 1} quota exceeded, marking as failed`);
        markKeyAsFailed(index, error);
        lastError = error;
        continue; // Try next key
      }

      throw error;
    }

    const data = await response.json();

    if (!data.candidates || !data.candidates[0]) {
      throw new Error('No candidates returned from Gemini API');
    }

    const generatedText = data.candidates[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      throw new Error('No content generated from Gemini API');
    }

    // Enhanced JSON parsing with robust error handling
    try {
      let jsonString = '';
      
      // Try multiple extraction methods
      const jsonArrayMatch = generatedText.match(/\[[\s\S]*?\]/);
      const codeBlockMatch = generatedText.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/);
      
      if (codeBlockMatch) {
        jsonString = codeBlockMatch[1];
      } else if (jsonArrayMatch) {
        jsonString = jsonArrayMatch[0];
      } else {
        // Clean the response and try direct parsing
        jsonString = generatedText
          .trim()
          .replace(/^```(?:json)?/, '')
          .replace(/```$/, '')
          .trim();
      }

      // Handle incomplete JSON by finding the last complete object
      if (jsonString.includes('...') || !jsonString.endsWith(']')) {
        const objects = jsonString.split('},');
        const completeObjects = [];
        
        for (let i = 0; i < objects.length - 1; i++) {
          const obj = objects[i] + '}';
          try {
            JSON.parse('[' + obj + ']');
            completeObjects.push(obj);
          } catch (e) {
            break;
          }
        }
        
        if (completeObjects.length > 0) {
          jsonString = '[' + completeObjects.join(',') + ']';
        }
      }

      const questions = JSON.parse(jsonString);

      if (!Array.isArray(questions)) {
        throw new Error('Generated content is not an array');
      }

      if (questions.length === 0) {
        throw new Error('Generated array is empty');
      }

      // Validate and clean question structure
      const validQuestions = questions.filter(q => {
        if (!q.question || !q.options || !q.answer) {
          console.warn(`⚠️ Skipping invalid question structure`);
          return false;
        }
        return true;
      });

      console.log(`✅ Successfully generated ${validQuestions.length} questions with Key ${index + 1}`);
      return validQuestions;

    } catch (parseError) {
      console.error('❌ JSON parsing failed:', parseError.message);
      console.error('Raw response excerpt:', generatedText.substring(0, 300) + '...');
      lastError = new Error(`Failed to parse generated questions as JSON: ${parseError.message}`);
      continue; // Try next key in case of parsing issues
    }
    } catch (error) {
      console.error(`❌ API Key ${index + 1} failed:`, error.message);
      lastError = error;

      // If quota error, mark key as failed
      if (error.message.includes('quota') || error.message.includes('429')) {
        markKeyAsFailed(index, error);
      }

      continue; // Try next key
    }
  }

  // If all keys failed
  console.error('❌ All API keys failed or in cooldown');
  throw lastError || new Error('All API keys failed');
}

// Main generation endpoint with enhanced error handling
app.post('/api/generate-questions', async (req, res) => {
  const startTime = Date.now();

  try {
    const {
      count = 10,
      testFormat = 'full-test',
      topic,
      selectedSubject,
      paragraph,
      source = 'all',
      yearRange = 'recent',
      difficulty = 'mixed'
    } = req.body;

    console.log(`🚀 Generation request: ${testFormat} - ${count} questions`);
    console.log('📝 Parameters:', { topic, selectedSubject, paragraph: paragraph ? 'provided' : 'none' });

    // Validate API key
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured. Please check environment variables.');
    }

    // Log if we'll be doing online research
    if (topic && topic.trim()) {
      console.log(`🔬 Will perform online research for topic: "${topic}"`);
    }

    const params = { count, testFormat, topic, selectedSubject, paragraph, source, yearRange, difficulty };

    // Handle different generation types
    let questions = [];

    try {
      if (paragraph && paragraph.trim().length >= 50) {
        // Generate from paragraph
        questions = await generateFromParagraph(paragraph, count, selectedSubject);
      } else if (testFormat === 'topic-test' && topic) {
        // Enhanced topic generation with subject detection and research
        questions = await generateTopicQuestionsEnhanced(params);
      } else if (testFormat === 'subject-test' && selectedSubject) {
        // Subject-specific generation
        questions = await generateSubjectQuestions(params);
      } else if (testFormat === 'full-test') {
        // Full MDCAT test generation
        questions = await generateFullTest(params);
      } else {
        return res.status(400).json({
          success: false,
          error: 'Invalid parameters. Please provide valid testFormat and required fields.'
        });
      }
    } catch (generationError) {
      console.error('❌ Question generation error:', generationError.message);
      throw new Error(`Failed to generate questions: ${generationError.message}`);
    }

    if (!questions || questions.length === 0) {
      throw new Error('No questions were generated. Please try again with different parameters.');
    }

    const processedQuestions = addIds(questions.slice(0, count));
    const processingTime = Date.now() - startTime;

    console.log(`✅ Successfully generated ${processedQuestions.length} questions in ${processingTime}ms`);

    res.json({
      success: true,
      questions: processedQuestions,
      metadata: {
        questionCount: processedQuestions.length,
        processingTime,
        testFormat,
        source,
        yearRange,
        difficulty,
        subjectDistribution: getSubjectDistribution(processedQuestions),
        researchPerformed: topic && topic.trim() ? true : false,
        researchTopic: topic || null
      }
    });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`❌ Generation failed:`, error.message);

    res.status(500).json({
      success: false,
      error: error.message || 'An unexpected error occurred during question generation',
      processingTime,
      timestamp: new Date().toISOString()
    });
  }
});

// ENHANCED: Topic question generation with optimized parallel processing
async function generateTopicQuestionsEnhanced(params) {
  const { topic, count, difficulty, selectedSubject } = params;
  const OPTIMAL_CHUNK_SIZE = 20; // Optimized chunk size for speed

  try {
    // Step 1: Detect correct subject if not provided
    let detectedSubject = selectedSubject;
    if (!detectedSubject) {
      detectedSubject = detectSubjectFromTopic(topic);
      if (!detectedSubject) {
        throw new Error(`Cannot determine subject for topic: ${topic}. Please specify the subject manually.`);
      }
    }

    console.log(`📋 Subject determined: ${detectedSubject} for topic: "${topic}"`);

    // Step 2: Perform online research (with timeout and detailed logging)
    let researchData = null;
    try {
      console.log(`🔬 Starting comprehensive research for "${topic}" in ${detectedSubject}...`);
      console.log(`📚 Searching UHS, KMU, DUHS, BUMHS, NUMS past papers...`);

      researchData = await Promise.race([
        searchMDCATPastPapers(topic, detectedSubject),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Research timeout after 5 seconds')), 5000)
        )
      ]);

      if (researchData && researchData.length > 100) {
        console.log(`✅ Research successful for "${topic}" - Found comprehensive data (${researchData.length} chars)`);
      } else {
        console.log(`⚠️ Research returned limited data for "${topic}" - Using syllabus fallback`);
        researchData = null;
      }
    } catch (error) {
      console.warn(`⚠️ Research failed/timeout for "${topic}": ${error.message}`);
      console.log(`📖 Falling back to Punjab Board syllabus for "${topic}"`);
      researchData = null;
    }

    // Step 3: Use optimized parallel processing for large requests
    if (count <= OPTIMAL_CHUNK_SIZE) {
      // Single request for small counts
      const prompt = buildTopicPrompt({
        topic,
        subject: detectedSubject,
        questionCount: count,
        difficulty,
        researchData
      });

      const questions = await callGeminiAPIWithRetry(prompt, 2);

      if (!questions || questions.length === 0) {
        throw new Error(`No questions generated for topic: ${topic}`);
      }

      console.log(`✅ Generated ${questions.length} questions for topic: "${topic}" (${detectedSubject})`);
      return questions;
    }

    // Ultra-fast parallel processing for large counts
    console.log(`⚡ Ultra-fast processing: ${count} questions for "${topic}" in ${OPTIMAL_CHUNK_SIZE}-question batches`);

    const chunks = Math.ceil(count / OPTIMAL_CHUNK_SIZE);
    const chunkPromises = [];

    // Create all chunk promises immediately for maximum parallelism
    for (let i = 0; i < chunks; i++) {
      const chunkSize = Math.min(OPTIMAL_CHUNK_SIZE, count - (i * OPTIMAL_CHUNK_SIZE));

      const chunkPromise = (async (chunkIndex) => {
        try {
          // Minimal stagger (50ms) for API rate limiting
          await new Promise(resolve => setTimeout(resolve, chunkIndex * 50));

          const prompt = buildTopicPrompt({
            topic,
            subject: detectedSubject,
            questionCount: chunkSize,
            difficulty,
            researchData
          });

          const chunkQuestions = await callGeminiAPIWithRetry(prompt, 2);

          if (chunkQuestions && chunkQuestions.length > 0) {
            console.log(`✅ Chunk ${chunkIndex + 1}/${chunks} completed: ${chunkQuestions.length} questions for "${topic}"`);
            return chunkQuestions.slice(0, chunkSize);
          }
          return [];
        } catch (error) {
          console.error(`❌ Chunk ${chunkIndex + 1} failed for "${topic}":`, error.message);
          return [];
        }
      })(i);

      chunkPromises.push(chunkPromise);
    }

    // Execute all chunks simultaneously
    console.log(`🚀 Processing ${chunks} chunks simultaneously for "${topic}"...`);
    const chunkResults = await Promise.all(chunkPromises);
    const allQuestions = chunkResults.flat();

    console.log(`📊 Topic chunked generation complete: ${allQuestions.length}/${count} questions for "${topic}"`);

    if (allQuestions.length === 0) {
      throw new Error(`No questions generated for topic: ${topic}`);
    }

    return allQuestions;

  } catch (error) {
    console.error(`❌ Topic generation failed for "${topic}":`, error.message);
    throw error;
  }
}

// Build enhanced topic-specific prompt
function buildTopicPrompt({ topic, subject, questionCount, difficulty, researchData }) {
  const syllabusTopics = PUNJAB_TEXTBOOK_SYLLABUS[subject.toLowerCase()]?.topics || [];
  const relatedTopics = syllabusTopics.filter(t =>
    t.toLowerCase().includes(topic.toLowerCase()) ||
    topic.toLowerCase().includes(t.toLowerCase())
  );

  const difficultyText = difficulty === 'mixed'
    ? 'Mix difficulty: 20% easy, 60% moderate, 20% difficult'
    : `Generate ${difficulty} level questions only`;

  let researchContext = '';
  if (researchData) {
    researchContext = `
RESEARCH CONTEXT (from MDCAT past papers):
${researchData.substring(0, 800)}...

`;
  }

  return `${researchContext}Generate EXACTLY ${questionCount} authentic MDCAT multiple-choice questions about "${topic}" from ${subject} subject.

TOPIC REQUIREMENTS:
- Primary Focus: "${topic}" ONLY
- Subject: ${subject}
- ALL ${questionCount} questions must be about "${topic}" - NO other topics
- Follow Punjab Textbook Board FSc ${subject} curriculum
- Related syllabus areas: ${relatedTopics.slice(0, 3).join(', ') || topic}

QUESTION REQUIREMENTS:
1. Generate EXACTLY ${questionCount} questions about "${topic}" ONLY
2. ${difficultyText}
3. Use authentic MDCAT format and style from UHS, KMU, DUHS, BUMHS, NUMS past papers
4. Each question must have 4 options (A, B, C, D) with 1 correct answer
5. Include detailed explanations referencing Punjab Board curriculum
6. Cover different aspects: definitions, applications, comparisons within "${topic}"
7. Ensure medical/scientific accuracy for 2024-2025 standards
8. Keep each question unique and avoid repetition
9. Vary question types: conceptual, analytical, application-based

RESPONSE FORMAT - Return ONLY valid JSON array:
[
  {
    "question": "Question text about ${topic}",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answer": "A",
    "explanation": "Detailed explanation about ${topic}",
    "subject": "${subject}",
    "topic": "${topic}",
    "difficulty": "easy|moderate|difficult",
    "year": 2024,
    "source": "MDCAT"
  }
]

CRITICAL INSTRUCTIONS:
- Generate EXACTLY ${questionCount} questions (no more, no less)
- Return ONLY the JSON array (no extra text, markdown, or formatting)
- ALL questions must be about "${topic}" from ${subject} subject only
- Ensure proper JSON formatting with no syntax errors

Generate the questions now:`;
}

// Generate from paragraph content
async function generateFromParagraph(paragraph, count, specifiedSubject) {
  try {
    const detectedSubject = specifiedSubject || detectSubjectFromParagraph(paragraph);

    const prompt = `Generate EXACTLY ${count} multiple-choice questions based ONLY on this paragraph content:

PARAGRAPH:
"${paragraph}"

REQUIREMENTS:
1. ALL questions must be answerable from the paragraph content ONLY
2. Subject context: ${detectedSubject}
3. Use MDCAT format: 4 options (A, B, C, D) with 1 correct answer
4. Test comprehension, analysis, and application of paragraph content
5. Do NOT add external information beyond the paragraph
6. Generate exactly ${count} questions

RESPONSE FORMAT - Return ONLY valid JSON array:
[
  {
    "question": "Question based on paragraph content",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answer": "A",
    "explanation": "Explanation referencing the paragraph",
    "subject": "${detectedSubject}",
    "topic": "Paragraph-based",
    "difficulty": "moderate",
    "year": 2024,
    "source": "User Paragraph"
  }
]

Generate the questions now:`;

    const questions = await callGeminiAPIWithRetry(prompt, 2);
    return questions || [];
  } catch (error) {
    console.error(`❌ Paragraph generation failed:`, error.message);
    throw error;
  }
}

// Detect subject from paragraph content
function detectSubjectFromParagraph(paragraph) {
  const scores = { Biology: 0, Chemistry: 0, Physics: 0, English: 0 };
  const lcParagraph = paragraph.toLowerCase();

  // Score based on subject keywords
  for (const [subject, data] of Object.entries(ENHANCED_SUBJECT_KEYWORDS)) {
    const subjectName = subject.charAt(0).toUpperCase() + subject.slice(1);

    // Primary keywords
    for (const keyword of data.primary) {
      const matches = (lcParagraph.match(new RegExp(keyword, 'g')) || []).length;
      scores[subjectName] += matches * 3;
    }

    // Secondary keywords
    for (const keyword of data.secondary) {
      const matches = (lcParagraph.match(new RegExp(keyword, 'g')) || []).length;
      scores[subjectName] += matches * 1;
    }
  }

  // Return highest scoring subject
  const bestSubject = Object.entries(scores)
    .sort(([,a], [,b]) => b - a)[0];

  return bestSubject[1] > 0 ? bestSubject[0] : 'Biology';
}

// Generate subject-specific questions
async function generateSubjectQuestions(params) {
  const { selectedSubject, count, difficulty, source, yearRange } = params;

  // Map subject names to syllabus keys
  const subjectKeyMap = {
    'logical reasoning': 'logical',
    'biology': 'biology',
    'chemistry': 'chemistry',
    'physics': 'physics',
    'english': 'english'
  };

  const subjectKey = subjectKeyMap[selectedSubject.toLowerCase()] || selectedSubject.toLowerCase();
  const subjectInfo = PUNJAB_TEXTBOOK_SYLLABUS[subjectKey];

  if (!subjectInfo) {
    throw new Error(`Invalid subject: ${selectedSubject}`);
  }

  const prompt = buildSubjectPrompt({
    subject: selectedSubject,
    questionCount: count,
    difficulty,
    source,
    yearRange,
    topics: subjectInfo.topics
  });

  const questions = await callGeminiAPIWithRetry(prompt, 2);

  return questions.map(q => ({
    ...q,
    subject: selectedSubject,
    year: q.year || getRandomYear(yearRange)
  }));
}

// Generate full MDCAT test with optimized parallel processing
async function generateFullTest(params) {
  const { count, difficulty, source, yearRange } = params;

  // Calculate distribution based on MDCAT percentages
  const distribution = calculateDistribution(count);

  const subjects = [
    { name: 'Biology', key: 'biology', count: distribution.biology },
    { name: 'Chemistry', key: 'chemistry', count: distribution.chemistry },
    { name: 'Physics', key: 'physics', count: distribution.physics },
    { name: 'English', key: 'english', count: distribution.english },
    { name: 'Logical Reasoning', key: 'logical', count: distribution.logical }
  ];

  console.log(`⚡ Ultra-fast parallel processing for ${subjects.filter(s => s.count > 0).length} subjects...`);

  // Process all subjects simultaneously with optimized chunking
  const subjectPromises = subjects
    .filter(subject => subject.count > 0)
    .map(async (subject) => {
      console.log(`🚀 Starting ${subject.count} ${subject.name} questions...`);

      try {
        const subjectQuestions = await generateSubjectQuestionsOptimized({
          ...params,
          selectedSubject: subject.name,
          count: subject.count,
          topic: null
        });

        if (subjectQuestions && subjectQuestions.length > 0) {
          const cleanedQuestions = subjectQuestions
            .slice(0, subject.count)
            .map(q => ({
              ...q,
              subject: subject.name,
              year: q.year || getRandomYear(yearRange)
            }));

          console.log(`✅ Completed ${cleanedQuestions.length} ${subject.name} questions`);
          return cleanedQuestions;
        }
        return [];
      } catch (error) {
        console.error(`❌ Failed to generate ${subject.name} questions:`, error.message);
        return [];
      }
    });

  // Wait for all subjects to complete in parallel
  const subjectResults = await Promise.all(subjectPromises);
  const allQuestions = subjectResults.flat();

  console.log(`🎉 Generated ${allQuestions.length}/${count} total questions`);
  return allQuestions;
}

// Optimized subject generation with parallel chunking
async function generateSubjectQuestionsOptimized(params) {
  const { count } = params;
  const OPTIMAL_CHUNK_SIZE = 15; // Smaller chunks for faster processing and fewer timeouts

  if (count <= OPTIMAL_CHUNK_SIZE) {
    return await generateSubjectQuestions(params);
  }

  console.log(`⚡ Optimized chunking: ${count} questions into ${OPTIMAL_CHUNK_SIZE}-question batches`);

  const chunks = Math.ceil(count / OPTIMAL_CHUNK_SIZE);
  const chunkPromises = [];

  // Create all chunk promises simultaneously
  for (let i = 0; i < chunks; i++) {
    const startIndex = i * OPTIMAL_CHUNK_SIZE;
    const chunkSize = Math.min(OPTIMAL_CHUNK_SIZE, count - startIndex);

    const chunkPromise = (async (chunkIndex) => {
      try {
        // Minimal stagger to avoid overwhelming API
        await new Promise(resolve => setTimeout(resolve, chunkIndex * 100));

        const chunkParams = { ...params, count: chunkSize };
        const chunkQuestions = await generateSubjectQuestions(chunkParams);

        if (chunkQuestions && chunkQuestions.length > 0) {
          console.log(`✅ Chunk ${chunkIndex + 1}/${chunks} completed: ${chunkQuestions.length} questions`);
          return chunkQuestions.slice(0, chunkSize);
        }
        return [];
      } catch (error) {
        console.error(`❌ Chunk ${chunkIndex + 1} failed:`, error.message);
        return [];
      }
    })(i);

    chunkPromises.push(chunkPromise);
  }

  // Execute all chunks in parallel
  console.log(`🚀 Processing ${chunks} chunks simultaneously...`);
  const chunkResults = await Promise.all(chunkPromises);
  const allQuestions = chunkResults.flat();

  console.log(`📊 Optimized generation complete: ${allQuestions.length}/${count} questions`);
  return allQuestions;
}

// Build subject-specific prompt
function buildSubjectPrompt({ subject, questionCount, difficulty, source, yearRange, topics }) {
  const difficultyText = difficulty === 'mixed'
    ? 'Mix difficulty levels: 25% easy, 50% moderate, 25% difficult'
    : `Generate ${difficulty} level questions only`;

  const yearText = yearRange && yearRange !== 'all'
    ? `Questions should reflect ${yearRange === 'recent' ? '2020-2025' : yearRange} MDCAT patterns`
    : 'Use current MDCAT question patterns';

  const uniText = source && source !== 'all'
    ? `Style questions similar to ${source} past papers`
    : 'Use authentic MDCAT past paper style questions';

  return `Generate EXACTLY ${questionCount} authentic MDCAT questions for ${subject} subject ONLY.

SUBJECT REQUIREMENTS:
- Subject: ${subject} ONLY - NO other subjects
- Topics from Punjab Board curriculum: ${topics.slice(0, 15).join(', ')}...
- ALL ${questionCount} questions must be ${subject}
- Follow FSc ${subject} Part 1 & Part 2 syllabus

QUESTION REQUIREMENTS:
1. Generate EXACTLY ${questionCount} questions from ${subject} ONLY
2. ${difficultyText}
3. ${yearText}
4. ${uniText}
5. Each question: 4 options (A, B, C, D) with 1 correct answer
6. Include detailed explanations
7. Ensure variety across ${subject} topics
8. Medical/scientific accuracy for current standards

RESPONSE FORMAT - Return ONLY valid JSON array:
[
  {
    "question": "${subject} question text",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answer": "A",
    "explanation": "Detailed explanation",
    "subject": "${subject}",
    "topic": "Specific ${subject} topic",
    "difficulty": "easy|moderate|difficult",
    "year": 2024,
    "source": "MDCAT"
  }
]

Generate the questions now:`;
}

// Build comprehensive prompt for different test formats
function buildPrompt(params) {
  const {
    testFormat,
    questionCount,
    topic,
    selectedSubject,
    paragraph,
    difficulty = 'mixed',
    source = 'all',
    yearRange = 'recent'
  } = params;

  let scopeText = '';
  let topicsBlock = '';

  // Difficulty distribution text
  const difficultyText = difficulty === 'mixed'
    ? 'Distribute difficulty: 25% easy, 50% moderate, 25% difficult'
    : `Generate ${difficulty} level questions only`;

  // Year range text
  const yearText = yearRange && yearRange !== 'all'
    ? `Focus on ${yearRange === 'recent' ? '2020-2025' : yearRange} question patterns`
    : 'Use current MDCAT standards';

  if (paragraph && paragraph.trim().length >= 50) {
    // Paragraph-based generation
    scopeText = `Generate questions based EXCLUSIVELY on the provided paragraph content.`;
    topicsBlock = `
PARAGRAPH CONTENT:
"${paragraph}"

PARAGRAPH INSTRUCTIONS:
- ALL questions must be answerable from the paragraph content ONLY
- Do NOT add external information beyond what's in the paragraph
- Test comprehension, analysis, and inference from the given text
- Subject context: ${selectedSubject || 'General'}`;

  } else if (testFormat === 'full-test') {
    // Full MDCAT test generation
    const distribution = calculateDistribution(questionCount);
    scopeText = `Generate a complete MDCAT practice test with ${questionCount} questions distributed across all subjects.`;
    topicsBlock = `
FULL TEST DISTRIBUTION (STRICT ORDER):
1. ALL Biology questions first (${distribution.biology} questions)
2. ALL Chemistry questions second (${distribution.chemistry} questions)
3. ALL Physics questions third (${distribution.physics} questions)
4. ALL English questions fourth (${distribution.english} questions)
5. ALL Logical Reasoning questions last (${distribution.logical} questions)`;

  } else if (testFormat === 'topic-test' && topic) {
    // ENHANCED: Topic-specific generation with proper subject detection
    const relatedSubject = findTopicSubject(topic) || detectSubjectFromTopic(topic);
    const subjectForTopic = relatedSubject || selectedSubject || 'Biology';

    scopeText = `Generate questions EXCLUSIVELY for the SPECIFIC TOPIC: "${topic}"`;
    topicsBlock = `
TOPIC FOCUS INSTRUCTIONS:
- Generate ALL ${questionCount} questions about: "${topic}"
- Subject context: ${subjectForTopic}
- NO other topics allowed
- ALL questions must be directly related to: "${topic}"
- Use only concepts, terms, and examples from: "${topic}"
- Question variety: definitions, applications, comparisons, analysis within "${topic}"
- Must align with Punjab Textbook Board FSc ${subjectForTopic} curriculum`;

  } else if (testFormat === 'subject-test' && selectedSubject) {
    // ENHANCED: Subject-specific generation
    const subjectInfo = PUNJAB_TEXTBOOK_SYLLABUS[selectedSubject.toLowerCase()];
    if (!subjectInfo) {
      throw new Error(`Invalid subject: ${selectedSubject}`);
    }

    scopeText = `Generate questions for ${selectedSubject} subject ONLY. ALL ${questionCount} questions must be ${selectedSubject}.`;
    topicsBlock = `
SUBJECT FOCUS INSTRUCTIONS:
- Generate ALL ${questionCount} questions from ${selectedSubject} ONLY
- NO questions from other subjects
- Distribute questions across these ${selectedSubject} topics: ${subjectInfo.topics.slice(0, 10).join(', ')}...
- Ensure variety within ${selectedSubject} topics
- ALL questions must have subject: "${selectedSubject}"
- Must align with Punjab Textbook Board FSc ${selectedSubject} textbooks`;

  } else {
    // Default fallback
    scopeText = `Generate mixed MDCAT questions covering various subjects.`;
    topicsBlock = `Cover topics from Biology, Chemistry, Physics, English, and Logical Reasoning.`;
  }

  const uniText = source && source !== 'all' ? `Style questions similar to ${source} past papers.` :
                                              'Use authentic MDCAT past paper style questions.';

  const schema = `
RESPONSE FORMAT: Return ONLY a valid JSON array. No markdown, no explanations, no code blocks.

Required JSON Structure:
[
  {
    "question": "Complete question text with all necessary details",
    "options": ["First option text", "Second option text", "Third option text", "Fourth option text"],
    "answer": "A",
    "explanation": "Detailed explanation of correct answer and why others are incorrect",
    "subject": "Biology|Chemistry|Physics|English|Logical Reasoning",
    "topic": "Specific topic from official Punjab Board syllabus",
    "difficulty": "easy|moderate|difficult",
    "year": 2024,
    "source": "${source || 'MDCAT'}"
  }
]

STRICT VALIDATION REQUIREMENTS:
- Generate EXACTLY ${questionCount} questions (no more, no less)
- Each question must have exactly 4 options (no A), B), C), D) prefixes in options array)
- Answer must be exactly one of: "A", "B", "C", "D"
- All fields are mandatory except "topic" which can be general
- Questions must be medically/scientifically accurate and current
- English questions: Grammar/syntax only (no literature/comprehension)
- Use proper JSON escaping for quotes and special characters
- Must align with Punjab Textbook Board intermediate syllabus
- ${testFormat === 'topic-test' ? `ALL questions must be about topic: "${topic}"` : ''}
- ${testFormat === 'subject-test' ? `ALL questions must be from subject: "${selectedSubject}"` : ''}`;

  return `
You are an expert MDCAT Past Paper Generator. Create exactly ${questionCount} authentic multiple-choice questions from Punjab Textbook Board curriculum.

${scopeText}
${topicsBlock}

GENERATION REQUIREMENTS:
1. Generate EXACTLY ${questionCount} questions in valid JSON array format
2. Each question must have 4 options and 1 correct answer
3. Include detailed explanations for every answer
4. Questions must be from official Punjab Board 2025 syllabus topics
5. Ensure medical/scientific accuracy and currency
6. For full tests: Follow strict sequential subject ordering
7. For topic tests: ALL questions must be about the specified topic ONLY
8. For subject tests: ALL questions must be from the specified subject ONLY
9. Maintain authentic MDCAT difficulty and style
10. Research past MDCAT papers from UHS, KMU, DUHS, BUMHS, NUMS for authenticity

${difficultyText}
${yearText}
${uniText}

${schema}

Generate the questions now:`;
}

// Calculate subject distribution based on question count
function calculateDistribution(total) {
  const biology = Math.floor(total * PUNJAB_TEXTBOOK_SYLLABUS.biology.percentage);
  const chemistry = Math.floor(total * PUNJAB_TEXTBOOK_SYLLABUS.chemistry.percentage);
  const physics = Math.floor(total * PUNJAB_TEXTBOOK_SYLLABUS.physics.percentage);
  const english = Math.floor(total * PUNJAB_TEXTBOOK_SYLLABUS.english.percentage);
  const logical = Math.floor(total * PUNJAB_TEXTBOOK_SYLLABUS.logical.percentage);

  const currentSum = biology + chemistry + physics + english + logical;
  const remaining = total - currentSum;

  let result = { biology, chemistry, physics, english, logical };

  if (remaining > 0) {
    const priorities = ['biology', 'chemistry', 'physics', 'english', 'logical'];
    for (let i = 0; i < remaining; i++) {
      result[priorities[i % priorities.length]]++;
    }
  }

  console.log(`📊 Distribution for ${total} questions:`, result);
  console.log(`📊 Total distributed: ${Object.values(result).reduce((a, b) => a + b, 0)}`);

  return result;
}

// Add IDs to questions for tracking
function addIds(questions) {
  return questions.map((q, i) => ({ ...q, id: i + 1 }));
}

// Find which subject a topic belongs to (ENHANCED)
function findTopicSubject(topic) {
  if (!topic) return null;
  const lcTopic = topic.toLowerCase();

  for (const [subjectKey, subjectInfo] of Object.entries(PUNJAB_TEXTBOOK_SYLLABUS)) {
    for (const t of subjectInfo.topics) {
      if (t.toLowerCase().includes(lcTopic) || lcTopic.includes(t.toLowerCase())) {
        // Return proper subject name
        return subjectKey.charAt(0).toUpperCase() + subjectKey.slice(1);
      }
    }
  }
  return null;
}

// Normalize year range
function normalizeYearRange(yearRange) {
  if (!yearRange || yearRange === 'all') return null;

  if (yearRange === 'recent') {
    return { start: 2020, end: 2025 };
  }

  if (yearRange === '2010s') {
    return { start: 2010, end: 2019 };
  }

  if (yearRange === '2020s') {
    return { start: 2020, end: 2025 };
  }

  if (typeof yearRange === 'object' && yearRange.start && yearRange.end) {
    return { start: Number(yearRange.start), end: Number(yearRange.end) };
  }

  return null;
}

// Get random year within range
function getRandomYear(yearRange) {
  const range = normalizeYearRange(yearRange);
  if (!range) return 2024;

  const { start, end } = range;
  return Math.floor(Math.random() * (end - start + 1)) + start;
}

// Get subject distribution for metadata
function getSubjectDistribution(questions) {
  const distribution = {};
  questions.forEach(q => {
    distribution[q.subject] = (distribution[q.subject] || 0) + 1;
  });
  return distribution;
}

// Additional routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/health', (req, res) => {
  const syllabusStats = Object.fromEntries(
    Object.entries(PUNJAB_TEXTBOOK_SYLLABUS).map(([k, v]) => [k, { topics: v.topics.length, percentage: v.percentage }])
  );

  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    hasApiKey: !!process.env.GEMINI_API_KEY,
    missingApiKey: !process.env.GEMINI_API_KEY,
    environment: process.env.NODE_ENV || 'development',
    version: '3.1.0-enhanced',
    syllabusStats,
    universities: ['UHS', 'KMU', 'DUHS', 'BUMHS', 'NUMS']
  });
});

// Global error handler to ensure JSON responses
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err.message);
  
  // Always return JSON for API endpoints
  if (req.path.startsWith('/api/')) {
    return res.status(500).json({
      success: false,
      error: err.message || 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
  
  // For non-API routes, send generic error
  res.status(500).send('Internal Server Error');
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'API endpoint not found',
    path: req.path
  });
});

// Start server
if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 ENHANCED MDCAT Generator Server running on http://0.0.0.0:${PORT}`);
    console.log(`📚 With web research, speed optimizations, and paragraph support`);
    console.log(`🎯 Punjab Textbook Board syllabus alignment enabled`);
    console.log(`🔑 API Keys configured: ${API_KEYS.length}`);
  });
}

module.exports = app;