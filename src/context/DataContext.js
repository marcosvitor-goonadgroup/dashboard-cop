import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { fetchAllData } from "../service/ApiBase";
import * as DataRelations from "./DataRelations";

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const result = await fetchAllData();
        setData(result);
        setError(null);
      } catch (err) {
        setError(err);
        console.error("Erro ao carregar dados:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Fun��o para atualizar filtros
  const updateFilters = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  // Fun��o para obter dados filtrados
  const getFilteredData = useCallback(() => {
    if (!data || !data.tables) return null;

    // Se n�o h� filtros, retorna todos os dados
    if (Object.keys(filters).length === 0) {
      return data.tables;
    }

    // Fun��o auxiliar para calcular idade
    const calcularIdade = (dataNascimento) => {
      if (!dataNascimento) return null;
      const hoje = new Date();
      const nascimento = new Date(dataNascimento);
      const diffAnos = hoje.getFullYear() - nascimento.getFullYear();
      const diffMeses = hoje.getMonth() - nascimento.getMonth();
      const diffDias = hoje.getDate() - nascimento.getDate();

      // Calcula a idade exata considerando mês e dia
      let idade = diffAnos;
      if (diffMeses < 0 || (diffMeses === 0 && diffDias < 0)) {
        idade--;
      }
      return idade;
    };

    // Fun��o auxiliar para determinar faixa et�ria
    const determinarFaixaEtaria = (dataNascimento) => {
      const idade = calcularIdade(dataNascimento);

      if (idade === null) return 'naoInformado';
      if (idade < 18) return 'menor18';
      if (idade >= 18 && idade <= 24) return '18-24';
      if (idade >= 25 && idade <= 40) return '25-40';
      if (idade >= 41 && idade <= 59) return '41-59';
      if (idade >= 60) return '60+';

      return 'naoInformado';
    };

    // Aplicar filtros nas tabelas - criar c�pias profundas
    const filteredTables = JSON.parse(JSON.stringify(data.tables));

    // PASSO 1: Filtrar usu�rios por tenho_conta e faixa et�ria
    let usuariosFiltradosIds = null;

    // Filtrar por conta BB
    if (filters.temContaBB !== undefined && filters.temContaBB !== null && filters.temContaBB !== '') {
      if (filteredTables.up_users?.data) {
        const usuariosFiltrados = filteredTables.up_users.data.filter(
          user => user.tenho_conta === (filters.temContaBB === 'true' || filters.temContaBB === true)
        );
        usuariosFiltradosIds = new Set(usuariosFiltrados.map(u => u.id));
      }
    }

    // Filtrar por faixa et�ria
    if (filters.faixaEtaria) {
      if (filteredTables.up_users?.data) {
        const usuariosFiltradosPorFaixa = filteredTables.up_users.data.filter(user => {
          const faixaDoUsuario = determinarFaixaEtaria(user.data_usuario);
          return faixaDoUsuario === filters.faixaEtaria;
        });

        const idsFaixa = new Set(usuariosFiltradosPorFaixa.map(u => u.id));

        if (usuariosFiltradosIds) {
          // Interseção dos dois filtros
          usuariosFiltradosIds = new Set([...usuariosFiltradosIds].filter(id => idsFaixa.has(id)));
        } else {
          usuariosFiltradosIds = idsFaixa;
        }
      }
    }

    // PASSO 2: Filtrar por ativa��o selecionada
    if (filters.ativacaoSelecionada) {
      // Filtrar checkins_ativacao_lnk pela ativa��o selecionada
      if (filteredTables.checkins_ativacao_lnk?.data) {
        filteredTables.checkins_ativacao_lnk.data =
          filteredTables.checkins_ativacao_lnk.data.filter(link =>
            link.ativacao_id === filters.ativacaoSelecionada
          );

        // Obter IDs dos checkins da ativa��o selecionada
        const checkinIdsAtivacao = new Set(
          filteredTables.checkins_ativacao_lnk.data.map(link => link.checkin_id)
        );

        // Filtrar checkins
        if (filteredTables.checkins?.data) {
          filteredTables.checkins.data = filteredTables.checkins.data.filter(checkin =>
            checkinIdsAtivacao.has(checkin.id)
          );
        }

        // Filtrar checkins_users_permissions_user_lnk para manter consist�ncia
        if (filteredTables.checkins_users_permissions_user_lnk?.data) {
          filteredTables.checkins_users_permissions_user_lnk.data =
            filteredTables.checkins_users_permissions_user_lnk.data.filter(link =>
              checkinIdsAtivacao.has(link.checkin_id)
            );

          // Obter IDs dos usu�rios que fizeram checkin nessa ativa��o
          const userIdsAtivacao = new Set(
            filteredTables.checkins_users_permissions_user_lnk.data.map(link => link.user_id)
          );

          // Filtrar resgates para manter apenas dos usu�rios da ativa��o
          if (filteredTables.resgates_users_permissions_user_lnk?.data) {
            filteredTables.resgates_users_permissions_user_lnk.data =
              filteredTables.resgates_users_permissions_user_lnk.data.filter(link =>
                userIdsAtivacao.has(link.user_id)
              );

            const resgateIds = new Set(
              filteredTables.resgates_users_permissions_user_lnk.data.map(link => link.resgate_id)
            );

            if (filteredTables.resgates?.data) {
              filteredTables.resgates.data = filteredTables.resgates.data.filter(resgate =>
                resgateIds.has(resgate.id)
              );
            }
          }
        }
      }
    }

    // PASSO 3: Se h� filtro de usu�rio, propagar para checkins e resgates
    if (usuariosFiltradosIds) {
      // Filtrar checkins_users_permissions_user_lnk
      if (filteredTables.checkins_users_permissions_user_lnk?.data) {
        filteredTables.checkins_users_permissions_user_lnk.data =
          filteredTables.checkins_users_permissions_user_lnk.data.filter(link =>
            usuariosFiltradosIds.has(link.user_id)
          );

        // Obter IDs dos checkins dos usu�rios filtrados
        const checkinIdsFiltrados = new Set(
          filteredTables.checkins_users_permissions_user_lnk.data.map(link => link.checkin_id)
        );

        // Filtrar tabela checkins
        if (filteredTables.checkins?.data) {
          filteredTables.checkins.data = filteredTables.checkins.data.filter(checkin =>
            checkinIdsFiltrados.has(checkin.id)
          );
        }

        // Filtrar checkins_ativacao_lnk para manter consist�ncia
        if (filteredTables.checkins_ativacao_lnk?.data) {
          filteredTables.checkins_ativacao_lnk.data =
            filteredTables.checkins_ativacao_lnk.data.filter(link =>
              checkinIdsFiltrados.has(link.checkin_id)
            );
        }
      }

      // Filtrar resgates_users_permissions_user_lnk
      if (filteredTables.resgates_users_permissions_user_lnk?.data) {
        filteredTables.resgates_users_permissions_user_lnk.data =
          filteredTables.resgates_users_permissions_user_lnk.data.filter(link =>
            usuariosFiltradosIds.has(link.user_id)
          );

        // Obter IDs dos resgates dos usu�rios filtrados
        const resgateIdsFiltrados = new Set(
          filteredTables.resgates_users_permissions_user_lnk.data.map(link => link.resgate_id)
        );

        // Filtrar tabela resgates
        if (filteredTables.resgates?.data) {
          filteredTables.resgates.data = filteredTables.resgates.data.filter(resgate =>
            resgateIdsFiltrados.has(resgate.id)
          );
        }
      }
    }

    return filteredTables;
  }, [data, filters]);

  // Fun��o para obter m�tricas processadas
  const getMetrics = useCallback(() => {
    const filteredData = getFilteredData();
    if (!filteredData) {
      return {
        totalUsuariosComAtivacoes: 0,
        totalCheckins: 0,
        totalResgates: 0,
        totalAtivacoes: 0,
        mediaGeralAvaliacoes: 0
      };
    }

    const checkins = filteredData.checkins?.data || [];
    const resgates = filteredData.resgates?.data || [];
    const ativacoes = filteredData.ativacoes?.data || [];
    const checkinsUsuariosLnk = filteredData.checkins_users_permissions_user_lnk?.data || [];
    const avaliacoes = filteredData.avaliacao_de_ativacaos?.data || [];

    // Usu�rios �nicos com check-in
    const usuariosComCheckin = new Set(checkinsUsuariosLnk.map(link => link.user_id));

    // Calcular m�dia geral das avalia��es
    const avaliacoesValidas = avaliacoes.filter(a =>
      a.avaliacao !== null &&
      a.avaliacao !== undefined &&
      a.published_at !== null
    );

    const somaAvaliacoes = avaliacoesValidas.reduce((acc, a) => acc + parseFloat(a.avaliacao), 0);
    const mediaGeralAvaliacoes = avaliacoesValidas.length > 0
      ? parseFloat((somaAvaliacoes / avaliacoesValidas.length).toFixed(2))
      : 0;

    return {
      totalUsuariosComAtivacoes: usuariosComCheckin.size,
      totalCheckins: checkins.length,
      totalResgates: resgates.length,
      totalAtivacoes: ativacoes.filter(a => a.published_at !== null).length,
      mediaGeralAvaliacoes: mediaGeralAvaliacoes
    };
  }, [getFilteredData]);

  // Fun��o para obter valores �nicos de uma coluna/campo
  const getUniqueValues = useCallback((tableName, fieldName) => {
    if (!data || !data.tables || !data.tables[tableName]) return [];

    const tableData = data.tables[tableName].data || [];
    const uniqueValues = [...new Set(
      tableData
        .map(row => row[fieldName])
        .filter(value => value !== null && value !== undefined && value !== "")
    )];

    return uniqueValues.sort();
  }, [data]);

  // Fun��o para obter dados de check-ins por ativa��o
  const getCheckInsPorAtivacao = useCallback(() => {
    const filteredData = getFilteredData();
    if (!filteredData) return [];

    const ativacoes = filteredData.ativacoes?.data || [];
    const checkinsAtivacaoLnk = filteredData.checkins_ativacao_lnk?.data || [];
    const avaliacaoAtivacaoLnk = filteredData.avaliacao_de_ativacaos_ativacao_lnk?.data || [];
    const avaliacoes = filteredData.avaliacao_de_ativacaos?.data || [];

    // IMPORTANTE: Filtrar apenas ativações publicadas para evitar duplicações
    const ativacoesPublicadas = ativacoes.filter(a => a.published_at !== null);
    const idsPublicados = new Set(ativacoesPublicadas.map(a => a.id));

    // Agrupar check-ins por ativa��o (apenas das ativações publicadas)
    const checkinsPorAtivacao = {};
    checkinsAtivacaoLnk.forEach(link => {
      const ativacaoId = link.ativacao_id;
      // Só contar check-ins de ativações publicadas
      if (idsPublicados.has(ativacaoId)) {
        if (!checkinsPorAtivacao[ativacaoId]) {
          checkinsPorAtivacao[ativacaoId] = 0;
        }
        checkinsPorAtivacao[ativacaoId]++;
      }
    });

    // Agrupar avalia��es por ativa��o e calcular m�dia
    const mediaAvaliacoesPorAtivacao = {};
    avaliacaoAtivacaoLnk.forEach(link => {
      const ativacaoId = link.ativacao_id;
      const avaliacaoId = link.avaliacao_de_ativacao_id;

      // Só processar avaliações de ativações publicadas
      if (idsPublicados.has(ativacaoId)) {
        // Buscar a avalia��o correspondente
        const avaliacao = avaliacoes.find(a => a.id === avaliacaoId);

        if (avaliacao && avaliacao.avaliacao !== null && avaliacao.avaliacao !== undefined) {
          if (!mediaAvaliacoesPorAtivacao[ativacaoId]) {
            mediaAvaliacoesPorAtivacao[ativacaoId] = {
              soma: 0,
              count: 0
            };
          }
          mediaAvaliacoesPorAtivacao[ativacaoId].soma += parseFloat(avaliacao.avaliacao);
          mediaAvaliacoesPorAtivacao[ativacaoId].count++;
        }
      }
    });

    // Calcular m�dia final para cada ativa��o
    const mediaFinalPorAtivacao = {};
    Object.entries(mediaAvaliacoesPorAtivacao).forEach(([ativacaoId, data]) => {
      mediaFinalPorAtivacao[ativacaoId] = data.count > 0
        ? parseFloat((data.soma / data.count).toFixed(2))
        : 0;
    });

    // Criar array com informa��es das ativa��es
    const chartData = Object.entries(checkinsPorAtivacao).map(([ativacaoId, count]) => {
      const ativacao = ativacoesPublicadas.find(a => a.id === parseInt(ativacaoId));

      return {
        id: parseInt(ativacaoId),
        nome: ativacao?.nome || `Ativa��o ${ativacaoId}`,
        checkins: count,
        mediaAvaliacao: mediaFinalPorAtivacao[ativacaoId] || 0,
        tipo: ativacao?.tipo || null,
        local: ativacao?.local || null,
        pontuacao: ativacao?.pontuacao || 0
      };
    });

    // Ordenar por n�mero de check-ins (decrescente)
    return chartData.sort((a, b) => b.checkins - a.checkins);
  }, [getFilteredData]);

  // Fun��o para obter dados de check-ins por dia
  const getCheckInsPorDia = useCallback(() => {
    const filteredData = getFilteredData();
    if (!filteredData) return [];

    const checkins = filteredData.checkins?.data || [];
    const avaliacoes = filteredData.avaliacao_de_ativacaos?.data || [];
    const avaliacaoUsuarioLnk = filteredData.avaliacao_de_ativacaos_users_permissions_user_lnk?.data || [];
    const checkinsUsuariosLnk = filteredData.checkins_users_permissions_user_lnk?.data || [];

    // Agrupar check-ins por dia
    const checkinsPorDia = {};
    const usuariosPorDia = {}; // Para armazenar usuários que fizeram check-in em cada dia

    checkins.forEach(checkin => {
      if (!checkin.created_at) return;

      // Extrair data no formato YYYY-MM-DD
      const data = new Date(checkin.created_at);
      const dataFormatada = data.toISOString().split('T')[0];

      if (!checkinsPorDia[dataFormatada]) {
        checkinsPorDia[dataFormatada] = 0;
        usuariosPorDia[dataFormatada] = new Set();
      }

      checkinsPorDia[dataFormatada]++;

      // Buscar usuário do check-in
      const linkUsuario = checkinsUsuariosLnk.find(link => link.checkin_id === checkin.id);
      if (linkUsuario) {
        usuariosPorDia[dataFormatada].add(linkUsuario.user_id);
      }
    });

    // Calcular média de avaliações por dia
    const mediaAvaliacoesPorDia = {};
    Object.keys(usuariosPorDia).forEach(data => {
      const usuariosIds = Array.from(usuariosPorDia[data]);

      // Buscar avaliações desses usuários
      const avaliacoesDosDia = [];
      usuariosIds.forEach(userId => {
        const linksAvaliacao = avaliacaoUsuarioLnk.filter(link => link.user_id === userId);
        linksAvaliacao.forEach(link => {
          const avaliacao = avaliacoes.find(a => a.id === link.avaliacao_de_ativacao_id);
          if (avaliacao && avaliacao.avaliacao !== null && avaliacao.avaliacao !== undefined) {
            // Verificar se a avaliação foi feita no mesmo dia
            if (avaliacao.created_at) {
              const dataAvaliacao = new Date(avaliacao.created_at).toISOString().split('T')[0];
              if (dataAvaliacao === data) {
                avaliacoesDosDia.push(parseFloat(avaliacao.avaliacao));
              }
            }
          }
        });
      });

      // Calcular média
      if (avaliacoesDosDia.length > 0) {
        const soma = avaliacoesDosDia.reduce((acc, val) => acc + val, 0);
        mediaAvaliacoesPorDia[data] = parseFloat((soma / avaliacoesDosDia.length).toFixed(2));
      } else {
        mediaAvaliacoesPorDia[data] = 0;
      }
    });

    // Criar array com dados formatados
    const chartData = Object.entries(checkinsPorDia).map(([data, count]) => {
      const dataObj = new Date(data + 'T00:00:00');
      const dataFormatada = dataObj.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });

      return {
        data: data,
        dataFormatada: dataFormatada,
        checkins: count,
        mediaAvaliacao: mediaAvaliacoesPorDia[data] || 0
      };
    });

    // Ordenar por data (crescente)
    return chartData.sort((a, b) => new Date(a.data) - new Date(b.data));
  }, [getFilteredData]);

  // Fun��o para obter picos de hor�rio de check-ins
  const getPicosPorHorario = useCallback((dataSelecionada = null) => {
    const filteredData = getFilteredData();
    if (!filteredData) return { chartData: [], datasDisponiveis: [] };

    const checkins = filteredData.checkins?.data || [];

    // Extrair todas as datas dispon�veis (�nicas)
    const datasDisponiveis = [...new Set(
      checkins
        .filter(checkin => checkin.created_at)
        .map(checkin => new Date(checkin.created_at).toISOString().split('T')[0])
    )].sort();

    // Filtrar check-ins pela data selecionada (se houver)
    let checkinsFiltrados = checkins;
    if (dataSelecionada) {
      checkinsFiltrados = checkins.filter(checkin => {
        if (!checkin.created_at) return false;
        const dataCheckin = new Date(checkin.created_at).toISOString().split('T')[0];
        return dataCheckin === dataSelecionada;
      });
    }

    // Agrupar por hora (0-23)
    const contadorPorHora = {};
    for (let i = 0; i < 24; i++) {
      contadorPorHora[i] = 0;
    }

    checkinsFiltrados.forEach(checkin => {
      if (!checkin.created_at) return;

      const dataHora = new Date(checkin.created_at);
      const hora = dataHora.getHours();
      contadorPorHora[hora]++;
    });

    // Criar array de dados para o gr�fico
    const chartData = Object.entries(contadorPorHora).map(([hora, count]) => ({
      hora: parseInt(hora),
      horaFormatada: `${String(hora).padStart(2, '0')}:00`,
      'check-ins': count
    }));

    return {
      chartData,
      datasDisponiveis: datasDisponiveis.map(data => {
        const dataObj = new Date(data + 'T00:00:00');
        return {
          valor: data,
          label: dataObj.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          })
        };
      })
    };
  }, [getFilteredData]);

  // Fun��o para obter dados de resgates por brinde
  const getResgatesPorBrinde = useCallback(() => {
    const filteredData = getFilteredData();
    if (!filteredData) return [];

    const brindes = filteredData.brindes?.data || [];
    const resgatesBrindeLnk = filteredData.resgates_brinde_lnk?.data || [];

    // Agrupar resgates por brinde
    const resgatesPorBrinde = {};
    resgatesBrindeLnk.forEach(link => {
      const brindeId = link.brinde_id;
      if (!resgatesPorBrinde[brindeId]) {
        resgatesPorBrinde[brindeId] = 0;
      }
      resgatesPorBrinde[brindeId]++;
    });

    // Criar array com informa��es dos brindes
    const chartData = Object.entries(resgatesPorBrinde).map(([brindeId, count]) => {
      const brinde = brindes.find(b =>
        b.id === parseInt(brindeId) && b.published_at !== null
      );

      return {
        id: parseInt(brindeId),
        titulo: brinde ? brinde.titulo : `Brinde ${brindeId}`,
        resgates: count,
        pontos: brinde?.pontos || 0,
        estoque: brinde?.estoque || 0
      };
    });

    // Ordenar por n�mero de resgates (decrescente)
    return chartData.sort((a, b) => b.resgates - a.resgates);
  }, [getFilteredData]);

  // Fun��o para obter estat�sticas de filtros
  const getFilterStats = useCallback(() => {
    const allData = data?.tables || {};
    const filteredData = getFilteredData() || {};

    const totalCheckins = allData.checkins?.data?.length || 0;
    const filteredCheckins = filteredData.checkins?.data?.length || 0;

    return {
      total: totalCheckins,
      filtered: filteredCheckins,
      percentage: totalCheckins > 0 ? Math.round((filteredCheckins / totalCheckins) * 100) : 0,
      hasActiveFilters: Object.keys(filters).length > 0
    };
  }, [data, filters, getFilteredData]);

  // Fun��o para obter dados do funil de atividades
  const getFunnelData = useCallback(() => {
    const filteredData = getFilteredData();
    if (!filteredData) return [];

    const usuarios = filteredData.up_users?.data || [];
    const checkins = filteredData.checkins?.data || [];
    const resgates = filteredData.resgates?.data || [];
    const pesquisas = filteredData.pesquisa_experiencias?.data || [];

    // Contar totais de cada tabela
    const totalUsuarios = usuarios.length;
    const totalCheckins = checkins.length;
    const totalResgates = resgates.length;
    const totalPesquisas = pesquisas.length;

    // Encontrar o maior valor para calcular as larguras proporcionais
    const maiorValor = Math.max(totalUsuarios, totalCheckins, totalResgates, totalPesquisas);

    return [
      {
        etapa: 'Usuários Cadastrados',
        quantidade: totalUsuarios,
        percentual: maiorValor > 0 ? Math.round((totalUsuarios / maiorValor) * 100) : 0,
        cor: '#0d6efd'
      },
      {
        etapa: 'Check-ins Realizados',
        quantidade: totalCheckins,
        percentual: maiorValor > 0 ? Math.round((totalCheckins / maiorValor) * 100) : 0,
        cor: '#198754'
      },
      {
        etapa: 'Resgates',
        quantidade: totalResgates,
        percentual: maiorValor > 0 ? Math.round((totalResgates / maiorValor) * 100) : 0,
        cor: '#dc3545'
      },
      {
        etapa: 'Pesquisa de Experiência',
        quantidade: totalPesquisas,
        percentual: maiorValor > 0 ? Math.round((totalPesquisas / maiorValor) * 100) : 0,
        cor: '#ffc107'
      }
    ];
  }, [getFilteredData]);

  // Fun��o para obter distribui��o por faixa et�ria
  const getDistribuicaoFaixaEtaria = useCallback(() => {
    const filteredData = getFilteredData();
    if (!filteredData) return [];

    // Obter IDs dos usu�rios que fizeram check-in
    const checkinsUsuariosLnk = filteredData.checkins_users_permissions_user_lnk?.data || [];
    const usuariosComCheckinIds = new Set(checkinsUsuariosLnk.map(link => link.user_id));

    // Filtrar apenas usu�rios que fizeram check-in
    const usuarios = (filteredData.up_users?.data || []).filter(user =>
      usuariosComCheckinIds.has(user.id)
    );

    // Fun��o auxiliar para calcular idade
    const calcularIdade = (dataNascimento) => {
      if (!dataNascimento) return null;
      const hoje = new Date();
      const nascimento = new Date(dataNascimento);
      const diffAnos = hoje.getFullYear() - nascimento.getFullYear();
      const diffMeses = hoje.getMonth() - nascimento.getMonth();
      const diffDias = hoje.getDate() - nascimento.getDate();

      let idade = diffAnos;
      if (diffMeses < 0 || (diffMeses === 0 && diffDias < 0)) {
        idade--;
      }
      return idade;
    };

    // Fun��o auxiliar para determinar faixa et�ria
    const determinarFaixaEtaria = (dataNascimento) => {
      const idade = calcularIdade(dataNascimento);

      if (idade === null) return 'naoInformado';
      if (idade < 18) return 'menor18';
      if (idade >= 18 && idade <= 24) return '18-24';
      if (idade >= 25 && idade <= 40) return '25-40';
      if (idade >= 41 && idade <= 59) return '41-59';
      if (idade >= 60) return '60+';

      return 'naoInformado';
    };

    // Contar por faixa et�ria
    const contadorFaixas = {
      'menor18': 0,
      '18-24': 0,
      '25-40': 0,
      '41-59': 0,
      '60+': 0,
      'naoInformado': 0
    };

    usuarios.forEach(user => {
      const faixa = determinarFaixaEtaria(user.data_usuario);
      contadorFaixas[faixa]++;
    });

    const total = usuarios.length;

    // Mapear para labels amig�veis
    const labelsMap = {
      'menor18': 'Menor de 18 anos',
      '18-24': '18 a 24 anos',
      '25-40': '25 a 40 anos',
      '41-59': '41 a 59 anos',
      '60+': '60 anos ou mais',
      'naoInformado': 'Não informado'
    };

    return Object.entries(contadorFaixas).map(([faixa, quantidade]) => ({
      faixa,
      label: labelsMap[faixa],
      quantidade,
      percentual: total > 0 ? parseFloat(((quantidade / total) * 100).toFixed(1)) : 0
    }));
  }, [getFilteredData]);

  // Fun��o para obter distribui��o da base (clientes BB vs n�o clientes)
  const getDistribuicaoBase = useCallback(() => {
    const filteredData = getFilteredData();
    if (!filteredData) return { comConta: 0, semConta: 0, comContaPerc: 0, semContaPerc: 0 };

    // Obter IDs dos usu�rios que fizeram check-in
    const checkinsUsuariosLnk = filteredData.checkins_users_permissions_user_lnk?.data || [];
    const usuariosComCheckinIds = new Set(checkinsUsuariosLnk.map(link => link.user_id));

    // Filtrar apenas usu�rios que fizeram check-in
    const usuarios = (filteredData.up_users?.data || []).filter(user =>
      usuariosComCheckinIds.has(user.id)
    );

    const comConta = usuarios.filter(user => user.tenho_conta === true).length;
    const semConta = usuarios.filter(user => user.tenho_conta === false).length;
    const total = usuarios.length;

    return {
      comConta,
      semConta,
      total,
      comContaPerc: total > 0 ? parseFloat(((comConta / total) * 100).toFixed(1)) : 0,
      semContaPerc: total > 0 ? parseFloat(((semConta / total) * 100).toFixed(1)) : 0
    };
  }, [getFilteredData]);

  // Fun��o para obter an�lise da pesquisa de experi�ncia
  const getAnalisePesquisa = useCallback(() => {
    const filteredData = getFilteredData();
    if (!filteredData) return null;

    const pesquisas = filteredData.pesquisa_experiencias?.data || [];
    const pesquisasUsuariosLnk = filteredData.pesquisa_experiencias_users_permissions_user_lnk?.data || [];
    const usuarios = filteredData.up_users?.data || [];

    // Fun��o auxiliar para calcular m�dia e grau de satisfa��o
    const calcularEstatisticas = (valores) => {
      if (valores.length === 0) return { media: 0, grau: 0, total: 0 };
      const soma = valores.reduce((acc, val) => acc + val, 0);
      const media = soma / valores.length;
      const grau = (media / 5) * 100;
      return {
        media: parseFloat(media.toFixed(2)),
        grau: parseFloat(grau.toFixed(1)),
        total: valores.length
      };
    };

    // Fun��o auxiliar para calcular percentual de notas 4 e 5 (Top 2 Box)
    const calcularTop2Box = (valores) => {
      if (valores.length === 0) return { percentual: 0, total: 0 };
      const notas4e5 = valores.filter(v => v >= 4).length;
      const percentual = (notas4e5 / valores.length) * 100;
      return {
        percentual: parseFloat(percentual.toFixed(1)),
        total: valores.length
      };
    };

    // ============================================
    // BLOCO DE CONHECIMENTO (Perguntas 1.1 e 1.2)
    // ============================================
    // Metodologia: 2/3 x % Associação Espontânea [1.1] + 1/3 x % Associação Estimulada [1.2]

    // 1.1 Espontânea - % que respondeu BB
    const respostasEspontaneas = pesquisas.filter(p => p.associacao_espontanea !== null);
    const respostasBBEspontanea = respostasEspontaneas.filter(p =>
      p.associacao_espontanea && p.associacao_espontanea.toLowerCase().includes('bb')
    ).length;
    const percEspontanea = respostasEspontaneas.length > 0
      ? (respostasBBEspontanea / respostasEspontaneas.length) * 100
      : 0;

    // 1.2 Estimulada - % que responderam BB sob o total de perguntados
    const respostasEstimuladas = pesquisas.filter(p => p.associacao_estimulada !== null);
    const respostasBBEstimulada = respostasEstimuladas.filter(p => p.associacao_estimulada === true).length;
    const percEstimulada = respostasEstimuladas.length > 0
      ? (respostasBBEstimulada / respostasEstimuladas.length) * 100
      : 0;

    // IEM Conhecimento = 2/3 x % Espontânea + 1/3 x % Estimulada
    const iemConhecimento = (2/3 * percEspontanea) + (1/3 * percEstimulada);

    const blocoConhecimento = {
      titulo: 'Bloco de Conhecimento',
      perguntas: [
        {
          pergunta: 'Associação Espontânea (% que respondeu BB)',
          percentual: parseFloat(percEspontanea.toFixed(1)),
          total: respostasEspontaneas.length
        },
        {
          pergunta: 'Associação Estimulada (% que respondeu BB)',
          percentual: parseFloat(percEstimulada.toFixed(1)),
          total: respostasEstimuladas.length
        }
      ],
      iem: parseFloat(iemConhecimento.toFixed(1))
    };

    // ============================================
    // BLOCO DE SATISFAÇÃO (Perguntas 4 e 5)
    // ============================================
    // Metodologia: Média dos aspectos [4] + (Grau de Satisfação Geral [5] x 3) / 4

    const comunicacaoDivulgacao = pesquisas.filter(p => p.comunicacao_divulgacao !== null).map(p => parseFloat(p.comunicacao_divulgacao));
    const estruturaAmbientacao = pesquisas.filter(p => p.estrutura_ambientacao !== null).map(p => parseFloat(p.estrutura_ambientacao));
    const atividadesConteudo = pesquisas.filter(p => p.atividades_conteudo !== null).map(p => parseFloat(p.atividades_conteudo));
    const avaliacaoGeral = pesquisas.filter(p => p.avaliacao_geral !== null).map(p => parseFloat(p.avaliacao_geral));

    // Média dos 3 aspectos
    const todosAspectos = [...comunicacaoDivulgacao, ...estruturaAmbientacao, ...atividadesConteudo];
    const mediaAspectos = todosAspectos.length > 0
      ? todosAspectos.reduce((acc, val) => acc + val, 0) / todosAspectos.length
      : 0;
    const grauAspectos = (mediaAspectos / 5) * 100;

    // Grau de Satisfação Geral
    const statsAvaliacaoGeral = calcularEstatisticas(avaliacaoGeral);
    const grauSatisfacaoGeral = statsAvaliacaoGeral.grau;

    // IEM Satisfação = (Média dos aspectos + Grau de Satisfação Geral x 3) / 4
    const iemSatisfacao = (grauAspectos + (grauSatisfacaoGeral * 3)) / 4;

    const blocoSatisfacao = {
      titulo: 'Bloco de Satisfação',
      perguntas: [
        {
          pergunta: 'Comunicação e Divulgação',
          ...calcularEstatisticas(comunicacaoDivulgacao)
        },
        {
          pergunta: 'Estrutura e ambientação',
          ...calcularEstatisticas(estruturaAmbientacao)
        },
        {
          pergunta: 'Atividades e Conteúdo',
          ...calcularEstatisticas(atividadesConteudo)
        },
        {
          pergunta: 'Como você avalia de forma geral a participação do BB na COP 30?',
          ...calcularEstatisticas(avaliacaoGeral)
        }
      ],
      iem: parseFloat(iemSatisfacao.toFixed(1))
    };

    // ============================================
    // BLOCO POSICIONAMENTO (Perguntas 6 e 7)
    // ============================================
    // Metodologia: Média simples dos dois statements

    const posicionamento1 = pesquisas.filter(p => p.posicionamento_socioambiental !== null).map(p => parseFloat(p.posicionamento_socioambiental));
    const posicionamento2 = pesquisas.filter(p => p.posicionamento_sustentabilidade !== null).map(p => parseFloat(p.posicionamento_sustentabilidade));

    const todosPosicionamento = [...posicionamento1, ...posicionamento2];
    const statsPosicionamento = calcularEstatisticas(todosPosicionamento);
    const iemPosicionamento = statsPosicionamento.grau;

    const blocoPosicionamento = {
      titulo: 'Bloco Posicionamento',
      perguntas: [
        {
          pergunta: 'As experiências proporcionadas pelo BB na COP 30 demonstram que o Banco está conectado com as necessidades e com o que está acontecendo com a sociedade no aspecto socioambiental?',
          ...calcularEstatisticas(posicionamento1)
        },
        {
          pergunta: 'As experiências proporcionadas pelo BB na COP 30 demonstram que o BB se preocupa comigo e com a sustentabilidade.',
          ...calcularEstatisticas(posicionamento2)
        }
      ],
      iem: parseFloat(iemPosicionamento.toFixed(1))
    };

    // ============================================
    // BLOCO TERRITÓRIOS (Perguntas 8 e 9)
    // ============================================
    // Metodologia: Média simples dos dois statements

    const territorios1 = pesquisas.filter(p => p.territorios_preservacao !== null).map(p => parseFloat(p.territorios_preservacao));
    const territorios2 = pesquisas.filter(p => p.territorios_debate !== null).map(p => parseFloat(p.territorios_debate));

    const todosTerritorios = [...territorios1, ...territorios2];
    const statsTerritorios = calcularEstatisticas(todosTerritorios);
    const iemTerritorios = statsTerritorios.grau;

    const blocoTerritorios = {
      titulo: 'Bloco Territórios',
      perguntas: [
        {
          pergunta: 'Você concorda que o BB promove Iniciativas que contribuem para a preservação e regeneração do meio-ambiente e dos biomas brasileiros, se adaptando às mudanças climáticas, econômicas e sociais do país?',
          ...calcularEstatisticas(territorios1)
        },
        {
          pergunta: 'Você concorda que o BB cria e incentiva conteúdos e eventos que promovem o debate sobre sustentabilidade e que estimulam práticas mais sustentáveis no dia a dia',
          ...calcularEstatisticas(territorios2)
        }
      ],
      iem: parseFloat(iemTerritorios.toFixed(1))
    };

    // ============================================
    // BLOCO DE INTENÇÃO DE RELACIONAMENTO (Perguntas 10.1 e 10.2)
    // ============================================
    // Metodologia: Soma das notas 4 e 5 (Top 2 Box)

    const intencaoCliente = pesquisas.filter(p => p.intencao_tornar_cliente !== null).map(p => parseFloat(p.intencao_tornar_cliente));
    const intencaoAmpliar = pesquisas.filter(p => p.intencao_ampliar_relacionamento !== null).map(p => parseFloat(p.intencao_ampliar_relacionamento));

    const todosIntencao = [...intencaoCliente, ...intencaoAmpliar];
    const top2BoxIntencao = calcularTop2Box(todosIntencao);
    const iemIntencao = top2BoxIntencao.percentual;

    const blocoIntencao = {
      titulo: 'Bloco de Intenção de Relacionamento',
      perguntas: [
        {
          pergunta: 'A sua experiência com o BB despertou em você a vontade de se tornar cliente do Banco?',
          ...calcularEstatisticas(intencaoCliente),
          ...calcularTop2Box(intencaoCliente)
        },
        {
          pergunta: 'A sua experiência com o BB despertou em você a vontade de ampliar seu relacionamento com o Banco?',
          ...calcularEstatisticas(intencaoAmpliar),
          ...calcularTop2Box(intencaoAmpliar)
        }
      ],
      iem: parseFloat(iemIntencao.toFixed(1))
    };

    // Coment�rios qualitativos
    const comentarios = pesquisas
      .filter(p => p.comentario_qualitativo && p.comentario_qualitativo.trim() !== '')
      .map(p => {
        // Buscar usu�rio da pesquisa
        const link = pesquisasUsuariosLnk.find(l => l.pesquisa_experiencia_id === p.id);
        const usuario = link ? usuarios.find(u => u.id === link.user_id) : null;

        // Fun��o para calcular idade
        const calcularIdade = (dataNascimento) => {
          if (!dataNascimento) return null;
          const hoje = new Date();
          const nascimento = new Date(dataNascimento);
          let idade = hoje.getFullYear() - nascimento.getFullYear();
          const m = hoje.getMonth() - nascimento.getMonth();
          if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
            idade--;
          }
          return idade;
        };

        // Determinar faixa et�ria
        const determinarFaixaEtaria = (dataNascimento) => {
          const idade = calcularIdade(dataNascimento);
          if (!idade) return 'Não informado';
          if (idade < 18) return 'Menor de 18 anos';
          if (idade <= 24) return 'Entre 18 e 24 anos';
          if (idade <= 40) return 'Entre 25 e 40 anos';
          if (idade <= 59) return 'Entre 41 e 59 anos';
          return '60 anos ou mais';
        };

        return {
          comentario: p.comentario_qualitativo,
          faixaEtaria: usuario ? determinarFaixaEtaria(usuario.data_usuario) : 'Não informado',
          clienteBB: usuario?.tenho_conta ? 'Sim' : 'Não',
          data: p.created_at
        };
      });

    // ============================================
    // CÁLCULO DO IEM GERAL
    // ============================================
    // IEM Geral = Média simples dos 5 blocos

    const iemGeral = (
      iemConhecimento +
      iemSatisfacao +
      iemPosicionamento +
      iemTerritorios +
      iemIntencao
    ) / 5;

    return {
      totalRespostas: pesquisas.length,
      iemGeral: parseFloat(iemGeral.toFixed(1)),
      blocoConhecimento,
      blocoSatisfacao,
      blocoPosicionamento,
      blocoTerritorios,
      blocoIntencao,
      comentarios
    };
  }, [getFilteredData]);

  // Fun��o para limpar todos os filtros
  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  // Wrapper functions para usar as funções de DataRelations com useCallback
  const getCheckInsByUser = useCallback((userId) => DataRelations.getCheckInsByUser(data, userId), [data]);
  const getAtivacoesByCheckin = useCallback((checkinId) => DataRelations.getAtivacoesByCheckin(data, checkinId), [data]);
  const getUsersByAtivacao = useCallback((ativacaoId) => DataRelations.getUsersByAtivacao(data, ativacaoId), [data]);
  const getAtivacoesByEvento = useCallback((eventoId) => DataRelations.getAtivacoesByEvento(data, eventoId), [data]);
  const getEventoByAtivacao = useCallback((ativacaoId) => DataRelations.getEventoByAtivacao(data, ativacaoId), [data]);
  const getClienteByEvento = useCallback((eventoId) => DataRelations.getClienteByEvento(data, eventoId), [data]);
  const getResgatesByUserRelation = useCallback((userId) => DataRelations.getResgatesByUser(data, userId), [data]);
  const getUsersByBrinde = useCallback((brindeId) => DataRelations.getUsersByBrinde(data, brindeId), [data]);
  const getAvaliacoesByAtivacao = useCallback((ativacaoId) => DataRelations.getAvaliacoesByAtivacao(data, ativacaoId), [data]);
  const getAvaliacoesByUser = useCallback((userId) => DataRelations.getAvaliacoesByUser(data, userId), [data]);
  const getNumerosDaSorteByUser = useCallback((userId) => DataRelations.getNumerosDaSorteByUser(data, userId), [data]);
  const getChuteMoedaByUser = useCallback((userId) => DataRelations.getChuteMoedaByUser(data, userId), [data]);
  const getPesquisaExperienciaByUser = useCallback((userId) => DataRelations.getPesquisaExperienciaByUser(data, userId), [data]);
  const getUserProfile = useCallback((userId) => DataRelations.getUserProfile(data, userId), [data]);
  const getAtivacaoStats = useCallback((ativacaoId) => DataRelations.getAtivacaoStats(data, ativacaoId), [data]);
  const getEventoStats = useCallback((eventoId) => DataRelations.getEventoStats(data, eventoId), [data]);

  const value = {
    // Estado
    data,
    loading,
    error,
    filters,

    // A��es
    updateFilters,
    clearFilters,

    // Dados processados
    getFilteredData,
    getMetrics,
    getUniqueValues,
    getCheckInsPorAtivacao,
    getCheckInsPorDia,
    getPicosPorHorario,
    getResgatesPorBrinde,
    getFilterStats,
    getFunnelData,
    getDistribuicaoFaixaEtaria,
    getDistribuicaoBase,
    getAnalisePesquisa,

    // Funções de navegação entre relações (baseadas em relacoes_app.csv)
    getCheckInsByUser,
    getAtivacoesByCheckin,
    getUsersByAtivacao,
    getAtivacoesByEvento,
    getEventoByAtivacao,
    getClienteByEvento,
    getResgatesByUserRelation,
    getUsersByBrinde,
    getAvaliacoesByAtivacao,
    getAvaliacoesByUser,
    getNumerosDaSorteByUser,
    getChuteMoedaByUser,
    getPesquisaExperienciaByUser,
    getUserProfile,
    getAtivacaoStats,
    getEventoStats
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
