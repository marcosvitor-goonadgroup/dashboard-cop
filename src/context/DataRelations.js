// Funções auxiliares para navegar pelas relações do banco de dados
// Baseado em relacoes_app.csv

/**
 * Obtém check-ins de um usuário específico
 * Relação: up_users[id] ─── 1?? ─── checkins[id]
 * Via: checkins_users_permissions_user_lnk
 */
export const getCheckInsByUser = (data, userId) => {
  if (!data || !data.tables) return [];

  const checkins = data.tables.checkins?.data || [];
  const checkinsUsuariosLnk = data.tables.checkins_users_permissions_user_lnk?.data || [];

  // Buscar checkin_ids do usuário
  const checkinIds = checkinsUsuariosLnk
    .filter(link => link.user_id === userId)
    .map(link => link.checkin_id);

  // Retornar checkins do usuário
  return checkins.filter(checkin => checkinIds.includes(checkin.id));
};

/**
 * Obtém ativações de um check-in
 * Relação: checkins[id] ─── 1?? ─── ativacoes[id]
 * Via: checkins_ativacao_lnk
 */
export const getAtivacoesByCheckin = (data, checkinId) => {
  if (!data || !data.tables) return [];

  const ativacoes = data.tables.ativacoes?.data || [];
  const checkinsAtivacaoLnk = data.tables.checkins_ativacao_lnk?.data || [];

  // Buscar ativacao_ids do checkin
  const ativacaoIds = checkinsAtivacaoLnk
    .filter(link => link.checkin_id === checkinId)
    .map(link => link.ativacao_id);

  // Retornar ativações (apenas publicadas)
  return ativacoes.filter(
    ativacao => ativacaoIds.includes(ativacao.id) && ativacao.published_at !== null
  );
};

/**
 * Obtém usuários que fizeram check-in em uma ativação
 * Relação reversa: ativacoes[id] ←── checkins[id] ←── up_users[id]
 */
export const getUsersByAtivacao = (data, ativacaoId) => {
  if (!data || !data.tables) return [];

  const usuarios = data.tables.up_users?.data || [];
  const checkinsAtivacaoLnk = data.tables.checkins_ativacao_lnk?.data || [];
  const checkinsUsuariosLnk = data.tables.checkins_users_permissions_user_lnk?.data || [];

  // 1. Buscar checkin_ids da ativação
  const checkinIds = checkinsAtivacaoLnk
    .filter(link => link.ativacao_id === ativacaoId)
    .map(link => link.checkin_id);

  // 2. Buscar user_ids dos checkins
  const userIds = checkinsUsuariosLnk
    .filter(link => checkinIds.includes(link.checkin_id))
    .map(link => link.user_id);

  // 3. Retornar usuários únicos
  const uniqueUserIds = [...new Set(userIds)];
  return usuarios.filter(user => uniqueUserIds.includes(user.id));
};

/**
 * Obtém ativações de um evento
 * Relação: eventos[id] ─── 1?? ─── ativacoes[id]
 * Via: ativacoes_evento_lnk
 */
export const getAtivacoesByEvento = (data, eventoId) => {
  if (!data || !data.tables) return [];

  const ativacoes = data.tables.ativacoes?.data || [];
  const ativacoesEventoLnk = data.tables.ativacoes_evento_lnk?.data || [];

  // Buscar ativacao_ids do evento
  const ativacaoIds = ativacoesEventoLnk
    .filter(link => link.evento_id === eventoId)
    .map(link => link.ativacao_id);

  // Retornar ativações (apenas publicadas)
  return ativacoes.filter(
    ativacao => ativacaoIds.includes(ativacao.id) && ativacao.published_at !== null
  );
};

/**
 * Obtém o evento de uma ativação
 * Relação: ativacoes[id] ─── 1?1 ─── eventos[id]
 * Via: ativacoes_evento_lnk
 */
export const getEventoByAtivacao = (data, ativacaoId) => {
  if (!data || !data.tables) return null;

  const eventos = data.tables.eventos?.data || [];
  const ativacoesEventoLnk = data.tables.ativacoes_evento_lnk?.data || [];

  // Buscar evento_id da ativação
  const link = ativacoesEventoLnk.find(link => link.ativacao_id === ativacaoId);
  if (!link) return null;

  // Retornar evento
  return eventos.find(
    evento => evento.id === link.evento_id && evento.published_at !== null
  ) || null;
};

/**
 * Obtém cliente de um evento
 * Relação: eventos[id] ─── 1?1 ─── clientes[id]
 * Via: eventos_cliente_lnk
 */
export const getClienteByEvento = (data, eventoId) => {
  if (!data || !data.tables) return null;

  const clientes = data.tables.clientes?.data || [];
  const eventosClienteLnk = data.tables.eventos_cliente_lnk?.data || [];

  // Buscar cliente_id do evento
  const link = eventosClienteLnk.find(link => link.evento_id === eventoId);
  if (!link) return null;

  // Retornar cliente
  return clientes.find(
    cliente => cliente.id === link.cliente_id && cliente.published_at !== null
  ) || null;
};

/**
 * Obtém resgates de um usuário com brindes
 * Relação: up_users[id] ─── 1?1 ─── resgates[id] ─── 1?? ─── brindes[id]
 */
export const getResgatesByUser = (data, userId) => {
  if (!data || !data.tables) return [];

  const resgates = data.tables.resgates?.data || [];
  const brindes = data.tables.brindes?.data || [];
  const resgatesUsuariosLnk = data.tables.resgates_users_permissions_user_lnk?.data || [];
  const resgatesBrindeLnk = data.tables.resgates_brinde_lnk?.data || [];

  // 1. Buscar resgate_ids do usuário
  const resgateIds = resgatesUsuariosLnk
    .filter(link => link.user_id === userId)
    .map(link => link.resgate_id);

  // 2. Buscar resgates
  const userResgates = resgates.filter(resgate => resgateIds.includes(resgate.id));

  // 3. Para cada resgate, buscar os brindes
  return userResgates.map(resgate => {
    const brindeIds = resgatesBrindeLnk
      .filter(link => link.resgate_id === resgate.id)
      .map(link => link.brinde_id);

    const regateBrindes = brindes.filter(
      brinde => brindeIds.includes(brinde.id) && brinde.published_at !== null
    );

    return {
      ...resgate,
      brindes: regateBrindes
    };
  });
};

/**
 * Obtém usuários que resgataram um brinde
 * Relação reversa: brindes[id] ←── resgates[id] ←── up_users[id]
 */
export const getUsersByBrinde = (data, brindeId) => {
  if (!data || !data.tables) return [];

  const usuarios = data.tables.up_users?.data || [];
  const resgatesBrindeLnk = data.tables.resgates_brinde_lnk?.data || [];
  const resgatesUsuariosLnk = data.tables.resgates_users_permissions_user_lnk?.data || [];

  // 1. Buscar resgate_ids do brinde
  const resgateIds = resgatesBrindeLnk
    .filter(link => link.brinde_id === brindeId)
    .map(link => link.resgate_id);

  // 2. Buscar user_ids dos resgates
  const userIds = resgatesUsuariosLnk
    .filter(link => resgateIds.includes(link.resgate_id))
    .map(link => link.user_id);

  // 3. Retornar usuários únicos
  const uniqueUserIds = [...new Set(userIds)];
  return usuarios.filter(user => uniqueUserIds.includes(user.id));
};

/**
 * Obtém avaliações de uma ativação
 * Relação: ativacoes[id] ─── 1?? ─── avaliacao_de_ativacaos[id]
 * Via: avaliacao_de_ativacaos_ativacao_lnk
 */
export const getAvaliacoesByAtivacao = (data, ativacaoId) => {
  if (!data || !data.tables) return [];

  const avaliacoes = data.tables.avaliacao_de_ativacaos?.data || [];
  const avaliacoesAtivacaoLnk = data.tables.avaliacao_de_ativacaos_ativacao_lnk?.data || [];

  // Buscar avaliacao_ids da ativação
  const avaliacaoIds = avaliacoesAtivacaoLnk
    .filter(link => link.ativacao_id === ativacaoId)
    .map(link => link.avaliacao_de_ativacao_id);

  // Retornar avaliações
  return avaliacoes.filter(
    avaliacao => avaliacaoIds.includes(avaliacao.id) && avaliacao.published_at !== null
  );
};

/**
 * Obtém avaliações de um usuário
 * Relação: up_users[id] ─── 1?? ─── avaliacao_de_ativacaos[id]
 * Via: avaliacao_de_ativacaos_users_permissions_user_lnk
 */
export const getAvaliacoesByUser = (data, userId) => {
  if (!data || !data.tables) return [];

  const avaliacoes = data.tables.avaliacao_de_ativacaos?.data || [];
  const avaliacoesUsuariosLnk = data.tables.avaliacao_de_ativacaos_users_permissions_user_lnk?.data || [];

  // Buscar avaliacao_ids do usuário
  const avaliacaoIds = avaliacoesUsuariosLnk
    .filter(link => link.user_id === userId)
    .map(link => link.avaliacao_de_ativacao_id);

  // Retornar avaliações
  return avaliacoes.filter(
    avaliacao => avaliacaoIds.includes(avaliacao.id) && avaliacao.published_at !== null
  );
};

/**
 * Obtém números da sorte de um usuário
 * Relação: up_users[id] ─── 1?? ─── numero_da_sortes[id]
 * Via: numero_da_sortes_users_permissions_user_lnk
 */
export const getNumerosDaSorteByUser = (data, userId) => {
  if (!data || !data.tables) return [];

  const numerosDaSorte = data.tables.numero_da_sortes?.data || [];
  const numerosUsuariosLnk = data.tables.numero_da_sortes_users_permissions_user_lnk?.data || [];

  // Buscar numero_da_sorte_ids do usuário
  const numeroIds = numerosUsuariosLnk
    .filter(link => link.user_id === userId)
    .map(link => link.numero_da_sorte_id);

  // Retornar números da sorte
  return numerosDaSorte.filter(
    numero => numeroIds.includes(numero.id) && numero.published_at !== null
  );
};

/**
 * Obtém chute de moeda de um usuário
 * Relação: up_users[id] ─── 1?1 ─── chute_moedas[id]
 * Via: up_users_chute_moeda_lnk
 */
export const getChuteMoedaByUser = (data, userId) => {
  if (!data || !data.tables) return null;

  const chuteMoedas = data.tables.chute_moedas?.data || [];
  const chuteMoedasLnk = data.tables.up_users_chute_moeda_lnk?.data || [];

  // Buscar chute_moeda_id do usuário
  const link = chuteMoedasLnk.find(link => link.user_id === userId);
  if (!link) return null;

  // Retornar chute de moeda
  return chuteMoedas.find(
    chute => chute.id === link.chute_moedar_id && chute.published_at !== null
  ) || null;
};

/**
 * Obtém pesquisa de experiência de um usuário
 * Relação: up_users[id] ─── 1?1 ─── pesquisa_experiencias[id]
 * Via: pesquisa_experiencias_users_permissions_user_lnk
 */
export const getPesquisaExperienciaByUser = (data, userId) => {
  if (!data || !data.tables) return null;

  const pesquisas = data.tables.pesquisa_experiencias?.data || [];
  const pesquisasLnk = data.tables.pesquisa_experiencias_users_permissions_user_lnk?.data || [];

  // Buscar pesquisa_id do usuário
  const link = pesquisasLnk.find(link => link.user_id === userId);
  if (!link) return null;

  // Retornar pesquisa
  return pesquisas.find(
    pesquisa => pesquisa.id === link.pesquisa_experiencias_id && pesquisa.published_at !== null
  ) || null;
};

// ==================== FUNÇÕES AGREGADAS ====================

/**
 * Obtém perfil completo de um usuário (todos os dados relacionados)
 */
export const getUserProfile = (data, userId) => {
  if (!data || !data.tables) return null;

  const usuario = data.tables.up_users?.data?.find(u => u.id === userId);
  if (!usuario) return null;

  return {
    ...usuario,
    checkins: getCheckInsByUser(data, userId),
    resgates: getResgatesByUser(data, userId),
    numerosDaSorte: getNumerosDaSorteByUser(data, userId),
    avaliacoes: getAvaliacoesByUser(data, userId),
    chuteMoeda: getChuteMoedaByUser(data, userId),
    pesquisaExperiencia: getPesquisaExperienciaByUser(data, userId)
  };
};

/**
 * Obtém estatísticas completas de uma ativação
 */
export const getAtivacaoStats = (data, ativacaoId) => {
  if (!data || !data.tables) return null;

  const ativacao = data.tables.ativacoes?.data?.find(a => a.id === ativacaoId);
  if (!ativacao) return null;

  const usuarios = getUsersByAtivacao(data, ativacaoId);
  const avaliacoes = getAvaliacoesByAtivacao(data, ativacaoId);
  const evento = getEventoByAtivacao(data, ativacaoId);

  // Calcular média de avaliações
  const notasValidas = avaliacoes
    .map(av => parseInt(av.avaliacao))
    .filter(nota => !isNaN(nota));

  const mediaAvaliacao = notasValidas.length > 0
    ? notasValidas.reduce((sum, nota) => sum + nota, 0) / notasValidas.length
    : 0;

  return {
    ...ativacao,
    totalUsuarios: usuarios.length,
    totalAvaliacoes: avaliacoes.length,
    mediaAvaliacao: Math.round(mediaAvaliacao * 10) / 10,
    evento: evento,
    usuarios: usuarios,
    avaliacoes: avaliacoes
  };
};

/**
 * Obtém estatísticas completas de um evento
 */
export const getEventoStats = (data, eventoId) => {
  if (!data || !data.tables) return null;

  const evento = data.tables.eventos?.data?.find(e => e.id === eventoId);
  if (!evento) return null;

  const ativacoes = getAtivacoesByEvento(data, eventoId);
  const cliente = getClienteByEvento(data, eventoId);

  // Calcular total de check-ins do evento
  const checkinsAtivacaoLnk = data.tables.checkins_ativacao_lnk?.data || [];
  const ativacaoIds = ativacoes.map(a => a.id);
  const totalCheckins = checkinsAtivacaoLnk.filter(
    link => ativacaoIds.includes(link.ativacao_id)
  ).length;

  // Calcular usuários únicos do evento
  const todosUsuarios = ativacoes.flatMap(ativacao =>
    getUsersByAtivacao(data, ativacao.id)
  );
  const usuariosUnicos = [...new Set(todosUsuarios.map(u => u.id))];

  return {
    ...evento,
    cliente: cliente,
    totalAtivacoes: ativacoes.length,
    totalCheckins: totalCheckins,
    totalUsuariosUnicos: usuariosUnicos.length,
    ativacoes: ativacoes
  };
};
