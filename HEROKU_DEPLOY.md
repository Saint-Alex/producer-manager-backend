# Deploy no Heroku - Guia Completo

Este guia detalha como fazer o deploy da aplicação Producer Manager Backend no Heroku.

## Pré-requisitos

1. **Conta no Heroku**: Crie uma conta em [heroku.com](https://heroku.com)
2. **Heroku CLI**: Instale o [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)
3. **Git**: Certifique-se de que o projeto está em um repositório Git

## Passos para Deploy

### 1. Login no Heroku

```bash
heroku login
```

### 2. Criar a aplicação no Heroku

```bash
# Na pasta raiz do projeto backend
heroku create producer-manager-backend

# Ou com um nome específico
heroku create seu-nome-da-app
```

### 3. Adicionar o PostgreSQL

```bash
# Adiciona o PostgreSQL (Hobby Dev - gratuito)
heroku addons:create heroku-postgresql:hobby-dev

# Para verificar se foi criado
heroku addons
```

### 4. Configurar Variáveis de Ambiente

```bash
# Configurações obrigatórias
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET="seu-jwt-secret-super-seguro-de-pelo-menos-32-caracteres"

# CORS - substitua pela URL do seu frontend
heroku config:set CORS_ORIGINS="https://seu-frontend-app.herokuapp.com"

# Configurações opcionais (com valores padrão)
heroku config:set LOG_LEVEL=info
heroku config:set API_PREFIX=api
heroku config:set SWAGGER_PATH=api/docs

# Para verificar as variáveis
heroku config
```

**Importante**: O `DATABASE_URL` é configurado automaticamente pelo addon do PostgreSQL.

### 5. Deploy da aplicação

```bash
# Adicionar Heroku como remote (se ainda não foi feito)
heroku git:remote -a seu-nome-da-app

# Fazer o deploy
git push heroku main
```

### 6. Executar migrações

```bash
# As migrações são executadas automaticamente via Procfile (release phase)
# Mas você pode executar manualmente se necessário:
heroku run npm run migration:run
```

### 7. Verificar se está funcionando

```bash
# Ver logs
heroku logs --tail

# Abrir a aplicação
heroku open

# Verificar health check
curl https://seu-app.herokuapp.com/api/health
```

## URLs importantes após o deploy

- **API Base**: `https://seu-app.herokuapp.com/api`
- **Swagger/Docs**: `https://seu-app.herokuapp.com/api/docs`
- **Health Check**: `https://seu-app.herokuapp.com/api/health`
- **Metrics**: `https://seu-app.herokuapp.com/api/metrics`

## Configurações Opcionais

### Redis (para cache/sessões)

```bash
# Adicionar Redis (gratuito até 25MB)
heroku addons:create heroku-redis:hobby-dev
```

### Monitoramento

```bash
# Ver métricas da aplicação
heroku logs --tail

# Ver métricas do banco
heroku pg:info

# Conectar no banco (para debug)
heroku pg:psql
```

## Troubleshooting

### Erro de Build

```bash
# Ver logs detalhados do build
heroku logs --tail --dyno=build

# Limpar cache do build
heroku builds:cache:purge
```

### Erro de Database

```bash
# Verificar status do banco
heroku pg:info

# Ver conexões ativas
heroku pg:ps

# Reset do banco (CUIDADO! Apaga todos os dados)
heroku pg:reset DATABASE_URL --confirm seu-nome-da-app
```

### Erro de Variáveis de Ambiente

```bash
# Listar todas as variáveis
heroku config

# Remover uma variável
heroku config:unset VARIAVEL_NAME

# Ver logs filtrados
heroku logs --tail | grep ERROR
```

## Scripts de Deploy Automatizado

Você pode criar um script para automatizar o deploy:

```bash
#!/bin/bash
# deploy.sh

echo "🚀 Iniciando deploy no Heroku..."

# Build local (opcional)
npm run build

# Deploy
git push heroku main

# Verificar status
heroku ps

echo "✅ Deploy concluído!"
echo "🌐 URL: https://$(heroku info -s | grep web_url | cut -d= -f2)"
```

## Configuração de Domínio Customizado (Planos pagos)

```bash
# Adicionar domínio customizado
heroku domains:add api.seudominio.com

# Ver configurações de domínio
heroku domains
```

## Backup do Banco de Dados

```bash
# Criar backup
heroku pg:backups:capture

# Listar backups
heroku pg:backups

# Restaurar backup
heroku pg:backups:restore BACKUP_ID DATABASE_URL
```

## Variáveis de Ambiente Completas

Baseado no arquivo `.env.heroku`, configure estas variáveis no Heroku:

```bash
# Obrigatórias
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET="seu-jwt-secret-seguro"
heroku config:set CORS_ORIGINS="https://seu-frontend.herokuapp.com"

# Opcionais (valores padrão)
heroku config:set LOG_LEVEL=info
heroku config:set API_PREFIX=api
heroku config:set SWAGGER_PATH=api/docs
heroku config:set METRICS_ENABLED=true
heroku config:set PROMETHEUS_ENABLED=false
heroku config:set RATE_LIMIT_TTL=60
heroku config:set RATE_LIMIT_LIMIT=100
```

## Monitoramento e Logs

```bash
# Logs em tempo real
heroku logs --tail

# Logs de uma dyno específica
heroku logs --dyno web.1

# Métricas da aplicação
heroku ps:scale

# Status da aplicação
heroku ps:type
```
