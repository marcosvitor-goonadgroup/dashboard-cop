# DataContext - Documentação

## Visão Geral

O `DataContext` é um contexto React que centraliza o gerenciamento de dados da aplicação, fornecendo acesso global aos dados da API e funcionalidades de filtragem.

## Estrutura

### Provider

```jsx
import { DataProvider } from './context/DataContext';

// Envolver a aplicação com o Provider (já configurado em index.js)
<DataProvider>
  <App />
</DataProvider>
```

### Hook useData

```jsx
import { useData } from '../context/DataContext';

const MeuComponente = () => {
  const { data, loading, error, getMetrics } = useData();
  // ...
};
```

## API do Contexto

### Estado

#### `data`
- **Tipo**: `Object | null`
- **Descrição**: Dados brutos retornados pela API
- **Estrutura**: `{ tables: { ativacoes, checkins, resgates, up_users, ... } }`

#### `loading`
- **Tipo**: `boolean`
- **Descrição**: Indica se os dados estão sendo carregados

#### `error`
- **Tipo**: `Error | null`
- **Descrição**: Objeto de erro caso ocorra algum problema ao carregar os dados

#### `filters`
- **Tipo**: `Object`
- **Descrição**: Objeto contendo os filtros ativos
- **Exemplo**:
```javascript
{
  startDate: "2025-10-01",
  endDate: "2025-10-24",
  tipoAtivacao: "tipo Praça BB",
  localAtivacao: "Estande"
}
```

---

## Funções

### `updateFilters(newFilters)`
Atualiza os filtros ativos.

**Parâmetros:**
- `newFilters` (Object): Objeto com os novos filtros

**Exemplo:**
```javascript
const { updateFilters } = useData();

updateFilters({
  startDate: "2025-10-01",
  endDate: "2025-10-24",
  tipoAtivacao: "tipo Praça BB"
});
```

---

### `clearFilters()`
Limpa todos os filtros ativos.

**Exemplo:**
```javascript
const { clearFilters } = useData();

clearFilters();
```

---

### `getFilteredData()`
Retorna os dados filtrados de acordo com os filtros ativos.

**Retorna:** `Object` - Tabelas filtradas

**Filtros Suportados:**
- `startDate`: Data inicial (filtra checkins e resgates)
- `endDate`: Data final (filtra checkins e resgates)
- `tipoAtivacao`: Tipo de ativação (ex: "tipo Praça BB")
- `localAtivacao`: Local da ativação (ex: "Estande")
- `eventoId`: ID do evento

**Exemplo:**
```javascript
const { getFilteredData } = useData();

const filteredTables = getFilteredData();
const checkinsFiltrados = filteredTables.checkins?.data || [];
```

---

### `getMetrics()`
Retorna as métricas calculadas baseadas nos dados filtrados.

**Retorna:** `Object`
```javascript
{
  totalUsuariosComAtivacoes: number,  // Usuários únicos com check-in
  totalCheckins: number,               // Total de check-ins
  totalResgates: number,               // Total de resgates
  totalAtivacoes: number               // Total de ativações publicadas
}
```

**Exemplo:**
```javascript
const { getMetrics } = useData();

const metrics = getMetrics();
console.log(`Total de check-ins: ${metrics.totalCheckins}`);
```

---

### `getUniqueValues(tableName, fieldName)`
Retorna valores únicos de um campo específico de uma tabela.

**Parâmetros:**
- `tableName` (string): Nome da tabela (ex: "ativacoes")
- `fieldName` (string): Nome do campo (ex: "tipo")

**Retorna:** `Array` - Lista de valores únicos ordenados

**Exemplo:**
```javascript
const { getUniqueValues } = useData();

const tiposAtivacao = getUniqueValues("ativacoes", "tipo");
// ["tipo Agencia BB", "tipo Praça BB", "tipo Volantes"]

const locaisAtivacao = getUniqueValues("ativacoes", "local");
// ["Agência BB", "Estande", "Volante"]
```

---

### `getCheckInsPorAtivacao()`
Retorna dados de check-ins agrupados por ativação, considerando filtros ativos.

**Retorna:** `Array` - Lista ordenada de ativações com seus check-ins
```javascript
[
  {
    id: number,
    nome: string,
    checkins: number,
    tipo: string | null,
    local: string | null,
    pontuacao: number
  }
]
```

**Exemplo:**
```javascript
const { getCheckInsPorAtivacao } = useData();

const dados = getCheckInsPorAtivacao();
const top5 = dados.slice(0, 5);

top5.forEach(ativacao => {
  console.log(`${ativacao.nome}: ${ativacao.checkins} check-ins`);
});
```

---

### `getResgatesPorBrinde()`
Retorna dados de resgates agrupados por brinde, considerando filtros ativos.

**Retorna:** `Array` - Lista ordenada de brindes com seus resgates
```javascript
[
  {
    id: number,
    titulo: string,
    resgates: number,
    pontos: number,
    estoque: number
  }
]
```

**Exemplo:**
```javascript
const { getResgatesPorBrinde } = useData();

const brindesMaisResgatados = getResgatesPorBrinde();
const top3 = brindesMaisResgatados.slice(0, 3);
```

---

### `getFilterStats()`
Retorna estatísticas sobre os filtros aplicados.

**Retorna:** `Object`
```javascript
{
  total: number,           // Total de check-ins sem filtro
  filtered: number,        // Total de check-ins com filtro
  percentage: number,      // Porcentagem dos dados filtrados
  hasActiveFilters: boolean // Se há filtros ativos
}
```

**Exemplo:**
```javascript
const { getFilterStats } = useData();

const stats = getFilterStats();
console.log(`Exibindo ${stats.percentage}% dos dados (${stats.filtered} de ${stats.total})`);
```

---

## Exemplo de Uso Completo

```jsx
import { useData } from '../context/DataContext';
import { useState } from 'react';

const MinhaVisualizacao = () => {
  const {
    loading,
    error,
    filters,
    updateFilters,
    clearFilters,
    getMetrics,
    getCheckInsPorAtivacao,
    getUniqueValues,
    getFilterStats
  } = useData();

  const [filtroLocal, setFiltroLocal] = useState('');

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error.message}</div>;

  const metrics = getMetrics();
  const checkIns = getCheckInsPorAtivacao();
  const locais = getUniqueValues('ativacoes', 'local');
  const stats = getFilterStats();

  const handleFiltrar = () => {
    updateFilters({
      ...filters,
      localAtivacao: filtroLocal
    });
  };

  return (
    <div>
      <h1>Métricas</h1>
      <p>Total de Check-ins: {metrics.totalCheckins}</p>
      <p>Total de Usuários: {metrics.totalUsuariosComAtivacoes}</p>

      {/* Filtros */}
      <select value={filtroLocal} onChange={(e) => setFiltroLocal(e.target.value)}>
        <option value="">Todos os locais</option>
        {locais.map(local => (
          <option key={local} value={local}>{local}</option>
        ))}
      </select>
      <button onClick={handleFiltrar}>Filtrar</button>
      <button onClick={clearFilters}>Limpar Filtros</button>

      {/* Estatísticas de filtro */}
      {stats.hasActiveFilters && (
        <p>Mostrando {stats.percentage}% dos dados</p>
      )}

      {/* Dados */}
      <ul>
        {checkIns.slice(0, 5).map(item => (
          <li key={item.id}>
            {item.nome}: {item.checkins} check-ins
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MinhaVisualizacao;
```

---

## Estrutura de Dados da API

### Tabelas Disponíveis

O `data.tables` contém as seguintes tabelas:

#### Principais
- `ativacoes`: Informações das ativações
- `checkins`: Registros de check-in
- `resgates`: Registros de resgates
- `up_users`: Usuários do sistema
- `brindes`: Informações dos brindes
- `eventos`: Informações dos eventos

#### Relacionamentos (Link Tables)
- `checkins_ativacao_lnk`: Relaciona check-ins com ativações
- `checkins_users_permissions_user_lnk`: Relaciona check-ins com usuários
- `resgates_brinde_lnk`: Relaciona resgates com brindes
- `ativacoes_evento_lnk`: Relaciona ativações com eventos

### Campos Importantes

#### Ativações
```javascript
{
  id: number,
  nome: string,
  tipo: string,           // Ex: "tipo Praça BB"
  local: string,          // Ex: "Estande"
  pontuacao: string,      // Pontos atribuídos
  descricao: string,
  published_at: string | null,  // null se não publicado
  created_at: string,
  updated_at: string
}
```

#### Check-ins
```javascript
{
  id: number,
  created_at: string,
  updated_at: string,
  published_at: string | null
}
```

#### Resgates
```javascript
{
  id: number,
  created_at: string,
  updated_at: string,
  published_at: string | null
}
```

---

## Boas Práticas

1. **Sempre use o hook `useData`** para acessar o contexto
2. **Verifique `loading` e `error`** antes de renderizar dados
3. **Use filtros para otimizar visualizações** grandes
4. **Utilize `getFilterStats`** para mostrar ao usuário o impacto dos filtros
5. **Cache os resultados** de funções pesadas quando possível usando `useMemo`

```jsx
import { useMemo } from 'react';

const chartData = useMemo(() => {
  return getCheckInsPorAtivacao().slice(0, 10);
}, [getCheckInsPorAtivacao]);
```

---

## Extensões Futuras

O DataContext foi projetado para ser facilmente extensível. Possíveis adições:

1. **Filtros por período personalizado**
2. **Filtros por avaliação de ativação**
3. **Agregações por período (diário, semanal)**
4. **Exportação de dados filtrados**
5. **Cache de dados com refresh sob demanda**
6. **Sincronização com localStorage para persistir filtros**
