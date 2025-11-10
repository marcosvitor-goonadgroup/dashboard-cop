# Como Usar as Relações do Banco de Dados

## Visão Geral

O DataContext agora inclui funções para navegar facilmente entre as tabelas seguindo as relações definidas em `relacoes_app.csv`. Todas as relações foram implementadas corretamente.

---

## Funções Disponíveis

### 📋 Funções de Relação Usuário

#### `getCheckInsByUser(userId)`
Retorna todos os check-ins de um usuário.
```javascript
const { getCheckInsByUser } = useData();

const checkins = getCheckInsByUser(123);
// Retorna array de check-ins do usuário 123
```

#### `getResgatesByUserRelation(userId)`
Retorna todos os resgates de um usuário com seus brindes relacionados.
```javascript
const { getResgatesByUserRelation } = useData();

const resgates = getResgatesByUserRelation(123);
// Retorna array de resgates, cada um com array de brindes
// [{ id, created_at, ..., brindes: [{id, titulo, pontos, ...}] }]
```

#### `getNumerosDaSorteByUser(userId)`
Retorna todos os números da sorte de um usuário.
```javascript
const { getNumerosDaSorteByUser } = useData();

const numeros = getNumerosDaSorteByUser(123);
```

#### `getAvaliacoesByUser(userId)`
Retorna todas as avaliações de ativações feitas por um usuário.
```javascript
const { getAvaliacoesByUser } = useData();

const avaliacoes = getAvaliacoesByUser(123);
```

#### `getChuteMoedaByUser(userId)`
Retorna o chute de moeda de um usuário (relação 1:1).
```javascript
const { getChuteMoedaByUser } = useData();

const chute = getChuteMoedaByUser(123);
// Retorna objeto ou null
```

#### `getPesquisaExperienciaByUser(userId)`
Retorna a pesquisa de experiência de um usuário (relação 1:1).
```javascript
const { getPesquisaExperienciaByUser } = useData();

const pesquisa = getPesquisaExperienciaByUser(123);
// Retorna objeto ou null
```

---

### 🎯 Funções de Relação Ativação

#### `getUsersByAtivacao(ativacaoId)`
Retorna todos os usuários que fizeram check-in em uma ativação.
```javascript
const { getUsersByAtivacao } = useData();

const usuarios = getUsersByAtivacao(10);
// Retorna array de usuários únicos
```

#### `getAvaliacoesByAtivacao(ativacaoId)`
Retorna todas as avaliações de uma ativação.
```javascript
const { getAvaliacoesByAtivacao } = useData();

const avaliacoes = getAvaliacoesByAtivacao(10);
```

#### `getEventoByAtivacao(ativacaoId)`
Retorna o evento ao qual a ativação pertence.
```javascript
const { getEventoByAtivacao } = useData();

const evento = getEventoByAtivacao(10);
// Retorna objeto evento ou null
```

---

### 🎪 Funções de Relação Evento

#### `getAtivacoesByEvento(eventoId)`
Retorna todas as ativações de um evento.
```javascript
const { getAtivacoesByEvento } = useData();

const ativacoes = getAtivacoesByEvento(1);
```

#### `getClienteByEvento(eventoId)`
Retorna o cliente ao qual o evento pertence.
```javascript
const { getClienteByEvento } = useData();

const cliente = getClienteByEvento(1);
// Retorna objeto cliente ou null
```

---

### 🎁 Funções de Relação Brinde

#### `getUsersByBrinde(brindeId)`
Retorna todos os usuários que resgataram um brinde.
```javascript
const { getUsersByBrinde } = useData();

const usuarios = getUsersByBrinde(5);
```

---

### ✅ Funções de Relação Check-in

#### `getAtivacoesByCheckin(checkinId)`
Retorna todas as ativações relacionadas a um check-in.
```javascript
const { getAtivacoesByCheckin } = useData();

const ativacoes = getAtivacoesByCheckin(456);
```

---

## 🎯 Funções Agregadas (Perfis Completos)

### `getUserProfile(userId)`
Retorna perfil completo do usuário com todos os dados relacionados.

```javascript
const { getUserProfile } = useData();

const perfil = getUserProfile(123);
// {
//   ...usuario,
//   checkins: [...],
//   resgates: [{..., brindes: [...]}],
//   numerosDaSorte: [...],
//   avaliacoes: [...],
//   chuteMoeda: {...} ou null,
//   pesquisaExperiencia: {...} ou null
// }
```

**Exemplo de Uso Completo:**
```jsx
import { useData } from '../context/DataContext';

const PerfilUsuario = ({ userId }) => {
  const { getUserProfile } = useData();
  const perfil = getUserProfile(userId);

  if (!perfil) return <div>Usuário não encontrado</div>;

  return (
    <div>
      <h1>{perfil.username}</h1>
      <p>Email: {perfil.email}</p>

      <h2>Check-ins: {perfil.checkins.length}</h2>
      <h2>Resgates: {perfil.resgates.length}</h2>
      <h2>Números da Sorte: {perfil.numerosDaSorte.length}</h2>

      {perfil.chuteMoeda && (
        <div>Chute: {perfil.chuteMoeda.chute}</div>
      )}
    </div>
  );
};
```

---

### `getAtivacaoStats(ativacaoId)`
Retorna estatísticas completas de uma ativação.

```javascript
const { getAtivacaoStats } = useData();

const stats = getAtivacaoStats(10);
// {
//   ...ativacao,
//   totalUsuarios: 150,
//   totalAvaliacoes: 45,
//   mediaAvaliacao: 4.5,
//   evento: {...},
//   usuarios: [...],
//   avaliacoes: [...]
// }
```

**Exemplo de Uso:**
```jsx
const DetalheAtivacao = ({ ativacaoId }) => {
  const { getAtivacaoStats } = useData();
  const stats = getAtivacaoStats(ativacaoId);

  if (!stats) return <div>Ativação não encontrada</div>;

  return (
    <div>
      <h1>{stats.nome}</h1>
      <p>{stats.descricao}</p>

      <div>Total de Usuários: {stats.totalUsuarios}</div>
      <div>Avaliação Média: {stats.mediaAvaliacao}/5</div>
      <div>Total de Avaliações: {stats.totalAvaliacoes}</div>

      {stats.evento && (
        <div>Evento: {stats.evento.nome}</div>
      )}
    </div>
  );
};
```

---

### `getEventoStats(eventoId)`
Retorna estatísticas completas de um evento.

```javascript
const { getEventoStats } = useData();

const stats = getEventoStats(1);
// {
//   ...evento,
//   cliente: {...},
//   totalAtivacoes: 8,
//   totalCheckins: 450,
//   totalUsuariosUnicos: 150,
//   ativacoes: [...]
// }
```

**Exemplo de Uso:**
```jsx
const DetalheEvento = ({ eventoId }) => {
  const { getEventoStats } = useData();
  const stats = getEventoStats(eventoId);

  if (!stats) return <div>Evento não encontrado</div>;

  return (
    <div>
      <h1>{stats.nome}</h1>

      {stats.cliente && (
        <div>Cliente: {stats.cliente.nome}</div>
      )}

      <div>Total de Ativações: {stats.totalAtivacoes}</div>
      <div>Total de Check-ins: {stats.totalCheckins}</div>
      <div>Usuários Únicos: {stats.totalUsuariosUnicos}</div>

      <h2>Ativações:</h2>
      <ul>
        {stats.ativacoes.map(ativacao => (
          <li key={ativacao.id}>{ativacao.nome}</li>
        ))}
      </ul>
    </div>
  );
};
```

---

## 📊 Exemplos de Casos de Uso

### 1. Ranking de Usuários por Check-ins

```jsx
import { useData } from '../context/DataContext';

const RankingUsuarios = () => {
  const { data, getCheckInsByUser } = useData();

  if (!data) return <div>Carregando...</div>;

  const usuarios = data.tables.up_users?.data || [];

  // Calcular check-ins por usuário
  const ranking = usuarios.map(usuario => ({
    ...usuario,
    totalCheckins: getCheckInsByUser(usuario.id).length
  }))
  .sort((a, b) => b.totalCheckins - a.totalCheckins)
  .slice(0, 10); // Top 10

  return (
    <div>
      <h2>Top 10 Usuários</h2>
      <ol>
        {ranking.map(usuario => (
          <li key={usuario.id}>
            {usuario.username}: {usuario.totalCheckins} check-ins
          </li>
        ))}
      </ol>
    </div>
  );
};
```

---

### 2. Ativações mais Avaliadas

```jsx
const AtivacoesTopAvaliadas = () => {
  const { data, getAtivacaoStats } = useData();

  if (!data) return <div>Carregando...</div>;

  const ativacoes = data.tables.ativacoes?.data || [];

  // Calcular estatísticas de cada ativação
  const ativacoesComStats = ativacoes
    .map(ativacao => getAtivacaoStats(ativacao.id))
    .filter(stats => stats && stats.totalAvaliacoes > 0)
    .sort((a, b) => b.mediaAvaliacao - a.mediaAvaliacao)
    .slice(0, 5);

  return (
    <div>
      <h2>Top 5 Ativações Melhor Avaliadas</h2>
      {ativacoesComStats.map(stats => (
        <div key={stats.id} className="card">
          <h3>{stats.nome}</h3>
          <div>⭐ {stats.mediaAvaliacao}/5</div>
          <div>📊 {stats.totalAvaliacoes} avaliações</div>
          <div>👥 {stats.totalUsuarios} participantes</div>
        </div>
      ))}
    </div>
  );
};
```

---

### 3. Análise de Participação de Usuário

```jsx
const AnaliseParticipacao = ({ userId }) => {
  const { getUserProfile, getAtivacoesByCheckin } = useData();

  const perfil = getUserProfile(userId);
  if (!perfil) return null;

  // Obter todas as ativações que o usuário participou
  const ativacoesParticipadas = new Set();
  perfil.checkins.forEach(checkin => {
    const ativacoes = getAtivacoesByCheckin(checkin.id);
    ativacoes.forEach(ativacao => ativacoesParticipadas.add(ativacao.id));
  });

  return (
    <div>
      <h2>Análise de Participação</h2>
      <div>Total de Check-ins: {perfil.checkins.length}</div>
      <div>Ativações Distintas: {ativacoesParticipadas.size}</div>
      <div>Total de Resgates: {perfil.resgates.length}</div>
      <div>Números da Sorte: {perfil.numerosDaSorte.length}</div>
      <div>Avaliações Realizadas: {perfil.avaliacoes.length}</div>
    </div>
  );
};
```

---

### 4. Mapa de Relacionamentos

```jsx
const MapaRelacionamentos = ({ ativacaoId }) => {
  const {
    getAtivacaoStats,
    getEventoByAtivacao,
    getClienteByEvento,
    getUsersByAtivacao
  } = useData();

  const ativacao = getAtivacaoStats(ativacaoId);
  if (!ativacao) return null;

  const evento = getEventoByAtivacao(ativacaoId);
  const cliente = evento ? getClienteByEvento(evento.id) : null;
  const usuarios = getUsersByAtivacao(ativacaoId);

  return (
    <div>
      <h2>Mapa de Relacionamentos</h2>

      {cliente && (
        <div>Cliente: {cliente.nome}</div>
      )}

      {evento && (
        <div>↓ Evento: {evento.nome}</div>
      )}

      <div>↓ Ativação: {ativacao.nome}</div>

      <div>↓ Participantes: {usuarios.length} usuários</div>

      <div>↓ Avaliação Média: {ativacao.mediaAvaliacao}/5</div>
    </div>
  );
};
```

---

## ⚡ Performance Tips

1. **Use `useMemo` para dados processados**
```jsx
const ranking = useMemo(() => {
  return usuarios.map(u => ({
    ...u,
    checkins: getCheckInsByUser(u.id).length
  })).sort((a, b) => b.checkins - a.checkins);
}, [usuarios, getCheckInsByUser]);
```

2. **Cache resultados quando possível**
```jsx
const [cachedProfiles, setCachedProfiles] = useState({});

const getProfile = (userId) => {
  if (cachedProfiles[userId]) {
    return cachedProfiles[userId];
  }

  const profile = getUserProfile(userId);
  setCachedProfiles(prev => ({ ...prev, [userId]: profile }));
  return profile;
};
```

---

## 📚 Documentação Adicional

- **[RELACOES_DATABASE.md](RELACOES_DATABASE.md)** - Estrutura completa das relações
- **[DATA_CONTEXT_DOC.md](DATA_CONTEXT_DOC.md)** - API completa do DataContext
- **[DataRelations.js](src/context/DataRelations.js)** - Código fonte das funções de relação

---

## ✅ Checklist de Implementação

Ao criar novos componentes que usam relações:

- [ ] Importar `useData` do DataContext
- [ ] Verificar se os dados estão carregados (`loading`)
- [ ] Tratar erros (`error`)
- [ ] Usar funções de relação apropriadas
- [ ] Considerar usar `useMemo` para otimização
- [ ] Verificar valores null/undefined antes de renderizar
- [ ] Filtrar apenas registros publicados quando relevante

---

**Todas as relações do arquivo `relacoes_app.csv` foram implementadas e estão prontas para uso!** 🎉
