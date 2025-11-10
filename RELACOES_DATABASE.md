# Estrutura de Relações do Banco de Dados

## Mapeamento das Relações (baseado em relacoes_app.csv)

### Legenda de Cardinalidade
- `1?1` = Um para Um (opcional em ambos os lados)
- `1??` = Um para Muitos

---

## 1. Usuários (up_users)

### Relações 1:1 (Um usuário pode ter apenas um registro)
```
up_users ─── 1?1 ─── chute_moedas
    └─ up_users[id] ←→ up_users_chute_moeda_lnk[user_id]
    └─ chute_moedas[id] ←→ up_users_chute_moeda_lnk[chute_moedar_id]

up_users ─── 1?1 ─── pesquisa_experiencias
    └─ up_users[id] ←→ pesquisa_experiencias_users_permissions_user_lnk[user_id]
    └─ pesquisa_experiencias[id] ←→ pesquisa_experiencias_users_permissions_user_lnk[pesquisa_experiencias_id]
```

### Relações 1:N (Um usuário pode ter vários registros)
```
up_users ─── 1?? ─── numero_da_sortes
    └─ up_users[id] ←→ numero_da_sortes_users_permissions_user_lnk[user_id]
    └─ numero_da_sortes[id] ←→ numero_da_sortes_users_permissions_user_lnk[numero_da_sorte_id]

up_users ─── 1?? ─── checkins
    └─ up_users[id] ←→ checkins_users_permissions_user_lnk[user_id]
    └─ checkins[id] ←→ checkins_users_permissions_user_lnk[checkin_id]

up_users ─── 1?1 ─── resgates
    └─ up_users[id] ←→ resgates_users_permissions_user_lnk[user_id]
    └─ resgates[id] ←→ resgates_users_permissions_user_lnk[resgate_id]

up_users ─── 1?? ─── avaliacao_de_ativacaos
    └─ up_users[id] ←→ avaliacao_de_ativacaos_users_permissions_user_lnk[user_id]
    └─ avaliacao_de_ativacaos[id] ←→ avaliacao_de_ativacaos_users_permissions_user_lnk[avaliacao_de_ativacao_id]
```

---

## 2. Check-ins (checkins)

### Relações
```
checkins ─── 1?1 ─── up_users
    └─ Via: checkins_users_permissions_user_lnk

checkins ─── 1?? ─── ativacoes
    └─ checkins[id] ←→ checkins_ativacao_lnk[checkin_id]
    └─ ativacoes[id] ←→ checkins_ativacao_lnk[ativacao_id]
```

**Nota**: Um check-in pertence a um usuário e pode estar relacionado a múltiplas ativações.

---

## 3. Ativações (ativacoes)

### Relações
```
ativacoes ─── 1?? ─── checkins
    └─ Via: checkins_ativacao_lnk

ativacoes ─── 1?1 ─── eventos
    └─ ativacoes[id] ←→ ativacoes_evento_lnk[ativacao_id]
    └─ eventos[id] ←→ ativacoes_evento_lnk[evento_id]

ativacoes ─── 1?? ─── avaliacao_de_ativacaos
    └─ ativacoes[id] ←→ avaliacao_de_ativacaos_ativacao_lnk[ativacao_id]
    └─ avaliacao_de_ativacaos[id] ←→ avaliacao_de_ativacaos_ativacao_lnk[avaliacao_de_ativacao_id]
```

**Nota**: Uma ativação pode receber múltiplos check-ins e avaliações, mas pertence a apenas um evento.

---

## 4. Eventos (eventos)

### Relações
```
eventos ─── 1?? ─── ativacoes
    └─ Via: ativacoes_evento_lnk

eventos ─── 1?1 ─── clientes
    └─ eventos[id] ←→ eventos_cliente_lnk[evento_id]
    └─ clientes[id] ←→ eventos_cliente_lnk[cliente_id]
```

**Nota**: Um evento pode ter múltiplas ativações, mas pertence a apenas um cliente.

---

## 5. Avaliações de Ativações (avaliacao_de_ativacaos)

### Relações
```
avaliacao_de_ativacaos ─── 1?? ─── ativacoes
    └─ Via: avaliacao_de_ativacaos_ativacao_lnk

avaliacao_de_ativacaos ─── 1?? ─── up_users
    └─ Via: avaliacao_de_ativacaos_users_permissions_user_lnk
```

**Nota**: Uma avaliação está relacionada a uma ativação e a um usuário.

---

## 6. Resgates (resgates)

### Relações
```
resgates ─── 1?1 ─── up_users
    └─ Via: resgates_users_permissions_user_lnk

resgates ─── 1?? ─── brindes
    └─ resgates[id] ←→ resgates_brinde_lnk[resgate_id]
    └─ brindes[id] ←→ resgates_brinde_lnk[brinde_id]
```

**Nota**: Um resgate pertence a um usuário e pode estar relacionado a múltiplos brindes.

---

## 7. Outras Relações Específicas

### Chute de Moeda
```
up_users ─── 1?1 ─── chute_moedas
```
Um usuário pode ter no máximo um chute de moeda registrado.

### Pesquisa de Experiência
```
up_users ─── 1?1 ─── pesquisa_experiencias
```
Um usuário pode ter no máximo uma pesquisa de experiência.

### Números da Sorte
```
up_users ─── 1?? ─── numero_da_sortes
```
Um usuário pode ter múltiplos números da sorte.

---

## Diagrama Simplificado

```
                                    ┌──────────┐
                                    │ clientes │
                                    └────┬─────┘
                                         │ 1?1
                                    ┌────▼─────┐
                        ┌───────────┤ eventos  │
                        │           └──────────┘
                        │ 1??
                   ┌────▼──────┐
                   │ ativacoes │◄─────┐
                   └─────┬─────┘      │
                         │            │ 1??
                         │ 1??        │
                    ┌────▼───────┐    │
         ┌──────────┤  checkins  │    │
         │          └────┬───────┘    │
         │               │            │
         │ 1?1           │ 1?1   ┌────┴──────────────────┐
    ┌────▼─────┐    ┌────▼──────┐│ avaliacao_de_ativacaos│
    │ up_users │◄───┤ up_users  │└───────────────────────┘
    └────┬─────┘    └───────────┘
         │
         ├─── 1?1 ──► chute_moedas
         ├─── 1?1 ──► pesquisa_experiencias
         ├─── 1?? ──► numero_da_sortes
         ├─── 1?? ──► checkins
         ├─── 1?1 ──► resgates
         └─── 1?? ──► avaliacao_de_ativacaos

    ┌─────────┐
    │ resgates│◄───┐
    └────┬────┘    │ 1??
         │         │
         │ 1??  ┌──┴──────┐
         └──────►│ brindes │
                 └─────────┘
```

---

## Tabelas de Relacionamento (Link Tables)

### Lista Completa
1. `up_users_chute_moeda_lnk`
2. `pesquisa_experiencias_users_permissions_user_lnk`
3. `numero_da_sortes_users_permissions_user_lnk`
4. `checkins_users_permissions_user_lnk`
5. `checkins_ativacao_lnk`
6. `ativacoes_evento_lnk`
7. `eventos_cliente_lnk`
8. `avaliacao_de_ativacaos_ativacao_lnk`
9. `avaliacao_de_ativacaos_users_permissions_user_lnk`
10. `resgates_users_permissions_user_lnk`
11. `resgates_brinde_lnk`

---

## Chaves de Relacionamento

### Padrão de Nomenclatura

#### Tabelas Principais
- Campo ID: `id`

#### Tabelas de Link (Relacionamento)
- ID da entidade 1: `{tabela}_id` ou `{tabela_singular}_id`
- ID da entidade 2: `{tabela}_id` ou `{tabela_singular}_id`
- Ordem de relacionamento: `{entidade}_ord`

**Exemplos:**
```javascript
// checkins_ativacao_lnk
{
  id: number,
  checkin_id: number,      // FK para checkins.id
  ativacao_id: number,     // FK para ativacoes.id
  ativacao_ord: number     // Ordem do relacionamento
}

// resgates_brinde_lnk
{
  id: number,
  resgate_id: number,      // FK para resgates.id
  brinde_id: number,       // FK para brindes.id
  brinde_ord: number       // Ordem do relacionamento
}
```

---

## Queries Comuns

### 1. Obter todos os check-ins de um usuário com suas ativações

```javascript
// 1. Buscar user_id na tabela de link checkins_users_permissions_user
const userCheckinLinks = checkins_users_permissions_user_lnk.filter(
  link => link.user_id === userId
);

// 2. Buscar os checkins
const checkinIds = userCheckinLinks.map(link => link.checkin_id);
const userCheckins = checkins.filter(c => checkinIds.includes(c.id));

// 3. Buscar ativações relacionadas aos checkins
const checkinAtivacaoLinks = checkins_ativacao_lnk.filter(
  link => checkinIds.includes(link.checkin_id)
);

const ativacaoIds = checkinAtivacaoLinks.map(link => link.ativacao_id);
const ativacoes = ativacoes.filter(a => ativacaoIds.includes(a.id));
```

### 2. Obter todos os usuários que fizeram check-in em uma ativação

```javascript
// 1. Buscar checkins da ativação
const checkinLinks = checkins_ativacao_lnk.filter(
  link => link.ativacao_id === ativacaoId
);

const checkinIds = checkinLinks.map(link => link.checkin_id);

// 2. Buscar usuários dos checkins
const userLinks = checkins_users_permissions_user_lnk.filter(
  link => checkinIds.includes(link.checkin_id)
);

const userIds = userLinks.map(link => link.user_id);
const usuarios = up_users.filter(u => userIds.includes(u.id));
```

### 3. Obter todas as ativações de um evento

```javascript
// Buscar ativações do evento
const ativacaoLinks = ativacoes_evento_lnk.filter(
  link => link.evento_id === eventoId
);

const ativacaoIds = ativacaoLinks.map(link => link.ativacao_id);
const ativacoes = ativacoes.filter(a => ativacaoIds.includes(a.id));
```

### 4. Obter resgates de um usuário com os brindes

```javascript
// 1. Buscar resgates do usuário
const resgateLinks = resgates_users_permissions_user_lnk.filter(
  link => link.user_id === userId
);

const resgateIds = resgateLinks.map(link => link.resgate_id);
const userResgates = resgates.filter(r => resgateIds.includes(r.id));

// 2. Buscar brindes dos resgates
const brindeLinks = resgates_brinde_lnk.filter(
  link => resgateIds.includes(link.resgate_id)
);

const brindeIds = brindeLinks.map(link => link.brinde_id);
const brindes = brindes.filter(b => brindeIds.includes(b.id));
```

---

## Considerações Importantes

### Dados Publicados
Sempre verificar o campo `published_at`:
- `published_at !== null` = Registro publicado e visível
- `published_at === null` = Registro não publicado (rascunho)

### Ordenação
Tabelas de link podem ter campos `*_ord` para manter a ordem dos relacionamentos.

### Timestamps
Todos os registros têm:
- `created_at`: Data de criação
- `updated_at`: Data da última atualização
- `published_at`: Data de publicação (pode ser null)
