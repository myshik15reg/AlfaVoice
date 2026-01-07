# Context Handoff Protocol

> **Цель:** Обеспечить полную передачу контекста при делегировании задач между агентами, минимизируя потерю информации и галлюцинации.

## Проблема
При переключении между агентами (режимами) через `new_task` часто теряется:
1.  Глобальный контекст (корневая директория, цель проекта).
2.  Результаты предыдущих шагов.
3.  Ограничения и специфические требования.
4.  Связь с текущим активным протоколом.

## Стандарт делегирования
При использовании `new_task`, сообщение (`message`) должно содержать структурированный блок **CONTEXT HANDOFF**.

### JSON-схема (для понимания структуры)
```json
{
  "project_context": {
    "workspace_root": "c:/Users/Евгений/Documents/WorkFlowAI",
    "active_protocol": ".protocols/YYYY-MM-DD-feature-name"
  },
  "task_context": {
    "original_request": "Текст исходного запроса пользователя",
    "current_phase": "Implementation | Testing | Review",
    "previous_outputs": ["Список файлов или выводов предыдущих агентов"]
  },
  "constraints": [
    "Не использовать внешние библиотеки без утверждения",
    "Coverage >= 100%"
  ],
  "mcp_requirements": [
    "context7global: resolve-library-id",
    "sequentialthinkingglobal"
  ]
}
```

### Текстовый шаблон (для использования в `new_task`)

```markdown
ЗАДАЧА: [Краткое описание задачи для субагента]

=== CONTEXT HANDOFF ===
ROOT: c:/Users/Евгений/Documents/WorkFlowAI
PROTOCOL: .protocols/YYYY-MM-DD-feature-name/plan.md
PHASE: [Implementation / Testing / Analysis]

INPUTS:
- [Ссылка на файл с требованиями/дизайном]
- [Ссылка на результаты предыдущего шага]

CONSTRAINTS:
1. [Ограничение 1]
2. [Ограничение 2]

MCP INSTRUCTIONS:
1. [Инструкция по MCP 1]
2. [Инструкция по MCP 2]
=======================

РЕЗУЛЬТАТ: [Ожидаемый формат результата]
```

## Примеры использования

### 1. Architect -> Code (Implementation)

```xml
<new_task>
<mode>code</mode>
<message>
ЗАДАЧА: Реализовать модуль аутентификации JWT.

=== CONTEXT HANDOFF ===
ROOT: c:/Users/Евгений/Documents/WorkFlowAI
PROTOCOL: .protocols/2024-01-20-auth-system/plan.md
PHASE: Implementation

INPUTS:
- .protocols/2024-01-20-auth-system/brief.md (Requirements)
- .kilocode/patterns/security/security.md (Security Standards)

CONSTRAINTS:
1. Использовать только стандартные библиотеки Python где возможно.
2. Следовать TDD.
3. Строгая типизация.

MCP INSTRUCTIONS:
1. context7global: resolve-library-id("fastapi-jwt") для поиска best practices.
=======================

РЕЗУЛЬТАТ: Реализованный код в `src/auth`, проходящий тесты.
</message>
</new_task>
```

### 2. Code -> Unit Tester (Testing)

```xml
<new_task>
<mode>unit-tester</mode>
<message>
ЗАДАЧА: Написать unit-тесты для сервиса заказов.

=== CONTEXT HANDOFF ===
ROOT: c:/Users/Евгений/Documents/WorkFlowAI
PROTOCOL: .protocols/2024-01-21-orders/plan.md
PHASE: Testing

INPUTS:
- src/orders/service.py (Target Code)
- .kilocode/rules/testing-rules.md (Standards)

CONSTRAINTS:
1. Coverage 100% (Lines, Branches).
2. Использовать `pytest` и `pytest-mock`.
3. Не мокать бизнес-логику, только внешние зависимости.
=======================

РЕЗУЛЬТАТ: Файл тестов `tests/unit/test_orders.py` и отчет о покрытии.
</message>
</new_task>
```

### 3. Orchestrator -> Decomposer (Analysis)

```xml
<new_task>
<mode>decomposer</mode>
<message>
ЗАДАЧА: Декомпозировать эпик "Интеграция с платежной системой Stripe".

=== CONTEXT HANDOFF ===
ROOT: c:/Users/Евгений/Documents/WorkFlowAI
PROTOCOL: N/A (New Epic)
PHASE: Analysis

INPUTS:
- User Request: "Хочу принимать платежи картами через Stripe"
- .kilocode/memory-bank/tech.md (Current Stack)

CONSTRAINTS:
1. Учесть PCI DSS требования (через MCP context7).
2. Архитектура должна быть событийно-ориентированной.

MCP INSTRUCTIONS:
1. sequentialthinkingglobal: Разбить задачу на атомарные шаги.
2. context7global: Найти актуальные Stripe API flow.
=======================

РЕЗУЛЬТАТ: План реализации в формате Markdown списка.
</message>
</new_task>
```

## Checklist перед делегированием

1. [ ] Указан ли **ROOT** рабочей директории?
2. [ ] Указан ли активный **PROTOCOL** (если есть)?
3. [ ] Переданы ли все необходимые **INPUTS** (файлы, требования)?
4. [ ] Определены ли **CONSTRAINTS** (ограничения)?
5. [ ] Ясны ли инструкции по **MCP**?