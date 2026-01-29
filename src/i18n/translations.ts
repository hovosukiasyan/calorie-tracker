export type Lang = "en" | "ru";

export type I18nKey =
  | "app.name"
  | "lang.english"
  | "lang.russian"
  | "lang.label"
  | "nav.today"
  | "nav.history"
  | "nav.analytics"
  | "nav.settings"
  | "common.loading"
  | "common.close"
  | "common.cancel"
  | "common.save"
  | "common.delete"
  | "common.edit"
  | "common.addEntry"
  | "common.target"
  | "entry.error.invalid"
  | "entry.labels.label"
  | "entry.labels.calories"
  | "entry.labels.time"
  | "entry.placeholder.label"
  | "home.loading"
  | "onboarding.welcome"
  | "onboarding.title"
  | "onboarding.subtitle"
  | "onboarding.stepOf"
  | "onboarding.steps.basics"
  | "onboarding.steps.activity"
  | "onboarding.steps.goal"
  | "onboarding.error.invalidProfile"
  | "onboarding.labels.sex"
  | "onboarding.labels.age"
  | "onboarding.labels.heightCm"
  | "onboarding.labels.weightKg"
  | "onboarding.labels.activityLevel"
  | "onboarding.labels.goal"
  | "onboarding.labels.weeklyPace"
  | "onboarding.help.activityLevel"
  | "onboarding.help.weeklyPace"
  | "onboarding.sex.female"
  | "onboarding.sex.male"
  | "onboarding.activity.sedentary"
  | "onboarding.activity.light"
  | "onboarding.activity.moderate"
  | "onboarding.activity.active"
  | "onboarding.activity.veryActive"
  | "onboarding.goal.lose"
  | "onboarding.goal.maintain"
  | "onboarding.goal.gain"
  | "onboarding.pace.option"
  | "onboarding.pace.direction.gain"
  | "onboarding.pace.direction.lose"
  | "onboarding.pace.direction.maintain"
  | "onboarding.buttons.back"
  | "onboarding.buttons.continue"
  | "onboarding.buttons.saveProfile"
  | "today.title"
  | "today.loading"
  | "today.dailyTarget"
  | "today.consumed"
  | "today.remaining"
  | "today.surplus"
  | "today.deficit"
  | "today.vsTdee"
  | "today.macros.protein"
  | "today.macros.carbs"
  | "today.macros.fat"
  | "today.entries.title"
  | "today.entries.empty"
  | "today.entries.untitled"
  | "today.modal.addTitle"
  | "today.modal.editTitle"
  | "today.sidebar.note"
  | "history.title"
  | "history.loading"
  | "history.pastDays"
  | "history.entries.empty"
  | "history.entries.untitled"
  | "history.addForDay"
  | "history.modal.addTitle"
  | "history.modal.editTitle"
  | "analytics.title"
  | "analytics.loading"
  | "analytics.cards.avg30"
  | "analytics.cards.bestDay"
  | "analytics.cards.highestDay"
  | "analytics.cards.adherence"
  | "analytics.cards.adherenceHelp"
  | "analytics.sections.weeklyVsTarget"
  | "analytics.sections.last7Days"
  | "analytics.sections.rollingAvg"
  | "analytics.sections.last30Days"
  | "analytics.sections.deficitSurplus"
  | "analytics.sections.last14Days"
  | "analytics.chart.target"
  | "analytics.chart.delta"
  | "analytics.period.label"
  | "analytics.period.week"
  | "analytics.period.month"
  | "analytics.period.all"
  | "analytics.period.selectWeek"
  | "analytics.period.selectMonth"
  | "settings.title"
  | "settings.loading"
  | "settings.profile.title"
  | "settings.profile.subtitle"
  | "settings.data.title"
  | "settings.data.subtitle"
  | "settings.data.export"
  | "settings.data.import"
  | "settings.data.reset"
  | "settings.reset.title"
  | "settings.reset.body"
  | "settings.reset.confirm";

type Dict = Record<I18nKey, string>;

export const translations: Record<Lang, Dict> = {
  en: {
    "app.name": "Calorie Tracker",
    "lang.english": "English",
    "lang.russian": "Русский",
    "lang.label": "Language",
    "nav.today": "Today",
    "nav.history": "History",
    "nav.analytics": "Analytics",
    "nav.settings": "Settings",
    "common.loading": "Loading…",
    "common.close": "Close",
    "common.cancel": "Cancel",
    "common.save": "Save",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.addEntry": "Add entry",
    "common.target": "Target",
    "entry.error.invalid": "Please provide valid entry details.",
    "entry.labels.label": "Label",
    "entry.labels.calories": "Calories",
    "entry.labels.time": "Time",
    "entry.placeholder.label": "e.g. Greek yogurt",
    "home.loading": "Loading your calorie tracker…",
    "onboarding.welcome": "Welcome",
    "onboarding.title": "Let’s set up your calorie targets",
    "onboarding.subtitle":
      "This stays on your device and powers your daily targets, history, and analytics.",
    "onboarding.stepOf": "Step {{current}} of {{total}}",
    "onboarding.steps.basics": "Basics",
    "onboarding.steps.activity": "Activity",
    "onboarding.steps.goal": "Goal",
    "onboarding.error.invalidProfile": "Please double-check your inputs.",
    "onboarding.labels.sex": "Sex",
    "onboarding.labels.age": "Age",
    "onboarding.labels.heightCm": "Height (cm)",
    "onboarding.labels.weightKg": "Weight (kg)",
    "onboarding.labels.activityLevel": "Activity level",
    "onboarding.labels.goal": "Goal",
    "onboarding.labels.weeklyPace": "Weekly pace",
    "onboarding.help.activityLevel":
      "This helps estimate how many calories you burn on an average day.",
    "onboarding.help.weeklyPace":
      "We’ll translate this into a daily calorie adjustment.",
    "onboarding.sex.female": "Female",
    "onboarding.sex.male": "Male",
    "onboarding.activity.sedentary": "Sedentary",
    "onboarding.activity.light": "Light",
    "onboarding.activity.moderate": "Moderate",
    "onboarding.activity.active": "Active",
    "onboarding.activity.veryActive": "Very Active",
    "onboarding.goal.lose": "Lose weight",
    "onboarding.goal.maintain": "Maintain",
    "onboarding.goal.gain": "Gain weight",
    "onboarding.pace.option": "{{direction}} {{pace}} kg/week",
    "onboarding.pace.direction.gain": "Gain",
    "onboarding.pace.direction.lose": "Lose",
    "onboarding.pace.direction.maintain": "Maintain",
    "onboarding.buttons.back": "Back",
    "onboarding.buttons.continue": "Continue",
    "onboarding.buttons.saveProfile": "Save Profile",
    "today.title": "Today",
    "today.loading": "Loading profile…",
    "today.dailyTarget": "Daily target",
    "today.consumed": "Consumed",
    "today.remaining": "Remaining",
    "today.surplus": "Surplus",
    "today.deficit": "Deficit",
    "today.vsTdee": "{{amount}} kcal vs TDEE",
    "today.macros.protein": "Protein",
    "today.macros.carbs": "Carbs",
    "today.macros.fat": "Fat",
    "today.entries.title": "Today’s entries",
    "today.entries.empty": "No entries yet. Add your first meal or snack to get started.",
    "today.entries.untitled": "Untitled entry",
    "today.modal.addTitle": "Add entry",
    "today.modal.editTitle": "Edit entry",
    "today.sidebar.note":
      "Targets are based on your onboarding profile. Update them any time in Settings.",
    "history.title": "History",
    "history.loading": "Loading history…",
    "history.pastDays": "Past {{days}} days",
    "history.entries.empty": "No entries logged for this day.",
    "history.entries.untitled": "Untitled entry",
    "history.addForDay": "Add entry for {{day}}",
    "history.modal.addTitle": "Add entry",
    "history.modal.editTitle": "Edit entry",
    "analytics.title": "Analytics",
    "analytics.loading": "Loading analytics…",
    "analytics.cards.avg30": "30-day average",
    "analytics.cards.bestDay": "Best day",
    "analytics.cards.highestDay": "Highest day",
    "analytics.cards.adherence": "Adherence",
    "analytics.cards.adherenceHelp": "Days within +/- 100 kcal",
    "analytics.sections.weeklyVsTarget": "Weekly intake vs target",
    "analytics.sections.last7Days": "Last 7 days",
    "analytics.sections.rollingAvg": "Rolling 7-day average",
    "analytics.sections.last30Days": "Last 30 days",
    "analytics.sections.deficitSurplus": "Deficit / surplus",
    "analytics.sections.last14Days": "Last 14 days vs target",
    "analytics.chart.target": "Target",
    "analytics.chart.delta": "Delta",
    "analytics.period.label": "Period",
    "analytics.period.week": "Week",
    "analytics.period.month": "Month",
    "analytics.period.all": "All time",
    "analytics.period.selectWeek": "Select week",
    "analytics.period.selectMonth": "Select month",
    "settings.title": "Settings",
    "settings.loading": "Loading settings…",
    "settings.profile.title": "Profile",
    "settings.profile.subtitle":
      "Update your profile to recalculate BMR, TDEE, and daily targets.",
    "settings.data.title": "Data management",
    "settings.data.subtitle":
      "Export or restore your local data. Data is stored only in this browser.",
    "settings.data.export": "Export JSON",
    "settings.data.import": "Import JSON",
    "settings.data.reset": "Reset all data",
    "settings.reset.title": "Reset all data",
    "settings.reset.body":
      "This will permanently delete your profile and all entries from this device. This action cannot be undone.",
    "settings.reset.confirm": "Reset",
  },
  ru: {
    "app.name": "Счётчик калорий",
    "lang.english": "English",
    "lang.russian": "Русский",
    "lang.label": "Язык",
    "nav.today": "Сегодня",
    "nav.history": "История",
    "nav.analytics": "Аналитика",
    "nav.settings": "Настройки",
    "common.loading": "Загрузка…",
    "common.close": "Закрыть",
    "common.cancel": "Отмена",
    "common.save": "Сохранить",
    "common.delete": "Удалить",
    "common.edit": "Изменить",
    "common.addEntry": "Добавить запись",
    "common.target": "Цель",
    "entry.error.invalid": "Проверьте данные записи.",
    "entry.labels.label": "Название",
    "entry.labels.calories": "Калории",
    "entry.labels.time": "Время",
    "entry.placeholder.label": "например, греческий йогурт",
    "home.loading": "Загружаем ваш дневник калорий…",
    "onboarding.welcome": "Добро пожаловать",
    "onboarding.title": "Давайте настроим ваши цели по калориям",
    "onboarding.subtitle":
      "Данные сохраняются только на вашем устройстве и используются для целей, истории и аналитики.",
    "onboarding.stepOf": "Шаг {{current}} из {{total}}",
    "onboarding.steps.basics": "Основное",
    "onboarding.steps.activity": "Активность",
    "onboarding.steps.goal": "Цель",
    "onboarding.error.invalidProfile": "Проверьте введённые данные.",
    "onboarding.labels.sex": "Пол",
    "onboarding.labels.age": "Возраст",
    "onboarding.labels.heightCm": "Рост (см)",
    "onboarding.labels.weightKg": "Вес (кг)",
    "onboarding.labels.activityLevel": "Уровень активности",
    "onboarding.labels.goal": "Цель",
    "onboarding.labels.weeklyPace": "Темп в неделю",
    "onboarding.help.activityLevel":
      "Это помогает оценить, сколько калорий вы тратите в среднем за день.",
    "onboarding.help.weeklyPace":
      "Мы переведём это в ежедневную корректировку калорий.",
    "onboarding.sex.female": "Женский",
    "onboarding.sex.male": "Мужской",
    "onboarding.activity.sedentary": "Сидячий",
    "onboarding.activity.light": "Низкий",
    "onboarding.activity.moderate": "Средний",
    "onboarding.activity.active": "Высокий",
    "onboarding.activity.veryActive": "Очень высокий",
    "onboarding.goal.lose": "Похудение",
    "onboarding.goal.maintain": "Поддержание",
    "onboarding.goal.gain": "Набор веса",
    "onboarding.pace.option": "{{direction}} {{pace}} кг/нед",
    "onboarding.pace.direction.gain": "Набор",
    "onboarding.pace.direction.lose": "Снижение",
    "onboarding.pace.direction.maintain": "Поддержание",
    "onboarding.buttons.back": "Назад",
    "onboarding.buttons.continue": "Далее",
    "onboarding.buttons.saveProfile": "Сохранить профиль",
    "today.title": "Сегодня",
    "today.loading": "Загрузка профиля…",
    "today.dailyTarget": "Дневная цель",
    "today.consumed": "Съедено",
    "today.remaining": "Осталось",
    "today.surplus": "Профицит",
    "today.deficit": "Дефицит",
    "today.vsTdee": "{{amount}} ккал относительно TDEE",
    "today.macros.protein": "Белки",
    "today.macros.carbs": "Углеводы",
    "today.macros.fat": "Жиры",
    "today.entries.title": "Записи за сегодня",
    "today.entries.empty":
      "Пока нет записей. Добавьте первый приём пищи или перекус.",
    "today.entries.untitled": "Без названия",
    "today.modal.addTitle": "Добавить запись",
    "today.modal.editTitle": "Изменить запись",
    "today.sidebar.note":
      "Цели рассчитаны по анкете. Их можно изменить в настройках.",
    "history.title": "История",
    "history.loading": "Загрузка истории…",
    "history.pastDays": "Последние {{days}} дней",
    "history.entries.empty": "За этот день записей нет.",
    "history.entries.untitled": "Без названия",
    "history.addForDay": "Добавить запись на {{day}}",
    "history.modal.addTitle": "Добавить запись",
    "history.modal.editTitle": "Изменить запись",
    "analytics.title": "Аналитика",
    "analytics.loading": "Загрузка аналитики…",
    "analytics.cards.avg30": "Среднее за 30 дней",
    "analytics.cards.bestDay": "Лучший день",
    "analytics.cards.highestDay": "Максимум",
    "analytics.cards.adherence": "Соблюдение",
    "analytics.cards.adherenceHelp": "Дни в пределах ±100 ккал",
    "analytics.sections.weeklyVsTarget": "Неделя: потребление и цель",
    "analytics.sections.last7Days": "Последние 7 дней",
    "analytics.sections.rollingAvg": "Скользящее среднее (7 дней)",
    "analytics.sections.last30Days": "Последние 30 дней",
    "analytics.sections.deficitSurplus": "Дефицит / профицит",
    "analytics.sections.last14Days": "Последние 14 дней относительно цели",
    "analytics.chart.target": "Цель",
    "analytics.chart.delta": "Разница",
    "analytics.period.label": "Период",
    "analytics.period.week": "Неделя",
    "analytics.period.month": "Месяц",
    "analytics.period.all": "За всё время",
    "analytics.period.selectWeek": "Выберите неделю",
    "analytics.period.selectMonth": "Выберите месяц",
    "settings.title": "Настройки",
    "settings.loading": "Загрузка настроек…",
    "settings.profile.title": "Профиль",
    "settings.profile.subtitle":
      "Обновите профиль, чтобы пересчитать BMR, TDEE и дневную цель.",
    "settings.data.title": "Данные",
    "settings.data.subtitle":
      "Экспортируйте или восстановите локальные данные. Они хранятся только в этом браузере.",
    "settings.data.export": "Экспорт JSON",
    "settings.data.import": "Импорт JSON",
    "settings.data.reset": "Сбросить данные",
    "settings.reset.title": "Сбросить данные",
    "settings.reset.body":
      "Это навсегда удалит профиль и все записи с этого устройства. Действие нельзя отменить.",
    "settings.reset.confirm": "Сбросить",
  },
};

