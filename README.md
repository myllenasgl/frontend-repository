# Professor Allocation — Front-end

Trabalho da disciplina de Front-end: aplicação web com landing page e telas de CRUD para o sistema de alocação de professores, consumindo a API REST do projeto [professor-allocation](https://github.com/myllenasgl/backend-project-) (Spring Boot).

## Stack

- [Next.js](https://nextjs.org/) 16 (App Router) + TypeScript
- [Material UI (MUI)](https://mui.com/) v7 — componentes de interface
- Consumo direto da API via `fetch` (sem proxy/API routes do Next)

## Estrutura

```
app/
├── page.tsx              # Landing page (introdução ao projeto)
├── dashboard/            # Estatísticas gerais (GET /reports/dashboard)
├── departments/          # CRUD de departamentos
├── courses/              # CRUD de cursos
├── professors/           # CRUD de professores (+ exportação de agenda CSV/iCalendar)
└── allocations/          # CRUD de alocações (com detecção de conflito de horário)

components/
├── ThemeRegistry.tsx     # Integração do MUI com o App Router (SSR/cache do Emotion)
├── Navbar.tsx            # Navegação (com menu responsivo em telas pequenas)
├── ErrorAlert.tsx        # Exibe os erros padronizados vindos da API (ApiError)
└── *Form.tsx             # Formulários de criação/edição de cada recurso

lib/
├── api.ts                # Cliente HTTP (fetch) com tratamento de erro tipado
├── types.ts              # Tipos TypeScript espelhando os DTOs do back-end
└── dayOfWeek.ts           # Helpers de dia da semana / formatação de hora
```

## Como rodar

1. Backend rodando em `http://localhost:8080` (projeto `professor-allocation`, `mvn spring-boot:run`).
2. Instalar dependências:
   ```bash
   npm install
   ```
3. Configurar a URL da API (`.env.local`, já vem com o padrão certo):
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8080
   ```
4. Rodar em desenvolvimento:
   ```bash
   npm run dev
   ```
5. Acessar `http://localhost:3000`.

## Funcionalidades

- **Landing page** com introdução ao projeto e atalhos para as principais telas.
- **CRUD completo** de Departamentos, Cursos, Professores e Alocações (criar, listar, editar, excluir).
- **Busca e filtro** de professores por nome e por departamento.
- **Exportação de agenda** do professor em CSV e iCalendar (`.ics`), consumindo os endpoints já existentes no back-end.
- **Dashboard** com totais do sistema e carga horária semanal por professor.
- **Tratamento de erros** consistente: os erros de validação (400), recurso não encontrado (404) e conflito de horário (409) retornados pela API são exibidos de forma amigável, reaproveitando o formato padronizado (`ApiError`) implementado no back-end.
