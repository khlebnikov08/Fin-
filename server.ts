import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize GoogleGenAI client with required User-Agent header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Endpoint for AI-generated macroeconomic news and multi-year crises
app.post('/api/generate-news', async (req, res) => {
  try {
    const {
      year = 1,
      inflationRate = 0.08,
      keyRate = 0.12,
      requestedType = 'RANDOM', // 'RANDOM' | 'CRISIS' | 'BOOM' | 'STAGFLATION' | 'TECH'
      requestedDuration, // 1 | 2 | 3
    } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY not configured on server',
        fallback: true,
      });
    }

    const durationInstruction = requestedDuration
      ? `Продолжительность события должна составлять ровно ${requestedDuration} года/лет.`
      : `Выбери случайную продолжительность кризиса или цикла: 1, 2 или 3 года.`;

    const typeInstruction =
      requestedType === 'CRISIS'
        ? 'Сгенерируй острый экономический или финансовый кризис (падение фондового рынка, всплеск инфляции или рост ставки ЦБ).'
        : requestedType === 'BOOM'
        ? 'Сгенерируй мощный экономический бум или сырьевое/технологическое ралли (рост рынка, снижение инфляции, приток инвестиций).'
        : requestedType === 'STAGFLATION'
        ? 'Сгенерируй стагфляцию (высокая инфляция при спаде деловой активности).'
        : requestedType === 'TECH'
        ? 'Сгенерируй технологический прорыв (бум искусственного интеллекта, автоматизации, взлет IT-сектора).'
        : 'Сгенерируй реалистичное макроэкономическое событие для российской экономики (это может быть кризис на 1-3 года, бум, отраслевой шок или реформа).';

    const systemPrompt = `Ты — редактор финансово-аналитического вестника в экономической игре «ФинПуть».
Твоя задача — сгенерировать выпуск деловой газеты из 6 завуалированных аналитических заметок без прямых подсказок («что покупать») и макроэкономические показатели года.

ВАЖНЫЕ ПРАВИЛА:
1. НИКАКИХ ПРЯМЫХ ПОДСКАЗОК И СОВЕТОВ («Совет: покупайте акции IT» ЗАПРЕЩЕНО). Игрок должен сам делать выводы из новостей!
2. В выпуске ДОЛЖНО БЫТЬ РОВНО 6 СТАТЕЙ по категориям:
   - MACRO (Центробанк & Макроэкономика)
   - STOCKS (Фондовый рынок & Корпорации)
   - BONDS (Облигации & Рынок госдолга)
   - BANKING (Банковский сектор & Вклады)
   - REAL_ESTATE (Недвижимость & Девелопмент)
   - BUSINESS (Бизнес, Ритейл & Торговля)
3. Определение цикла:
   - Если рынок падает, ставка растет — cycleType: "CRISIS" или "STAGFLATION".
   - Если рынок растет, доходы растут — cycleType: "BOOM" или "TECH_RALLY". НИКОГДА не называй положительный период кризисом!
   - Если ситуация стабильная — cycleType: "STANDARD".
4. Продолжительность (durationYears): от 1 до 3 лет. Игрок НЕ должен знать сколько длится цикл, но ты возвращаешь это число для движка игры.

В игре 8 секторов акций:
IT & ИИ, Финансы & Финтех, Нефть & Газ, Потребительский, Металлургия, Электронная коммерция, Девелопмент, Биотехнологии.

Верни ТОЛЬКО валидный JSON:
{
  "headline": "Главный заголовок выпуска деловой газеты (до 60 символов)",
  "summary": "Развернутая сводка экономической ситуации от редакции (2 предложения)",
  "durationYears": число 1, 2 или 3,
  "cycleType": "CRISIS" или "BOOM" или "STAGFLATION" или "TECH_RALLY" или "STANDARD",
  "inflationDelta": число изменения инфляции от -0.03 до +0.07,
  "keyRateDelta": число изменения ставки ЦБ от -0.03 до +0.06,
  "stockMarketMultiplier": коэффициент рынка акций от 0.70 до 1.35,
  "cryptoMultiplier": коэффициент криптовалюты от 0.65 до 1.55,
  "favoredSector": название сектора в плюсе (или ""),
  "hitSector": название сектора под давлением (или ""),
  "salaryMultiplier": коэффициент влияния на зарплату от 0.95 до 1.12,
  "businessMultiplier": коэффициент влияния на прибыль бизнеса от 0.75 до 1.25,
  "centralBank": {
    "action": "RAISE" или "CUT" или "HOLD",
    "rateChange": число от -0.025 до +0.03,
    "statement": "Официальное заявление Банка России под председательством Эльвиры Набиуллиной (2 реалистичных предложения с экономическими терминами)",
    "guidance": "HAWKISH" или "DOVISH" или "NEUTRAL",
    "reasoning": "Баланс инфляционных рисков и охлаждения кредитования"
  },
  "articles": [
    {
      "id": "art_1",
      "category": "MACRO",
      "categoryLabel": "Центробанк & Макроэкономика",
      "title": "Заголовок новости макроэкономики",
      "content": "Аналитический текст новости в деловом стиле без прямых подсказок (2 предложения)"
    },
    {
      "id": "art_2",
      "category": "STOCKS",
      "categoryLabel": "Фондовый рынок",
      "title": "Заголовок новости фондового рынка",
      "content": "Аналитический текст о настроениях на бирже"
    },
    {
      "id": "art_3",
      "category": "BONDS",
      "categoryLabel": "Облигации & Госдолг",
      "title": "Заголовок новости долгового рынка",
      "content": "Аналитический текст об аукционах ОФЗ и корпоративных бондах"
    },
    {
      "id": "art_4",
      "category": "BANKING",
      "categoryLabel": "Банки & Вклады",
      "title": "Заголовок новости банковского сектора",
      "content": "Аналитический текст о ставках по депозитам и ликвидности"
    },
    {
      "id": "art_5",
      "category": "REAL_ESTATE",
      "categoryLabel": "Недвижимость & Девелопмент",
      "title": "Заголовок новости рынка жилья",
      "content": "Аналитический текст о ценах на новостройки и аренду"
    },
    {
      "id": "art_6",
      "category": "BUSINESS",
      "categoryLabel": "Бизнес & Потребрынок",
      "title": "Заголовок новости малого бизнеса и торговли",
      "content": "Аналитический текст о потребительском спросе и издержках"
    }
  ]
}`;

    const userPrompt = `Текущий игровой год: ${year}.
Текущая инфляция в стране: ${(inflationRate * 100).toFixed(1)}%.
Текущая ключевая ставка ЦБ: ${(keyRate * 100).toFixed(1)}%.
Сформируй новый полноценный выпуск делового вестника из 6 новостей.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        temperature: 0.85,
      },
    });

    const responseText = response.text?.trim() || '{}';
    const parsedData = JSON.parse(responseText);

    const result = {
      id: `macro_${Date.now()}`,
      headline: parsedData.headline || 'Экономический вестник года',
      summary: parsedData.summary || 'Рынки перестраиваются под влиянием глобальных макроэкономических факторов.',
      articles: Array.isArray(parsedData.articles) && parsedData.articles.length > 0 ? parsedData.articles : undefined,
      durationYears: parsedData.durationYears || 1,
      yearsRemaining: parsedData.durationYears || 1,
      cycleType: parsedData.cycleType || (parsedData.durationYears > 1 ? 'CRISIS' : 'STANDARD'),
      inflationDelta: Number(parsedData.inflationDelta) || 0.01,
      keyRateDelta: Number(parsedData.keyRateDelta) || 0.01,
      centralBank: parsedData.centralBank
        ? {
            action: parsedData.centralBank.action || 'HOLD',
            rateChange: Number(parsedData.centralBank.rateChange) || Number(parsedData.keyRateDelta) || 0,
            newKeyRate: Math.max(0.06, Math.min(0.24, +(Number(keyRate) + (Number(parsedData.centralBank.rateChange) || Number(parsedData.keyRateDelta) || 0)).toFixed(3))),
            statement:
              parsedData.centralBank.statement ||
              'Совет директоров Банка России сохраняет фокус на возвращении инфляции к целевому показателю 4%.',
            guidance: parsedData.centralBank.guidance || 'NEUTRAL',
            inflationTarget: 0.04,
            reasoning:
              parsedData.centralBank.reasoning ||
              'Денежно-кредитные условия поддерживаются на адекватном уровне для сдерживания ценового давления.',
          }
        : undefined,
      marketImpact: {
        stockMarketMultiplier: Number(parsedData.stockMarketMultiplier) || 1.0,
        cryptoMultiplier: Number(parsedData.cryptoMultiplier) || 1.0,
        favoredSector: parsedData.favoredSector || undefined,
        hitSector: parsedData.hitSector || undefined,
        salaryMultiplier: Number(parsedData.salaryMultiplier) || 1.0,
        businessMultiplier: Number(parsedData.businessMultiplier) || 1.0,
      },
    };

    return res.json(result);
  } catch (error) {
    console.error('Error generating AI news:', error);
    return res.status(500).json({
      error: 'Failed to generate AI news',
      details: String(error),
      fallback: true,
    });
  }
});

// Endpoint for AI-generated life and gameplay events
app.post('/api/generate-gameplay-event', async (req, res) => {
  try {
    const {
      characterName = 'Алексей',
      role = 'IT-разработчик',
      year = 1,
      cash = 500000,
      netWorth = 1000000,
      annualSalary = 1200000,
      joy = 70,
      hasCar = false,
      hasApartment = false,
      hasBusiness = false,
      activeCrisisTitle,
    } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY not configured on server',
        fallback: true,
      });
    }

    const contextItems: string[] = [
      `Персонаж: ${characterName} (${role})`,
      `Игровой год: ${year}`,
      `Свободные наличные: ${Math.round(cash).toLocaleString('ru-RU')} ₽`,
      `Капитал: ${Math.round(netWorth).toLocaleString('ru-RU')} ₽`,
      `Годовая зарплата: ${Math.round(annualSalary).toLocaleString('ru-RU')} ₽`,
      `Уровень радости: ${joy}/100`,
      hasCar ? 'Есть собственный автомобиль' : 'Автомобиля нет',
      hasApartment ? 'Есть собственная квартира' : 'Арендует жилье',
      hasBusiness ? 'Владеет действующим бизнесом/активами' : 'Бизнеса нет',
    ];

    if (activeCrisisTitle) {
      contextItems.push(`В стране активен макроэкономический кризис/бум: «${activeCrisisTitle}»`);
    }

    const systemPrompt = `Ты — креативный сценарист и геймдизайнер экономической игры «ФинПуть».
Твоя задача — сгенерировать яркое, реалистичное, сюжетное жизненное или финансовое событие года для игрока на русском языке с учетом его финансового контекста и профессии.

КРИТИЧЕСКИ ВАЖНЫЕ ПРАВИЛА БАЛАНСА ИГРЫ:
- Баланс типов событий:
  * ~35% событий должны быть НЕГАТИВНЫМИ или вызывающими финансовые трудности/бытовые проблемы (поломка техники, штраф, рост цен, внезапный налог, ремонт, стоматология, усталость, бытовые траты). joyDelta от -6 до -15, cashDelta отрицательная или 0.
  * ~35% событий должны быть ПОЗИТИВНЫМИ возможностями (премия, выгодная подработка, грант, подарок, удачный проект). joyDelta от +5 до +12, cashDelta положительная.
  * ~30% событий должны быть ДИЛЕММАМИ с выбором ("hasChoice": true) — например, инвестировать в рискованный стартап друга или отказать, поехать на дорогую конференцию или сэкономить, взять сложный овертайм за большие деньги (-joy) или отдохнуть (+joy).
- Радость не должна бесконечно расти сама по себе! joyDelta не должна превышать +12 пунктов за обычное событие, чтобы игрок имел стимул покупать радости жизни (отпуск, гаджеты, благотворительность).

ПРАВИЛО ПРО ЗДОРОВЬЕ И СТРАХОВКУ:
- Болезни и травмы случаются редко (около 10-15% случаев), совершенно НЕЗАВИСИМО от наличия ДМС.
- Если выпало медицинское событие (операция, стоматология, травма), укажи coveredByInsurance: "HEALTH_DMS".
- Если авария авто (только если у игрока есть авто!), укажи coveredByInsurance: "CAR_CASCO".
- Если повреждение квартиры (только если есть собственная квартира!), укажи coveredByInsurance: "HOME".
- В остальных случаях — coveredByInsurance: null.

Нигде в тексте не упоминай слова «ИИ», «генератор», «нейросеть», «Gemini». Текст должен читаться как органичная часть качественной видеоигры.

Верни ТОЛЬКО валидный JSON:
{
  "title": "Краткий и броский заголовок (до 45 символов)",
  "description": "Атмосферное описание ситуации от второго лица (2-3 предложения)",
  "cashDelta": число рублей (например -80000 или 120000 или 0),
  "joyDelta": число пунктов радости от -15 до +12,
  "coveredByInsurance": "HEALTH_DMS" или "CAR_CASCO" или "HOME" или null,
  "insuranceAvoidedLoss": число рублей потерь при наличии страховки (или 0),
  "iconType": "good" или "bad" или "neutral",
  "hasChoice": true или false,
  "choices": [
    {
      "id": "option_a",
      "label": "Текст первого выбора (например: Принять предложение)",
      "cashDelta": число,
      "joyDelta": число,
      "description": "Краткое последствие выбора"
    },
    {
      "id": "option_b",
      "label": "Текст второго выбора (например: Отказаться и не рисковать)",
      "cashDelta": число,
      "joyDelta": число,
      "description": "Краткое последствие выбора"
    }
  ]
}`;

    const userPrompt = `Контекст игрока:\n${contextItems.join('\n')}\nСгенерируй новое увлекательное событие года.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        temperature: 0.9,
      },
    });

    const responseText = response.text?.trim() || '{}';
    const parsed = JSON.parse(responseText);

    const result = {
      id: `ai_event_${Date.now()}`,
      title: parsed.title || 'Неожиданное событие года',
      description: parsed.description || 'В вашей жизни произошли непредвиденные перемены, повлиявшие на финансы и настроение.',
      cashDelta: Number(parsed.cashDelta) || 0,
      joyDelta: Number(parsed.joyDelta) || 0,
      coveredByInsurance: parsed.coveredByInsurance || undefined,
      insuranceAvoidedLoss: Number(parsed.insuranceAvoidedLoss) || Math.abs(Number(parsed.cashDelta) || 0),
      iconType: (parsed.iconType === 'good' || parsed.iconType === 'bad') ? parsed.iconType : 'neutral',
      isAiGenerated: true,
      choices: Array.isArray(parsed.choices) && parsed.choices.length >= 2 ? parsed.choices : undefined,
    };

    return res.json(result);
  } catch (error) {
    console.error('Error generating AI gameplay event:', error);
    return res.status(500).json({
      error: 'Failed to generate AI gameplay event',
      details: String(error),
      fallback: true,
    });
  }
});

async function start() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    // In dev, mount Vite middleware
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve built files
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server started on http://0.0.0.0:${PORT}`);
  });
}

start();
