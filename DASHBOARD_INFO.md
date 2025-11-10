# Dashboard Rec-n-Play

## Visão Geral

Dashboard desenvolvido para visualizar métricas do evento Rec-n-Play, com dados provenientes da API do Banco do Brasil.

## Funcionalidades Implementadas

### 1. Cards de Métricas

O dashboard apresenta três cards principais com as seguintes métricas:

- **Total de Usuários com Ativações**: Conta o número único de usuários que fizeram check-in em pelo menos uma ativação
- **Total de Check-ins**: Soma total de todos os check-ins realizados no evento
- **Total de Resgates**: Número total de brindes resgatados pelos participantes

### 2. Gráfico de Barras Horizontais

- Exibe o **Top 10** de ativações com mais check-ins
- Formato: Barras horizontais para melhor visualização de nomes longos
- Mostra o nome da ativação e a quantidade de check-ins recebidos

## Estrutura de Dados

O dashboard consome dados da API e processa as seguintes tabelas:

### Tabelas Principais:
- `up_users`: Usuários do sistema
- `checkins`: Registros de check-in nas ativações
- `resgates`: Registros de resgates de brindes
- `ativacoes`: Informações das ativações disponíveis no evento

### Tabelas de Relacionamento:
- `checkins_users_permissions_user_lnk`: Relaciona check-ins com usuários
- `checkins_ativacao_lnk`: Relaciona check-ins com ativações

## Tecnologias Utilizadas

- **React**: Framework JavaScript para construção da interface
- **Bootstrap**: Framework CSS para estilização responsiva
- **Recharts**: Biblioteca para criação de gráficos interativos
- **Fetch API**: Para consumo da API REST

## Como Executar

1. Instalar dependências:
```bash
npm install
```

2. Iniciar o servidor de desenvolvimento:
```bash
npm start
```

3. Acessar no navegador:
```
http://localhost:3000
```

## Estrutura de Arquivos

```
src/
├── service/
│   └── ApiBase.js          # Serviço de conexão com a API
├── pages/
│   └── dashboard.jsx       # Componente principal do dashboard
├── App.js                  # Componente raiz da aplicação
└── index.js                # Ponto de entrada da aplicação
```

## API

**Endpoint**: `https://api-rac-n-play.vercel.app/api/data/all`

**Método**: GET

**Resposta**: JSON contendo todas as tabelas do banco de dados com seus respectivos dados

## Observações

- O dashboard foi desenvolvido utilizando apenas arquivos `.jsx`
- Não foram criados arquivos CSS separados, toda estilização foi feita com Bootstrap
- Os dados são carregados dinamicamente da API em tempo real
- O dashboard inclui estados de loading e tratamento de erros
- As relações entre tabelas foram implementadas corretamente conforme especificado no arquivo `relacoes_app.xlsx`

## Próximos Passos Sugeridos

Este dashboard serve como base para futuras visualizações. Algumas sugestões de expansão:

1. Adicionar filtros por período de tempo
2. Criar gráficos de tendência temporal
3. Adicionar métricas de engajamento por usuário
4. Implementar filtros por tipo de ativação
5. Adicionar exportação de relatórios
6. Criar visualizações de mapas de calor para ativações mais populares
