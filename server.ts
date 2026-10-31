import express, { Request, Response, NextFunction } from 'express';
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

interface LockState {
  unlocked: boolean;
  unlockedAt?: number;
  attemptsLeft: number;
  lockedUntil: number;
  lockoutReason?: 'anti-cheat' | 'attempts_exhausted';
  currentQuestionId: string;
}

const STATE_FILE_PATH = path.resolve(__dirname, 'quiz_state.json');

function loadAllStates(): Record<string, LockState> {
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

function saveAllStates(states: Record<string, LockState>): void {
  try {
    fs.writeFileSync(STATE_FILE_PATH, JSON.stringify(states, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write quiz state file:', err);
  }
}

const memoryStates: Record<string, LockState> = loadAllStates();

function getDailyQuestion(): Question {
  const dayIndex = Math.floor(Date.now() / (24 * 60 * 60 * 1000));
  const index = Math.abs(dayIndex) % QUESTIONS.length;
  return QUESTIONS[index];
}

function parseCookies(req: Request): Record<string, string> {
  const list: Record<string, string> = {};
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return list;

  cookieHeader.split(';').forEach((cookie) => {
    let [name, ...rest] = cookie.split('=');
    name = name?.trim();
    if (!name) return;
    const value = rest.join('=').trim();
    if (!value) return;
    list[name] = decodeURIComponent(value);
  });
  return list;
}

function getIdentifiers(req: Request): { ipKey: string; clientKey?: string } {
  const forwarded = req.headers['x-forwarded-for'];
  let rawIp = '';
  if (typeof forwarded === 'string') {
    rawIp = forwarded.split(',')[0].trim();
  } else if (Array.isArray(forwarded) && forwarded[0]) {
    rawIp = forwarded[0].trim();
  } else {
    rawIp = req.socket.remoteAddress || req.ip || '127.0.0.1';
  }

  const ipKey = `ip:${rawIp}`;

  const cookies = parseCookies(req);
  let bodyClientId: string | undefined;
  if (req.body && typeof req.body === 'object') {
    bodyClientId = req.body.clientId;
  }
  const headerClientId = (req.headers['x-client-id'] as string) || (req.query.clientId as string);
  const cookieClientId = cookies['hbo_client_uid'];
  const effectiveClientId = bodyClientId || headerClientId || cookieClientId;

  return {
    ipKey,
    clientKey: effectiveClientId ? `client:${effectiveClientId}` : undefined
  };
}

function getEffectiveState(req: Request): { state: LockState; keys: string[] } {
  const currentQ = getDailyQuestion();
  const { ipKey, clientKey } = getIdentifiers(req);
  const keys = [ipKey];
  if (clientKey) keys.push(clientKey);

  // 1. Check if any matching key is unlocked
  for (const k of keys) {
    const s = memoryStates[k];
    if (s && s.unlocked) {
      return { state: s, keys };
    }
  }

  // 2. Check if any matching key is currently locked
  for (const k of keys) {
    const s = memoryStates[k];
    if (s && s.lockedUntil > Date.now()) {
      return { state: s, keys };
    }
  }

  // 3. Check if any matching key has state
  for (const k of keys) {
    const s = memoryStates[k];
    if (s) {
      if (s.lockedUntil > 0 && Date.now() >= s.lockedUntil) {
        s.lockedUntil = 0;
        s.attemptsLeft = 3;
        s.lockoutReason = undefined;
        s.currentQuestionId = currentQ.id;
        saveAllStates(memoryStates);
      }
      return { state: s, keys };
    }
  }

  // 4. Fresh default state
  const newState: LockState = {
    unlocked: false,
    attemptsLeft: 3,
    lockedUntil: 0,
    currentQuestionId: currentQ.id
  };

  keys.forEach((k) => {
    memoryStates[k] = { ...newState };
  });
  saveAllStates(memoryStates);

  return { state: newState, keys };
}

function updateStateForKeys(keys: string[], updater: (prev: LockState) => LockState): LockState {
  let updatedState: LockState | null = null;
  keys.forEach((k) => {
    const current = memoryStates[k] || {
      unlocked: false,
      attemptsLeft: 3,
      lockedUntil: 0,
      currentQuestionId: getDailyQuestion().id
    };
    const updated = updater({ ...current });
    memoryStates[k] = updated;
    updatedState = updated;
  });
  saveAllStates(memoryStates);
  return updatedState!;
}

async function startServer() {
  const app = express();
  app.set('trust proxy', true);

  // Comprehensive CORS Middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-client-id, Authorization');
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    next();
  });

  app.use(express.json());
  app.use(express.text({ type: ['text/plain', 'application/json'] }));

  // API Route: GET /api/quiz/status
  app.get('/api/quiz/status', (req: Request, res: Response) => {
    const { state } = getEffectiveState(req);
    const dailyQ = getDailyQuestion();

    if (state.unlocked) {
      return res.json({
        unlocked: true,
        revealedDate: "LE 22 NOVEMBRE",
        locked: false
      });
    }

    if (state.lockedUntil > Date.now()) {
      return res.json({
        unlocked: false,
        locked: true,
        lockoutReason: state.lockoutReason || 'anti-cheat',
        remainingMs: Math.max(0, state.lockedUntil - Date.now()),
        lockedUntil: state.lockedUntil
      });
    }

    return res.json({
      unlocked: false,
      locked: false,
      attemptsLeft: state.attemptsLeft ?? 3,
      question: {
        id: dailyQ.id,
        question: dailyQ.question,
        options: dailyQ.options
      }
    });
  });

  // API Route: POST /api/quiz/answer
  app.post('/api/quiz/answer', (req: Request, res: Response) => {
    const { state, keys } = getEffectiveState(req);
    const dailyQ = getDailyQuestion();

    if (state.unlocked) {
      return res.json({
        unlocked: true,
        revealedDate: "LE 22 NOVEMBRE",
        message: "Date déjà déverrouillée !"
      });
    }

    if (state.lockedUntil > Date.now()) {
      return res.json({
        locked: true,
        unlocked: false,
        lockoutReason: state.lockoutReason || 'anti-cheat',
        remainingMs: Math.max(0, state.lockedUntil - Date.now()),
        lockedUntil: state.lockedUntil,
        message: "Accès actuellement verrouillé."
      });
    }

    let chosenIndex: number | undefined;
    if (typeof req.body === 'object' && req.body !== null) {
      chosenIndex = req.body.chosenIndex;
    } else if (typeof req.body === 'string') {
      try {
        const parsed = JSON.parse(req.body);
        chosenIndex = parsed.chosenIndex;
      } catch {
        // ignore
      }
    }

    if (typeof chosenIndex !== 'number' || chosenIndex < 0 || chosenIndex >= dailyQ.options.length) {
      return res.status(400).json({ error: "Option invalide" });
    }

    if (chosenIndex === dailyQ.correctIndex) {
      updateStateForKeys(keys, (prev) => ({
        ...prev,
        unlocked: true,
        unlockedAt: Date.now(),
        lockedUntil: 0
      }));

      return res.json({
        success: true,
        unlocked: true,
        revealedDate: "LE 22 NOVEMBRE",
        message: "Code d'accès vérifié avec succès !"
      });
    } else {
      const newAttempts = Math.max(0, (state.attemptsLeft ?? 3) - 1);

      if (newAttempts <= 0) {
        const lockDuration = 24 * 60 * 60 * 1000;
        const lockedUntil = Date.now() + lockDuration;

        updateStateForKeys(keys, (prev) => ({
          ...prev,
          attemptsLeft: 0,
          lockedUntil,
          lockoutReason: 'attempts_exhausted'
        }));

        return res.json({
          success: false,
          unlocked: false,
          attemptsLeft: 0,
          locked: true,
          lockoutReason: 'attempts_exhausted',
          remainingMs: lockDuration,
          lockedUntil,
          message: "3 tentatives incorrectes. Accès verrouillé pour 24 heures."
        });
      } else {
        updateStateForKeys(keys, (prev) => ({
          ...prev,
          attemptsLeft: newAttempts
        }));

        return res.json({
          success: false,
          unlocked: false,
          attemptsLeft: newAttempts,
          message: `Mauvaise réponse. Il vous reste ${newAttempts} tentative${newAttempts > 1 ? 's' : ''}.`
        });
      }
    }
  });

  // API Route: POST /api/quiz/cheat
  app.post('/api/quiz/cheat', (req: Request, res: Response) => {
    const { state, keys } = getEffectiveState(req);

    if (state.unlocked) {
      return res.json({ unlocked: true });
    }

    const lockDuration = 24 * 60 * 60 * 1000;
    const lockedUntil = Date.now() + lockDuration;

    updateStateForKeys(keys, (prev) => ({
      ...prev,
      attemptsLeft: 0,
      lockedUntil,
      lockoutReason: 'anti-cheat'
    }));

    res.setHeader('Set-Cookie', [
      `hbo_quiz_lockout_until=${lockedUntil}; Path=/; Max-Age=86400; SameSite=Lax`,
      `hbo_quiz_lockout_reason=anti-cheat; Path=/; Max-Age=86400; SameSite=Lax`
    ]);

    return res.json({
      locked: true,
      lockoutReason: 'anti-cheat',
      remainingMs: lockDuration,
      lockedUntil,
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
