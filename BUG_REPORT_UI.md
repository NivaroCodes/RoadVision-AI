# Bug Report: DateRangeFilter UI & React Infinite Loop

**Assignee:** Артур (@Qwerty)
**Branch:** `feature/ui-ux-refinement`
**Status:** ❌ NOT READY FOR MERGE

Привет, Артур!
Модальные окна `ReportExportDialog` и `DefectEditDialog` выглядят отлично (непрозрачный матово-черный фон применен корректно). Однако во время ревью был найден критический баг в Date Picker, который блокирует merge.

## 🐛 Описание проблемы
Сломана вёрстка календаря, и компонент вызывает бесконечный цикл ререндеров в React.

* **Где:** Dashboard -> Date Range Picker (`DateRangeFilter.tsx`)
* **Шаги для воспроизведения:**
  1. Открыть Dashboard.
  2. Кликнуть на поле выбора дат для открытия Popover'а.
  3. Посмотреть на календарь и открыть консоль разработчика (F12).

### 🔴 Ожидаемый результат:
Календарь отображается ровной сеткой. Консоль чистая.

### ❌ Фактический результат:
1. **Вёрстка сломана:** Дни недели слиплись в одну строку (`пнвтсрчтптсбвс`), числа накладываются друг на друга сплошным текстом.
2. **Infinite Loop:** В консоли постоянно сыпется ошибка React: 
   `Maximum update depth exceeded. This can happen when a component calls setState inside useEffect, but useEffect either doesn't have a dependency array, or one of the dependencies changes on every render.`

**Severity:** **High (Critical)**

---

## 🛠 Что нужно сделать:
Пожалуйста, исправьте этот баг в текущей ветке `feature/ui-ux-refinement`:
1. Устраните причину infinite loop в `useEffect` компонента `DateRangeFilter.tsx` (проверьте зависимости).
2. Поправьте CSS/Tailwind классы календаря внутри Popover'а, чтобы дни недели и числа располагались корректной сеткой без наложений.
3. Убедитесь, что остальные компоненты не пострадали.

После исправления сделайте commit и push, чтобы мы могли провести повторное тестирование. Этот файл (`BUG_REPORT_UI.md`) можно будет удалить.
