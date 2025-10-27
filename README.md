# Producer Manager Backend

API RESTful em NestJS para gestão de produtores rurais com observabilidade completa.

## Funcionalidades

- 👨‍🌾 **Gestão de Produtores**: CRUD completo com validações CPF/CNPJ
- 🏠 **Propriedades Rurais**: Controle de áreas e localizações
- 🌱 **Culturas e Safras**: Gestão de tipos de plantio e períodos
- 📊 **Dashboard**: Estatísticas e métricas do sistema
- 🔍 **Observabilidade**: Logging, métricas e audit trail
- 🏥 **Health Checks**: Monitoramento pronto para produção

## Tecnologias

- **NestJS 10** + **TypeScript** - Framework robusto
- **PostgreSQL** + **TypeORM** - Banco de dados e ORM
- **Winston** - Logging estruturado
- **Prometheus** - Métricas para monitoramento
- **Swagger** - Documentação automática da API

## Como Executar

### Pré-requisitos
- Node.js 18+
- Docker e Docker Compose

### Instalação e Execução
```bash
# 1. Instalar dependências
npm install

# 2. Configurar environment
cp .env.example .env

# 3. Iniciar infraestrutura
npm run docker:db

# 4. Configurar banco de dados
npm run migration:run
npm run seed

# 5. Iniciar em desenvolvimento
npm run start:dev

# 6. Acessar a API
http://localhost:3001 (API)
http://localhost:3001/api/docs (Swagger)
```

## API Endpoints

| Recurso | Endpoint | Descrição |
|---------|----------|-----------|
| **Produtores** | `/produtores` | CRUD completo de produtores rurais |
| **Propriedades** | `/propriedades` | Gestão de propriedades rurais |
| **Culturas** | `/culturas` | Tipos de cultivo disponíveis |
| **Safras** | `/safras` | Períodos de produção |
| **Cultivos** | `/cultivos` | Relação cultura x propriedade x safra |
| **Dashboard** | `/dashboard` | Estatísticas e métricas do sistema |
| **Health** | `/health/*` | Status da aplicação |
| **Metrics** | `/metrics/*` | Métricas para monitoramento |

> **📖 Documentação Completa**: http://localhost:3001/api/docs (Swagger UI)

## Scripts Principais

```bash
npm run start:dev       # Desenvolvimento com hot reload
npm run build          # Build de produção
npm test              # Executar testes
npm run seed          # Dados iniciais
npm run lint          # Verificar código
```

## Observabilidade

- **Logging**: Winston com correlation IDs
- **Métricas**: Formato Prometheus (`/metrics`)
- **Health Checks**: Ready/Live probes (`/health`)
- **Audit Trail**: Rastreamento automático de mudanças

---

## Arquitetura e Padrões

### **Estrutura do Projeto**

```
src/
├── app.*                # Application entry point e configuração
├── main.ts              # Bootstrap da aplicação
├── modules/             # Módulos de domínio
│   ├── produtor/        # Gestão de produtores rurais
│   ├── propriedade/     # Propriedades rurais
│   ├── cultura/         # Tipos de culturas
│   ├── safra/           # Períodos de produção
│   ├── cultivo/         # Relação cultura x propriedade
│   └── dashboard/       # Dashboard funcional
├── database/
│   ├── entities/        # Entidades TypeORM
│   ├── migrations/      # Database migrations
│   ├── seeds/           # Dados iniciais
│   └── data-source.ts   # Configuração do banco
└── shared/              # Componentes compartilhados
    ├── audit/           # Sistema de auditoria
    ├── config/          # Configurações da aplicação
    ├── filters/         # Global exception filters
    ├── health/          # Health checks
    ├── interceptors/    # Logging interceptors
    ├── logging/         # Winston configuration
    ├── metrics/         # Prometheus metrics
    ├── middleware/      # Custom middleware
    └── validators/      # Validadores customizados
```

### **Padrões Implementados**

- **Modular Architecture**: Cada domínio em módulo separado (`/modules`)
- **Domain-Driven Design**: Separação clara por contextos de negócio
- **Repository Pattern**: TypeORM como abstração de dados
- **DTO Pattern**: Validação e transformação em cada módulo
- **Service Layer**: Business logic isolada em services
- **Decorator Pattern**: Auditoria e logging automáticos
- **Observer Pattern**: Sistema de eventos e logs
- **Module Pattern**: Encapsulamento e injeção de dependências

### **Princípios SOLID**

- **Single Responsibility**: Cada classe tem uma responsabilidade específica
- **Open/Closed**: Extensível sem modificar código existente
- **Liskov Substitution**: Interfaces bem definidas
- **Interface Segregation**: Interfaces específicas por contexto
- **Dependency Inversion**: Injeção de dependências com NestJS

---

## Scripts Úteis

```bash
# Desenvolvimento
npm run start:dev          # Hot reload
npm run build              # Build produção

# Database
npm run typeorm:migration:run    # Executar migrations
npm run seed                     # Dados iniciais
npm run seed:reset              # Reset completo

# Testes
npm test                   # Todos os testes
npm run test:cov           # Com coverage
npm run test:e2e           # E2E tests

# Qualidade
npm run lint               # ESLint
npm run format             # Prettier
```

---

## Docker & Produção

### **Configuração Docker**

```yaml
# docker-compose.yml
services:
  api:
    build: .
    ports: ["3000:3000"]
    depends_on: [postgres]
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]

  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: producer_manager
```

### **Deploy Kubernetes**

```yaml
# Readiness/Liveness probes prontos
readinessProbe:
  httpGet:
    path: /health/ready
    port: 3000
livenessProbe:
  httpGet:
    path: /health/live
    port: 3000
```

---

## Troubleshooting

| Problema | Solução |
|----------|---------|
| Erro de conexão DB | `npm run docker:db` (apenas PostgreSQL + Redis) |
| Docker build falha | Use `npm run docker:db` em vez de `docker-compose up -d` |
| Testes falhando | `npm install sqlite3` e `npm run seed` |
| API não inicia | Verificar variáveis do `.env` |
| Dados ausentes | Executar `npm run seed` |
| Husky erro no Docker | Normal - use `npm run docker:db` para desenvolvimento |

---

## Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

**Padrões**: ESLint + Prettier + Conventional Commits + Testes obrigatórios


