import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Question {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  context: string;
}

const QUESTIONS: Question[] = [
  {
    id: "derry-q1",
    question: "Quel est le nom du 9ème épisode de la série HBO « Ça : Bienvenue à Derry » ?",
    options: [
      "The Black Spot",
      "Bloodlines",
      "Il n'y a pas de 9ème épisode",
      "The Ritual of Chüd"
    ],
    correctIndex: 2,
    context: "La saison 1 de la série HBO comprend 8 épisodes au total."
  },
  {
    id: "tlou-q2",
    question: "Dans la saison 2 de « The Last of Us » sur HBO Max, quelle actrice incarne le rôle d'Abby Anderson ?",
    options: [
      "Kaitlyn Dever",
      "Bella Ramsey",
      "Florence Pugh",
      "Mackenzie Davis"
    ],
    correctIndex: 0,
    context: "Kaitlyn Dever a été officiellement castée pour interpréter Abby."
  },
  {
    id: "hotd-q3",
    question: "Dans « House of the Dragon », quel est le nom du redoutable dragon monté par Daemon Targaryen ?",
    options: [
      "Vhagar",
      "Caraxès",
      "Syrax",
      "Vermithor"
    ],
    correctIndex: 1,
    context: "Caraxès, surnommé le Ver Sanglant (Blood Wyrm), est la monture de Daemon."
  }
];

interface ClientQuizState {
  unlocked: boolean;
  unlockedAt?: number;
  attemptsLeft: number;
  lockedUntil: number;
  lockoutReason?: 'anti-cheat' | 'attempts_exhausted';
  currentQuestionId: string;
}

const STATE_FILE_PATH = path.resolve(__dirname, 'quiz_state.json');

function loadAllStates(): Record<string, ClientQuizState> {
  try {
    if (fs.existsSync(STATE_FILE_PATH)) {
      const data = fs.readFileSync(STATE_FILE_PATH, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Failed to read quiz state file:', err);
  }
  return {};
}

function saveAllStates(states: Record<string, ClientQuizState>): void {
  try {
    fs.writeFileSync(STATE_FILE_PATH, JSON.stringify(states, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write quiz state file:', err);
  }
}

const memoryStates: Record<string, ClientQuizState> = loadAllStates();

function getClientIdentifier(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  let ip = '';
  if (typeof forwarded === 'string') {
    ip = forwarded.split(',')[0].trim();
  } else if (Array.isArray(forwarded) && forwarded[0]) {
    ip = forwarded[0].trim();
  } else {
    ip = req.socket.remoteAddress || '127.0.0.1';
  }

  // Also support an optional persistent client header for extra robustness
  const clientId = req.headers['x-client-id'] as string;
  if (clientId && clientId.length > 5) {
    return `${ip}_${clientId}`;
  }
  return ip;
}

function getDailyQuestion(): Question {
  // Rotate questions every 24 hours based on UTC epoch day
  const dayIndex = Math.floor(Date.now() / (24 * 60 * 60 * 1000));
  const index = Math.abs(dayIndex) % QUESTIONS.length;
  return QUESTIONS[index];
}

function getOrCreateClientState(clientId: string): ClientQuizState {
  const currentQ = getDailyQuestion();
  let state = memoryStates[clientId];

  if (!state) {
    state = {
      unlocked: false,
      attemptsLeft: 3,
      lockedUntil: 0,
      currentQuestionId: currentQ.id
    };
    memoryStates[clientId] = state;
    saveAllStates(memoryStates);
    return state;
  }

  // If locked, check if the 24h lockout period has passed
  if (state.lockedUntil > 0 && Date.now() >= state.lockedUntil) {
    state.lockedUntil = 0;
    state.attemptsLeft = 3;
    state.lockoutReason = undefined;
    state.currentQuestionId = currentQ.id;
    saveAllStates(memoryStates);
  }

  return state;
}

async function startServer() {
  const app = express();
  app.set('trust proxy', true);
  app.use(express.json());

  // API Route: GET /api/quiz/status
  app.get('/api/quiz/status', (req: Request, res: Response) => {
    const clientId = getClientIdentifier(req);
    const state = getOrCreateClientState(clientId);
    const dailyQ = getDailyQuestion();

    if (state.unlocked) {
      return res.json({
        unlocked: true,
        revealedDate: "LE 22 NOVEMBRE",
        locked: false
      });
    }

    if (state.lockedUntil > 0 && Date.now() < state.lockedUntil) {
      return res.json({
        unlocked: false,
        locked: true,
        lockoutReason: state.lockoutReason,
        remainingMs: Math.max(0, state.lockedUntil - Date.now()),
        lockedUntil: state.lockedUntil
      });
    }

    return res.json({
      unlocked: false,
      locked: false,
      attemptsLeft: state.attemptsLeft,
      question: {
        id: dailyQ.id,
        question: dailyQ.question,
        options: dailyQ.options
      }
    });
  });

  // API Route: POST /api/quiz/answer
  app.post('/api/quiz/answer', (req: Request, res: Response) => {
    const clientId = getClientIdentifier(req);
    const state = getOrCreateClientState(clientId);
    const dailyQ = getDailyQuestion();

    if (state.unlocked) {
      return res.json({
        unlocked: true,
        revealedDate: "LE 22 NOVEMBRE",
        message: "Date déjà déverrouillée !"
      });
    }

    if (state.lockedUntil > 0 && Date.now() < state.lockedUntil) {
      return res.status(403).json({
        locked: true,
        lockoutReason: state.lockoutReason,
        remainingMs: Math.max(0, state.lockedUntil - Date.now())
      });
    }

    const { chosenIndex } = req.body;
    if (typeof chosenIndex !== 'number' || chosenIndex < 0 || chosenIndex >= dailyQ.options.length) {
      return res.status(400).json({ error: "Option invalide" });
    }

    if (chosenIndex === dailyQ.correctIndex) {
      state.unlocked = true;
      state.unlockedAt = Date.now();
      state.lockedUntil = 0;
      saveAllStates(memoryStates);

      return res.json({
        success: true,
        unlocked: true,
        revealedDate: "LE 22 NOVEMBRE",
        message: "Code d'accès vérifié avec succès !"
      });
    } else {
      state.attemptsLeft = Math.max(0, state.attemptsLeft - 1);

      if (state.attemptsLeft <= 0) {
        state.lockedUntil = Date.now() + 24 * 60 * 60 * 1000;
        state.lockoutReason = 'attempts_exhausted';
        saveAllStates(memoryStates);

        return res.json({
          success: false,
          unlocked: false,
          attemptsLeft: 0,
          locked: true,
          lockoutReason: 'attempts_exhausted',
          remainingMs: 24 * 60 * 60 * 1000,
          message: "3 tentatives incorrectes. Accès verrouillé pour 24 heures."
        });
      }

      saveAllStates(memoryStates);
      return res.json({
        success: false,
        unlocked: false,
        attemptsLeft: state.attemptsLeft,
        message: `Mauvaise réponse. Il vous reste ${state.attemptsLeft} tentative${state.attemptsLeft > 1 ? 's' : ''}.`
      });
    }
  });

  // API Route: POST /api/quiz/cheat
  // Triggered when visibilitychange or blur occurs while challenge modal is open
  app.post('/api/quiz/cheat', (req: Request, res: Response) => {
    const clientId = getClientIdentifier(req);
    const state = getOrCreateClientState(clientId);

    if (state.unlocked) {
      return res.json({ unlocked: true });
    }

    // Immediately trigger 24h lockout
    state.attemptsLeft = 0;
    state.lockedUntil = Date.now() + 24 * 60 * 60 * 1000;
    state.lockoutReason = 'anti-cheat';
    saveAllStates(memoryStates);

    return res.json({
      locked: true,
      lockoutReason: 'anti-cheat',
      remainingMs: 24 * 60 * 60 * 1000,
      message: "Sortie de la page détectée. Protocole anti-triche activé : verrouillage 24h."
    });
  });

  const isProd = process.env.NODE_ENV === 'production';
  const PORT = Number(process.env.PORT) || 3000;

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
