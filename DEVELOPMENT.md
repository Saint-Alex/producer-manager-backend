# 🚀 Guia de Desenvolvimento - Producer Manager Backend

## 📋 Configuração do Ambiente de Desenvolvimento

### Pré-requisitos

- **Node.js** 20.x ou superior
- **npm** 10.x ou superior  
- **Docker** e **Docker Compose**
- **Git** com configuração de usuário

### Configuração Inicial

1. **Clone e configure o projeto:**
```bash
git clone <repository-url>
cd producer-manager-backend
npm run dev:setup
```

2. **Configure as variáveis de ambiente:**
```bash
cp .env.example .env
# Edite o arquivo .env conforme necessário
```

## 🛠️ Scripts de Desenvolvimento

### Scripts Principais
```bash
# Desenvolvimento
npm run start:dev          # Inicia em modo desenvolvimento (watch)
npm run start:debug        # Inicia com debugger
npm run build              # Build de produção
npm run start:prod         # Inicia build de produção

# Testes
npm run test               # Testes unitários
npm run test:watch         # Testes em modo watch
npm run test:cov           # Testes com coverage
npm run test:e2e           # Testes end-to-end

# Qualidade de código
npm run lint               # ESLint fix
npm run lint:check         # ESLint check apenas
npm run format             # Prettier fix
npm run format:check       # Prettier check apenas

# Docker
npm run docker:up          # Sobe todos os serviços
npm run docker:down        # Para todos os serviços
npm run docker:db          # Sobe apenas BD e Redis
npm run docker:logs        # Visualiza logs
npm run docker:restart     # Reinicia serviços

# Utilitários
npm run dev:setup          # Setup inicial completo
npm run dev:reset          # Reset completo do ambiente
```

### Scripts de Banco de Dados
```bash
# Migrações
npm run migration:create <Nome>     # Cria nova migração
npm run migration:generate <Nome>   # Gera migração automática
npm run migration:run              # Executa migrações pendentes
npm run migration:revert           # Reverte última migração

# Seeds
npm run seed                       # Executa seeds
npm run seed:clear                 # Limpa dados
npm run seed:reset                 # Reset + seed
```

## 🏗️ Arquitetura do Projeto

### Estrutura de Pastas
```
src/
├── auth/                    # Autenticação e autorização
├── common/                  # Código compartilhado
│   ├── decorators/         # Decorators customizados
│   ├── filters/            # Exception filters
│   ├── guards/             # Route guards
│   ├── interceptors/       # Interceptors
│   ├── middleware/         # Middlewares
│   └── utils/              # Utilitários
├── config/                  # Configurações
├── database/               # TypeORM setup
│   ├── entities/           # Entidades
│   ├── migrations/         # Migrações
│   └── seeds/              # Seeds
├── modules/                # Módulos da aplicação
│   ├── audit/              # Auditoria
│   ├── health/             # Health checks
│   ├── metrics/            # Métricas
│   ├── producer/           # Produtores
│   └── propriedade-rural/  # Propriedades rurais
└── shared/                 # DTOs e tipos compartilhados
```

### Padrões de Código

#### Naming Conventions
- **Arquivos**: kebab-case (`producer.service.ts`)
- **Classes**: PascalCase (`ProducerService`)
- **Métodos/Variáveis**: camelCase (`findProducer`)
- **Constantes**: UPPER_SNAKE_CASE (`MAX_FILE_SIZE`)

#### Estrutura de Módulos
```typescript
// producer.module.ts
@Module({
  imports: [TypeOrmModule.forFeature([Producer])],
  controllers: [ProducerController],
  providers: [ProducerService, ProducerRepository],
  exports: [ProducerService],
})
export class ProducerModule {}
```

#### DTOs e Validação
```typescript
// create-producer.dto.ts
export class CreateProducerDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  readonly nome: string;

  @IsString()
  @IsOptional()
  @Length(11, 14)
  readonly cpfCnpj?: string;
}
```

## 🧪 Estratégia de Testes

### Tipos de Testes

1. **Unitários** (`*.spec.ts`)
   - Testam unidades isoladas
   - Mocks de dependências
   - Cobertura > 80%

2. **Integração** (`*.integration.spec.ts`)
   - Testam módulos integrados
   - BD em memória
   - Cenários reais

3. **E2E** (`test/*.e2e-spec.ts`)
   - Testam fluxos completos
   - BD de teste
   - Simulam usuário real

### Exemplo de Teste Unitário
```typescript
describe('ProducerService', () => {
  let service: ProducerService;
  let repository: Repository<Producer>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProducerService,
        {
          provide: getRepositoryToken(Producer),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<ProducerService>(ProducerService);
    repository = module.get<Repository<Producer>>(getRepositoryToken(Producer));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
```

## 📊 Monitoramento e Observabilidade

### Métricas Disponíveis
- **HTTP**: Requests, responses, latência
- **Database**: Conexões, queries, performance
- **Business**: Operações por módulo
- **System**: CPU, memória, disco

### Logs Estruturados
```typescript
// Uso do logger
this.logger.log('Produtor criado', {
  id: producer.id,
  cpfCnpj: producer.cpfCnpj,
  correlationId: context.correlationId,
});
```

### Health Checks
- `GET /api/health` - Status geral
- `GET /api/health/database` - Status do BD
- `GET /api/health/memory` - Status da memória

## 🔧 Ferramentas de Desenvolvimento

### VS Code Extensions Recomendadas
```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "ms-vscode-remote.remote-containers"
  ]
}
```

### Configuração do Debugger
```json
// .vscode/launch.json
{
  "type": "node",
  "request": "launch",
  "name": "Debug NestJS",
  "program": "${workspaceFolder}/src/main.ts",
  "runtimeArgs": ["-r", "ts-node/register"],
  "envFile": "${workspaceFolder}/.env"
}
```

## 🐳 Docker para Desenvolvimento

### Serviços Disponíveis
- **app**: Aplicação NestJS (porta 3001)
- **postgres**: PostgreSQL (porta 5432)
- **redis**: Redis (porta 6379)
- **pgadmin**: PgAdmin (porta 5050)
- **prometheus**: Prometheus (porta 9090)
- **grafana**: Grafana (porta 3000)

### Comandos Úteis
```bash
# Logs específicos
docker-compose logs -f app
docker-compose logs -f postgres

# Executar comandos no container
docker-compose exec app npm run test
docker-compose exec postgres psql -U brainag_user brainag_db

# Reset completo
docker-compose down -v
docker-compose up -d
```

## 🔄 Workflow Git

### Branches
- `main`: Produção
- `develop`: Desenvolvimento
- `feature/*`: Features
- `hotfix/*`: Correções urgentes

### Commits
Seguimos [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: adiciona validação de CPF/CNPJ
fix: corrige cálculo de área total
docs: atualiza README com novos scripts
test: adiciona testes para ProducerService
```

### Hooks Automáticos
- **pre-commit**: Lint + format + testes
- **commit-msg**: Validação de mensagem
- **pre-push**: Testes completos

## 🚀 Deploy

### Ambientes
- **Development**: Auto-deploy na branch `develop`
- **Staging**: Auto-deploy na branch `release/*`
- **Production**: Manual deploy na branch `main`

### Variáveis de Ambiente
```bash
# Produção (exemplo)
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://user:pass@host:5432/db
REDIS_URL=redis://host:6379
JWT_SECRET=super-secret-key
```

## 📝 Convenções da API

### Endpoints
```
GET    /api/producers          # Lista produtores
POST   /api/producers          # Cria produtor
GET    /api/producers/:id      # Busca produtor
PUT    /api/producers/:id      # Atualiza produtor
DELETE /api/producers/:id      # Remove produtor
```

### Response Format
```json
{
  "data": { ... },
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10
  }
}
```

### Error Format
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dados inválidos",
    "details": [
      {
        "field": "cpfCnpj",
        "message": "CPF/CNPJ inválido"
      }
    ]
  }
}
```

## 🆘 Troubleshooting

### Problemas Comuns

1. **Erro de conexão com BD**
   ```bash
   npm run docker:db
   # Aguardar 10 segundos
   npm run migration:run
   ```

2. **Testes falhando**
   ```bash
   npm run test:clear-cache
   npm run test
   ```

3. **Lint/Prettier conflitos**
   ```bash
   npm run format
   npm run lint
   ```

4. **Docker sem espaço**
   ```bash
   docker system prune -a
   ```

## 📚 Recursos Adicionais

- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [Jest Testing Framework](https://jestjs.io/)
- [Docker Compose Reference](https://docs.docker.com/compose/)

---

**Happy Coding! 🎉**