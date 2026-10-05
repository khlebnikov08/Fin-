import { GameRandomEvent, MacroNews, NewsArticle } from '../types/game';

// 85+ diverse, realistic, exciting life and financial events
export const EXPANDED_EVENTS_POOL: GameRandomEvent[] = [
  // --- CAREER & BUSINESS ---
  {
    id: 'ev_career_headhunter',
    title: 'Предложение от международного хедхантера',
    description: 'Вам предложили высокооплачиваемый контракт в крупной корпорации с подписным бонусом.',
    cashDelta: 250000,
    joyDelta: 16,
    iconType: 'good',
  },
  {
    id: 'ev_freelance_consulting',
    title: 'Консалтинговый проект на выходных',
    description: 'Бывшие партнеры пригласили провести аудит бизнес-процессов за солидный гонорар.',
    cashDelta: 120000,
    joyDelta: 8,
    iconType: 'good',
  },
  {
    id: 'ev_patent_license',
    title: 'Роялти за патент и интеллектуальную собственность',
    description: 'Ваша методическая разработка была лицензирована отраслевым холдингом.',
    cashDelta: 180000,
    joyDelta: 15,
    iconType: 'good',
  },
  {
    id: 'ev_corporate_reorg',
    title: 'Реорганизация департамента и внеплановый бонус',
    description: 'Успешное закрытие сложной сделки принесло вам премию от совета директоров.',
    cashDelta: 320000,
    joyDelta: 18,
    iconType: 'good',
  },
  {
    id: 'ev_conf_keynote',
    title: 'Ключевой спикер технологической конференции',
    description: 'Ваш доклад произвел фурор, организаторы выплатили гонорар и оплатили люксовый отель.',
    cashDelta: 85000,
    joyDelta: 14,
    iconType: 'good',
  },
  {
    id: 'ev_office_relocation_bonus',
    title: 'Компенсационный пакет за переезд офиса',
    description: 'Компания компенсировала сотрудникам транспортные неудобства разовой выплатой.',
    cashDelta: 45000,
    joyDelta: 5,
    iconType: 'good',
  },
  {
    id: 'ev_cert_exam_fail',
    title: 'Пересдача профессионального сертификата',
    description: 'Международный сертификационный экзамен оказался сложнее, потребовалась повторная оплата пошлины.',
    cashDelta: -55000,
    joyDelta: -6,
    iconType: 'bad',
  },
  {
    id: 'ev_work_equipment_crash',
    title: 'Сгорел рабочий компьютер с архивом',
    description: 'Короткое замыкание вывело из строя рабочую станцию, потребовалось срочное восстановление данных.',
    cashDelta: -90000,
    joyDelta: -8,
    iconType: 'bad',
  },
  {
    id: 'ev_delayed_salary',
    title: 'Задержка квартальной премии',
    description: 'Из-за кассового разрыва у клиента выплата квартального бонуса была отложена на следующий период.',
    cashDelta: 0,
    joyDelta: -7,
    iconType: 'neutral',
  },
  {
    id: 'ev_trade_union_payout',
    title: 'Компенсация от профсоюза на санаторий',
    description: 'Вам выделили целевую материальную помощь на оздоровление в горном спа-отеле.',
    cashDelta: 60000,
    joyDelta: 12,
    iconType: 'good',
  },

  // --- HEALTH & MEDICAL (INDEPENDENT RANDOM CHANCE: ~10%) ---
  {
    id: 'ev_dental_implants',
    title: 'Срочное стоматологическое лечение',
    description: 'Острая зубная боль потребовала сложного эндодонтического лечения и установки коронки.',
    cashDelta: -85000,
    joyDelta: -7,
    coveredByInsurance: 'HEALTH_DMS',
    insuranceAvoidedLoss: 85000,
    iconType: 'bad',
  },
  {
    id: 'ev_sports_injury_knee',
    title: 'Спортивная травма колена',
    description: 'Неудачное приземление на горнолыжном склоне привело к разрыву связки и курсу МРТ с реабилитацией.',
    cashDelta: -140000,
    joyDelta: -12,
    coveredByInsurance: 'HEALTH_DMS',
    insuranceAvoidedLoss: 140000,
    iconType: 'bad',
  },
  {
    id: 'ev_laser_vision',
    title: 'Лазерная коррекция зрения',
    description: 'Операция прошла идеально: 100% зрение без очков и линз навсегда.',
    cashDelta: -110000,
    joyDelta: 22,
    iconType: 'good',
    choices: [
      { id: 'opt_do_it', label: 'Сделать операцию (-110 000 ₽, +22 радости)', cashDelta: -110000, joyDelta: 22, description: 'Идеальное зрение дарит новое качество жизни!' },
      { id: 'opt_skip_it', label: 'Остаться в очках (0 ₽)', cashDelta: 0, joyDelta: 0, description: 'Вы решили повременить с операцией.' },
    ],
  },
  {
    id: 'ev_checkup_clean_bill',
    title: 'Плановый медицинский чекап',
    description: 'Всестороннее обследование показало прекрасные показатели здоровья и высокую устойчивость к стрессу!',
    cashDelta: -25000,
    joyDelta: 14,
    coveredByInsurance: 'HEALTH_DMS',
    insuranceAvoidedLoss: 25000,
    iconType: 'good',
  },

  // --- REAL ESTATE & HOME ---
  {
    id: 'ev_home_flood_upstairs',
    title: 'Залив квартиры соседями сверху',
    description: 'Лопнувший гибкий шланг у соседей повредил натяжной потолок и паркет в коридоре.',
    cashDelta: -160000,
    joyDelta: -11,
    requiresApartment: true,
    coveredByInsurance: 'HOME',
    insuranceAvoidedLoss: 160000,
    iconType: 'bad',
  },
  {
    id: 'ev_home_balcony_glazing',
    title: 'Остекление и утепление лоджии',
    description: 'Создание уютного рабочего кабинета с панорамным видом на город.',
    cashDelta: -120000,
    joyDelta: 16,
    requiresApartment: true,
    iconType: 'good',
    choices: [
      { id: 'make_lounge', label: 'Обустроить кабинет (-120 000 ₽, +16 радости)', cashDelta: -120000, joyDelta: 16 },
      { id: 'save_money', label: 'Оставить как есть (0 ₽)', cashDelta: 0, joyDelta: 0 },
    ],
  },
  {
    id: 'ev_home_landlord_discount',
    title: 'Скидка на аренду от собственника',
    description: 'За идеальный порядок и своевременную оплату арендодатель снизил платеж на полгода.',
    cashDelta: 48000,
    joyDelta: 8,
    iconType: 'good',
  },
  {
    id: 'ev_home_lock_malfunction',
    title: 'Заклинил электронный дверной замок',
    description: 'Срочный вызов службы вскрытия и замена надежного замка обошлись в копеечку.',
    cashDelta: -28000,
    joyDelta: -4,
    iconType: 'bad',
  },
  {
    id: 'ev_home_smart_system',
    title: 'Установка системы «Умный дом»',
    description: 'Датчики протечки, умный свет и климат-контроль сэкономили расходы на коммунальные услуги.',
    cashDelta: -45000,
    joyDelta: 10,
    iconType: 'good',
  },

  // --- CAR & TRANSPORT ---
  {
    id: 'ev_car_gearbox_service',
    title: 'Капитальное обслуживание коробки передач',
    description: 'Регламентная замена масел и фрикционов в сертифицированном техцентре.',
    cashDelta: -75000,
    joyDelta: -5,
    requiresCar: true,
    iconType: 'bad',
  },
  {
    id: 'ev_car_parking_dent',
    title: 'Вмятина на парковке у супермаркета',
    description: 'Неизвестный водитель задел бампер и скрылся. Восстановление покрытия.',
    cashDelta: -50000,
    joyDelta: -8,
    requiresCar: true,
    coveredByInsurance: 'CAR_CASCO',
    insuranceAvoidedLoss: 50000,
    iconType: 'bad',
  },
  {
    id: 'ev_car_roadtrip',
    title: 'Незабываемый автопробег по Золотому Кольцу',
    description: 'Путешествие с друзьями на собственном авто подарило море живописных фотографий и восторга.',
    cashDelta: -40000,
    joyDelta: 20,
    requiresCar: true,
    iconType: 'good',
  },
  {
    id: 'ev_car_insurance_bonus',
    title: 'Скидка КБМ за безаварийное вождение',
    description: 'Страховая компания вернула кешбэк за пятилетний стаж без единого страхового случая.',
    cashDelta: 18000,
    joyDelta: 6,
    requiresCar: true,
    iconType: 'good',
  },

  // --- SURPRISES, FINANCES & TAXES ---
  {
    id: 'ev_tax_audit_refund',
    title: 'Положительный перерасчет налоговой инспекции',
    description: 'ФНС завершила камеральную проверку прошлых периодов и вернула излишне уплаченный налог.',
    cashDelta: 72000,
    joyDelta: 11,
    iconType: 'good',
  },
  {
    id: 'ev_inheritance_antique',
    title: 'Наследство: коллекция старинных монет',
    description: 'После оценки нумизматом редкие коллекционные рубли были выгодно реализованы на аукционе.',
    cashDelta: 210000,
    joyDelta: 14,
    iconType: 'good',
  },
  {
    id: 'ev_scam_call_prevented',
    title: 'Блестящее разоблачение телефонных мошенников',
    description: 'Вы моментально распознали социальную инженерию, сохранили сбережения и помогли киберполиции.',
    cashDelta: 0,
    joyDelta: 12,
    iconType: 'good',
  },
  {
    id: 'ev_crypto_airdrop',
    title: 'Ретроспективный аирдроп блокчейн-протокола',
    description: 'За ранее совершенные транзакции на кошелек начислены ценные токены управления.',
    cashDelta: 130000,
    joyDelta: 15,
    iconType: 'good',
  },
  {
    id: 'ev_lost_wallet_returned',
    title: 'Возврат потерянного бумажника',
    description: 'Честный прохожий нашел ваш кошелек с документами и вернул все в целости и сохранности.',
    cashDelta: 0,
    joyDelta: 10,
    iconType: 'good',
  },
  {
    id: 'ev_luxury_watch_bargain',
    title: 'Выгодная перепродажа швейцарских часов',
    description: 'Купленный по случаю хронограф вырос в цене среди коллекционеров на 40%.',
    cashDelta: 150000,
    joyDelta: 12,
    iconType: 'good',
  },
  {
    id: 'ev_old_debt_repaid',
    title: 'Возврат крупного старого долга',
    description: 'Знакомый предприниматель наконец встал на ноги и вернул заем с процентами.',
    cashDelta: 95000,
    joyDelta: 11,
    iconType: 'good',
  },
  {
    id: 'ev_fine_speed_radar',
    title: 'Штрафы с камер автоматической фиксации',
    description: 'Серия штрафов за превышение скорости на междугородней трассе.',
    cashDelta: -15000,
    joyDelta: -3,
    requiresCar: true,
    iconType: 'bad',
  },
  {
    id: 'ev_neighbor_renovation_noise',
    title: 'Бесконечный ремонт у соседей',
    description: 'Шум перфоратора на протяжении полугода вынудил часто работать из коворкингов и кафе.',
    cashDelta: -35000,
    joyDelta: -10,
    iconType: 'bad',
  },
  {
    id: 'ev_dog_rescued',
    title: 'Спасение породистой собаки из приюта',
    description: 'Преданный четвероногий друг наполнил дом уютом и бесконечной искренней радостью.',
    cashDelta: -45000,
    joyDelta: 22,
    iconType: 'good',
  },
  {
    id: 'ev_gourmet_masterclass',
    title: 'Кулинарный курс у шеф-повара со звездой Michelin',
    description: 'Обучение гастрономическому искусству и великолепные ужины в кругу единомышленников.',
    cashDelta: -65000,
    joyDelta: 15,
    iconType: 'good',
  },
  {
    id: 'ev_charity_marathon',
    title: 'Финиш на полумарафоне «Бегущие Сердца»',
    description: 'Преодоление дистанции 21.1 км принесло памятную медаль, форму и гордость за себя!',
    cashDelta: -12000,
    joyDelta: 18,
    iconType: 'good',
  },

  // --- HARD DILEMMAS & REALISTIC LIFE CHALLENGES (BALANCING JOY) ---
  {
    id: 'ev_work_burnout_crisis',
    title: 'Тяжелое выгорание и хронический стресс',
    description: 'Бесконечные переработки и стресс привели к нервному истощению. Врачи настоятельно рекомендуют сделать паузу.',
    cashDelta: -80000,
    joyDelta: -16,
    iconType: 'bad',
    choices: [
      { id: 'take_retreat', label: 'Оплатить восстановительный ретрит и психотерапию (-80 000 ₽, +4 радости)', cashDelta: -80000, joyDelta: 4, description: 'Вы позаботились о ментальном здоровье и быстро пришли в норму.' },
      { id: 'ignore_burnout', label: 'Продолжать работать через силу (0 ₽, -18 радости)', cashDelta: 0, joyDelta: -18, description: 'Хроническая усталость резко снижает мотивацию к жизни и работе.' },
    ],
  },
  {
    id: 'ev_landlord_rent_hike',
    title: 'Внезапное повышение аренды жилья',
    description: 'Собственник квартиры поднял ежемесячную ставку или потребовал освободить жилье в разгар сезона.',
    cashDelta: -95000,
    joyDelta: -14,
    iconType: 'bad',
  },
  {
    id: 'ev_family_emergency_roof',
    title: 'Срочная помощь родителям с ремонтом',
    description: 'В загородном доме пожилых родителей протекла кровля перед началом заморозков.',
    cashDelta: -140000,
    joyDelta: -8,
    iconType: 'bad',
    choices: [
      { id: 'full_repair', label: 'Полностью оплатить ремонт крыши (-140 000 ₽, +10 радости от помощи)', cashDelta: -140000, joyDelta: 10, description: 'Родители со слезами благодарят вас за заботу и надежное плечо.' },
      { id: 'small_support', label: 'Помочь минимальной суммой (-35 000 ₽, -8 радости)', cashDelta: -35000, joyDelta: -8, description: 'Чувство вины и неловкости перед близкими омрачает настроение.' },
    ],
  },
  {
    id: 'ev_car_transmission_shock',
    title: 'Поломка трансмиссии на трассе',
    description: 'Внезапный выход из строя коробки передач. Эвакуатор и дорогостоящий агрегатный ремонт.',
    cashDelta: -165000,
    joyDelta: -14,
    requiresCar: true,
    iconType: 'bad',
  },
  {
    id: 'ev_tax_penalty_audit',
    title: 'Камеральная проверка ФНС и штраф',
    description: 'Налоговая инспекция доначислила пени и штраф за ошибки в прошлых декларациях по доходам.',
    cashDelta: -110000,
    joyDelta: -11,
    iconType: 'bad',
  },
  {
    id: 'ev_charity_urgent_fund',
    title: 'Благотворительный сбор на операцию ребенку',
    description: 'Фонд помощи детям-сиротам ведет срочный сбор средств на редкую жизненно важную операцию.',
    cashDelta: 0,
    joyDelta: 0,
    iconType: 'neutral',
    choices: [
      { id: 'donate_generous', label: 'Сделать щедрое пожертвование (-120 000 ₽, +24 радости)', cashDelta: -120000, joyDelta: 24, description: 'Спасенная жизнь ребенка наполняет сердце глубоким смыслом и счастьем.' },
      { id: 'donate_modest', label: 'Отправить посильный вклад (-20 000 ₽, +8 радости)', cashDelta: -20000, joyDelta: 8, description: 'Каждый рубль приближает сбор к успешному завершению.' },
      { id: 'pass_by', label: 'Пройти мимо (0 ₽, -7 радости)', cashDelta: 0, joyDelta: -7, description: 'Угрызения совести и осадок на душе.' },
    ],
  },
  {
    id: 'ev_roof_leak_tempest',
    title: 'Ураган и протечка мансарды',
    description: 'Шквалистый ветер повредил фасад и окна, дождевая вода повредила паркет и стены.',
    cashDelta: -180000,
    joyDelta: -12,
    requiresApartment: true,
    coveredByInsurance: 'HOME',
    insuranceAvoidedLoss: 180000,
    iconType: 'bad',
  },
  {
    id: 'ev_toxic_crunch_contract',
    title: 'Авральный сверхурочный контракт',
    description: 'Клиент предлагает колоссальный гонорар за сдачу проекта в нереальные сроки ценой сна и отдыха.',
    cashDelta: 0,
    joyDelta: 0,
    iconType: 'neutral',
    choices: [
      { id: 'take_the_money', label: 'Взять проект (+320 000 ₽, -20 радости)', cashDelta: 320000, joyDelta: -20, description: 'Большие деньги заработаны, но нервы и сон подорваны на месяцы вперед.' },
      { id: 'choose_health', label: 'Отказаться ради баланса жизни (0 ₽, +6 радости)', cashDelta: 0, joyDelta: 6, description: 'Вы сохранили душевное спокойствие, здоровье и теплые отношения.' },
    ],
  },
  {
    id: 'ev_scam_crypto_drain',
    title: 'Фишинговая атака на смарт-контракт',
    description: 'Вредоносная ссылка в чате инвесторов чуть не скомпрометировала доступ к вашим кошелькам.',
    cashDelta: -45000,
    joyDelta: -8,
    iconType: 'bad',
  },
  {
    id: 'ev_inflation_cost_spike',
    title: 'Скачок цен на потребительские товары',
    description: 'Резкий рост стоимости базовой продовольственной корзины и услуг сервисов в городе.',
    cashDelta: -65000,
    joyDelta: -7,
    iconType: 'bad',
  },
];

// Rich 6-article newspaper editions tailored to macro cycles
export const NEWSPAPER_CYCLES: Record<string, {
  headline: string;
  summary: string;
  cycleType: 'CRISIS' | 'BOOM' | 'STAGFLATION' | 'TECH_RALLY' | 'STANDARD';
  inflationDelta: number;
  keyRateDelta: number;
  marketImpact: {
    stockMarketMultiplier: number;
    cryptoMultiplier: number;
    favoredSector?: string;
    hitSector?: string;
    salaryMultiplier?: number;
    businessMultiplier?: number;
  };
  articles: NewsArticle[];
}> = {
  STAGFLATION: {
    headline: 'Стагфляция: Ценовое давление и пауза в росте ВВП',
    summary: 'Производственные издержки предприятий растут быстрее потребительского спроса. Регулятор удерживает жесткую политику.',
    cycleType: 'STAGFLATION',
    inflationDelta: 0.04,
    keyRateDelta: 0.03,
    marketImpact: {
      stockMarketMultiplier: 0.82,
      cryptoMultiplier: 0.75,
      favoredSector: 'Нефть & Газ',
      hitSector: 'Девелопмент',
      businessMultiplier: 0.88,
    },
    articles: [
      {
        id: 'stg_1',
        category: 'MACRO',
        categoryLabel: 'Центробанк & Макроэкономика',
        title: 'Совет директоров ЦБ повысил ставку до максимума на фоне разгона издержек',
        content: 'Регулятор констатирует существенное превышение инфляционных ожиданий бизнеса над целевыми ориентирами. Кредитование реального сектора заметно охлаждается.',
      },
      {
        id: 'stg_2',
        category: 'STOCKS',
        categoryLabel: 'Фондовый рынок',
        title: 'Котировки девелоперов и ритейла просели под тяжестью дорогих оборотных кредитов',
        content: 'Инвесторы перекладывают капитал в экспортеров сырья, способных абсорбировать инфляционный шок благодаря валютной выручке.',
      },
      {
        id: 'stg_3',
        category: 'BONDS',
        categoryLabel: 'Облигации & Госдолг',
        title: 'Доходности коротких ОФЗ подскочили до рекордных многолетних значений',
        content: 'Минфин вынужден размещать долговые обязательства с повышенной премией. В секторе корпоративных бондов нарастает дифференциация по кредитному качеству.',
      },
      {
        id: 'stg_4',
        category: 'BANKING',
        categoryLabel: 'Банки & Вклады',
        title: 'Банки предлагают сверхдоходные срочные депозиты для привлечения ликвидности',
        content: 'В конкурентной борьбе за сбережения населения кредитные организации установили привлекательные ставки по классическим безотзывным депозитам.',
      },
      {
        id: 'stg_5',
        category: 'REAL_ESTATE',
        categoryLabel: 'Недвижимость & Девелопмент',
        title: 'Падение спроса на первичную недвижимость привело к стагнации цен за квадратный метр',
        content: 'Высокие ипотечные ставки охладили энтузиазм покупателей новостроек, при этом сегмент аренды демонстрирует устойчивую заполняемость.',
      },
      {
        id: 'stg_6',
        category: 'BUSINESS',
        categoryLabel: 'Малый бизнес & Торговля',
        title: 'Индекс делового оптимизма в секторе малого бизнеса скорректировался вниз',
        content: 'Предприниматели оптимизируют расходы на маркетинг и персонал, фокусируясь на защите маржинальности и управлении дебиторской задолженностью.',
      },
    ],
  },

  BOOM: {
    headline: 'Экономический бум: Рекордный приток инвестиций и рост доходов',
    summary: 'Высокая потребительская уверенность и потребительский оптимизм формируют мощный импульс для фондового рынка и предпринимательства.',
    cycleType: 'BOOM',
    inflationDelta: -0.01,
    keyRateDelta: -0.02,
    marketImpact: {
      stockMarketMultiplier: 1.28,
      cryptoMultiplier: 1.45,
      favoredSector: 'Финансы & Финтех',
      hitSector: 'Металлургия',
      salaryMultiplier: 1.10,
      businessMultiplier: 1.25,
    },
    articles: [
      {
        id: 'bm_1',
        category: 'MACRO',
        categoryLabel: 'Макроэкономика & Инвестиции',
        title: 'Экономика на подъеме: деловая активность бьет рекорды пятилетки',
        content: 'Внутренний товарооборот и доходы домохозяйств демонстрируют опережающий рост. Налоговые сборы перевыполняют плановые ориентиры.',
      },
      {
        id: 'bm_2',
        category: 'STOCKS',
        categoryLabel: 'Рынок акций',
        title: 'Индекс Мосбиржи обновляет исторические максимумы на притоке частных инвесторов',
        content: 'Эмитенты финансового и технологического секторов рапортуют о рекордной чистой прибыли и анонсируют солидные дивидендные выплаты.',
      },
      {
        id: 'bm_3',
        category: 'BONDS',
        categoryLabel: 'Долговые рынки',
        title: 'Снижение доходностей облигаций разогнало котировки корпоративных выпусков',
        content: 'Рост тела облигаций обеспечил держателям долговых бумаг солидный совокупный инвестиционный доход.',
      },
      {
        id: 'bm_4',
        category: 'BANKING',
        categoryLabel: 'Банки & Кредитование',
        title: 'Кредитные организации смягчают скоринг и запускают программы стимулирования',
        content: 'Депозитные ставки плавно снижаются, стимулируя вкладчиков направлять свободные средства в фондовый рынок и бизнес-проекты.',
      },
      {
        id: 'bm_5',
        category: 'REAL_ESTATE',
        categoryLabel: 'Недвижимость & Земля',
        title: 'Оживление спроса на жилье подстегнуло рост капитализации квадратного метра',
        content: 'Растущие доходы населения и умеренные кредитные ставки вернули покупателей в отделы продаж девелоперов.',
      },
      {
        id: 'bm_6',
        category: 'BUSINESS',
        categoryLabel: 'Бизнес & Потребрынок',
        title: 'Торговые сети и ресторанный бизнес фиксируют взрывной рост среднего чека',
        content: 'Потребители охотно тратят на путешествия, качественные сервисы и премиальные товары отечественного производства.',
      },
    ],
  },

  CRISIS: {
    headline: 'Кредитно-финансовый шок: Ужесточение нормативов и спад рынков',
    summary: 'Мировые турбулентности и санкционные барьеры вынуждают компании сокращать инвестпрограммы и защищать балансы.',
    cycleType: 'CRISIS',
    inflationDelta: 0.05,
    keyRateDelta: 0.04,
    marketImpact: {
      stockMarketMultiplier: 0.72,
      cryptoMultiplier: 0.55,
      favoredSector: 'Потребительский',
      hitSector: 'Финансы & Финтех',
      businessMultiplier: 0.80,
    },
    articles: [
      {
        id: 'crs_1',
        category: 'MACRO',
        categoryLabel: 'Экономический шок',
        title: 'Внеочередное заседание регулятора: ставка экстренно повышена для стабилизации ликвидности',
        content: 'Банк России принимает комплексные защитные меры против оттока капитала и волатильности валютного курса.',
      },
      {
        id: 'crs_2',
        category: 'STOCKS',
        categoryLabel: 'Фондовый рынок',
        title: 'Акции банков и застройщиков оказались под давлением распродаж',
        content: 'Аналитики отмечают появление привлекательных фундаментальных точек входа для хладнокровных долгосрочных стоимостных инвесторов.',
      },
      {
        id: 'crs_3',
        category: 'BONDS',
        categoryLabel: 'Долговые рынки',
        title: 'Рынок высокодоходных облигаций (ВДО) переживает проверку на прочность',
        content: 'Инвесторы сокращают рискованные позиции в пользу суверенных бумаг ОФЗ с безусловной государственной гарантией.',
      },
      {
        id: 'crs_4',
        category: 'BANKING',
        categoryLabel: 'Банковский сектор',
        title: 'Ставки по вкладам в системообразующих банках взлетели на двузначные значения',
        content: 'Банковские вклады с защитой АСВ вновь стали главным убежищем для сохранения капитала в период нестабильности.',
      },
      {
        id: 'crs_5',
        category: 'REAL_ESTATE',
        categoryLabel: 'Рынок жилья',
        title: 'Вторичный рынок недвижимости перешел в фазу покупательского торга',
        content: 'Продавцы жилья вынуждены соглашаться на существенные дисконты при срочных сделках за наличный расчет.',
      },
      {
        id: 'crs_6',
        category: 'BUSINESS',
        categoryLabel: 'Торговля & Снабжение',
        title: 'Потребители переходят на модель сберегательного поведения и базовую корзину',
        content: 'Дискаунтеры и продуктовые ритейлеры удерживают устойчивый финансовый поток благодаря товарам первой необходимости.',
      },
    ],
  },

  TECH_RALLY: {
    headline: 'Технологический прорыв: Инновационный бум и автоматизация',
    summary: 'Масштабная цифровизация и внедрение искусственного интеллекта кратно повышают производительность передовых отраслей.',
    cycleType: 'TECH_RALLY',
    inflationDelta: -0.015,
    keyRateDelta: -0.01,
    marketImpact: {
      stockMarketMultiplier: 1.24,
      cryptoMultiplier: 1.60,
      favoredSector: 'IT & ИИ',
      hitSector: 'Нефть & Газ',
      salaryMultiplier: 1.08,
      businessMultiplier: 1.20,
    },
    articles: [
      {
        id: 'tch_1',
        category: 'MACRO',
        categoryLabel: 'Технологии & Производительность',
        title: 'Внедрение алгоритмов искусственного интеллекта сократило операционные издержки индустрий',
        content: 'Отрасли с высокой долей цифровизации демонстрируют опережающий рост рентабельности капитала.',
      },
      {
        id: 'tch_2',
        category: 'STOCKS',
        categoryLabel: 'Рынок акций',
        title: 'Ценные бумаги IT-компаний и маркетплейсов возглавили ралли котировок',
        content: 'Выручка облачных платформ, финтех-сервисов и разработчиков корпоративного софта растет двузначными темпами.',
      },
      {
        id: 'tch_3',
        category: 'BONDS',
        categoryLabel: 'Облигации',
        title: 'Технологические холдинги успешно разместили цифровые финансовые активы (ЦФА)',
        content: 'Новые инструменты заимствования привлекают институциональных и розничных игроков комфортными купонами.',
      },
      {
        id: 'tch_4',
        category: 'BANKING',
        categoryLabel: 'Финтех & Банкинг',
        title: 'Необанки расширяют кэшбэк-программы и программы лояльности для активных клиентов',
        content: 'Конкуренция за безналичный оборот стимулирует банки предлагать повышенную выгоду держателям платежных карт.',
      },
      {
        id: 'tch_5',
        category: 'REAL_ESTATE',
        categoryLabel: 'Коммерческая недвижимость',
        title: 'Спрос на дата-центры и склады последней мили превысил предложение',
        content: 'Девелоперы переориентируют инвестбюджеты на создание высокотехнологичной логистической инфраструктуры.',
      },
      {
        id: 'tch_6',
        category: 'BUSINESS',
        categoryLabel: 'Человеческий капитал',
        title: 'Спрос на высококвалифицированных специалистов превышает рыночное предложение',
        content: 'Инвестиции в профильное образование и овладение современным инструментарием окупаются быстрее, чем когда-либо.',
      },
    ],
  },

  STANDARD: {
    headline: 'Стабильное равновесие: Предсказуемый темп и контролируемая инфляция',
    summary: 'Финансовые рынки находятся в фазе сбалансированного умеренного развития без резких макроэкономических потрясений.',
    cycleType: 'STANDARD',
    inflationDelta: 0.005,
    keyRateDelta: 0.0,
    marketImpact: {
      stockMarketMultiplier: 1.06,
      cryptoMultiplier: 1.10,
      favoredSector: 'Потребительский',
      businessMultiplier: 1.05,
    },
    articles: [
      {
        id: 'std_1',
        category: 'MACRO',
        categoryLabel: 'Макроэкономическая стабильность',
        title: 'Инфляция удерживается в рамках прогнозного коридора Банка России',
        content: 'Монетарные власти сохраняют нейтральную тональность, поддерживая предсказуемость финансовых условий для заемщиков и инвесторов.',
      },
      {
        id: 'std_2',
        category: 'STOCKS',
        categoryLabel: 'Фондовый рынок',
        title: 'Дивидендные аристократы традиционно подтвердили график годовых выплат',
        content: 'Эмитенты сырьевого и потребительского секторов направляют акционерам солидные дивидендные потоки согласно дивидендным политикам.',
      },
      {
        id: 'std_3',
        category: 'BONDS',
        categoryLabel: 'Рынок ОФЗ',
        title: 'Сбалансированный спрос на государственные бумаги обеспечивает надежную купонную доходность',
        content: 'Инвесторы фиксируют прогнозируемые купонные выплаты на долгосрочных горизонтах планирования.',
      },
      {
        id: 'std_4',
        category: 'BANKING',
        categoryLabel: 'Банковский сектор',
        title: 'Объем сбережений граждан в кредитных организациях демонстрирует плавный органический прирост',
        content: 'Инструменты гарантирования вкладов формируют прочную основу для доверия частных вкладчиков.',
      },
      {
        id: 'std_5',
        category: 'REAL_ESTATE',
        categoryLabel: 'Рынок недвижимости',
        title: 'Арендные ставки в крупных мегаполисах индексируются вровень с инфляцией',
        content: 'Арендная доходность жилой недвижимости сохраняет статус консервативного защитного инструмента.',
      },
      {
        id: 'std_6',
        category: 'BUSINESS',
        categoryLabel: 'Потребительский сектор',
        title: 'Отечественные торговые марки укрепляют позиции в ритейле и сфере услуг',
        content: 'Локальные производители расширяют ассортимент и наращивают повторные продажи за счет стабильного качества.',
      },
    ],
  },
};

export function pickRichMacroNews(cycleKey?: string): MacroNews {
  const keys = Object.keys(NEWSPAPER_CYCLES);
  const selectedKey = cycleKey && NEWSPAPER_CYCLES[cycleKey]
    ? cycleKey
    : keys[Math.floor(Math.random() * keys.length)];

  const template = NEWSPAPER_CYCLES[selectedKey];
  const isHawkish = template.cycleType === 'CRISIS' || template.cycleType === 'STAGFLATION';
  const isDovish = template.cycleType === 'BOOM' || template.cycleType === 'TECH_RALLY';

  const cbAction = isHawkish ? 'RAISE' : isDovish ? 'CUT' : 'HOLD';
  const cbStatement = isHawkish
    ? 'Совет директоров Банка России принял решение повысить ключевую ставку для обуздания инфляционного давления и защиты сбережений граждан.'
    : isDovish
    ? 'Банк России снизил ключевую ставку на фоне замедления ценового давления для поддержки инвестиционной активности бизнеса.'
    : 'Банк России сохранил ключевую ставку неизменной, оценивая баланс между темпами роста экономики и ценовой стабильностью.';

  return {
    id: `macro_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    headline: template.headline,
    summary: template.summary,
    articles: template.articles,
    cycleType: template.cycleType,
    inflationDelta: template.inflationDelta,
    keyRateDelta: template.keyRateDelta,
    durationYears: template.cycleType === 'CRISIS' || template.cycleType === 'BOOM' ? (Math.random() < 0.5 ? 2 : 3) : 1,
    yearsRemaining: template.cycleType === 'CRISIS' || template.cycleType === 'BOOM' ? (Math.random() < 0.5 ? 2 : 3) : 1,
    centralBank: {
      action: cbAction,
      rateChange: template.keyRateDelta,
      newKeyRate: 0.12 + template.keyRateDelta,
      statement: cbStatement,
      guidance: isHawkish ? 'HAWKISH' : isDovish ? 'DOVISH' : 'NEUTRAL',
      inflationTarget: 0.04,
      reasoning: isHawkish
        ? 'Перегрев спроса требует временного ужесточения условий кредитования.'
        : isDovish
        ? 'Снижение инфляционных ожиданий открыло пространство для стимулирования инвестиций.'
        : 'Текущая жесткость денежно-кредитной политики соответствует базовому сценарию.',
    },
    marketImpact: template.marketImpact,
  };
}
