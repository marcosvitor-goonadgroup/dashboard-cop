import { useState } from 'react';
import { BarChart, Bar, LineChart, Line, Area, AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useData } from '../context/DataContext';
import Filtros from '../components/Filtros';

const Dashboard = () => {
  const { loading, error, getMetrics, getCheckInsPorAtivacao, getCheckInsPorDia, getPicosPorHorario, getFunnelData, getDistribuicaoFaixaEtaria, getDistribuicaoBase, getAnalisePesquisa, filters, updateFilters } = useData();
  const [ativacaoSelecionada, setAtivacaoSelecionada] = useState(null);
  const [dataSelecionadaPicos, setDataSelecionadaPicos] = useState(null);

  // Obter métricas do contexto
  const metrics = getMetrics();

  // Obter dados de distribuição
  const distribuicaoFaixaEtaria = getDistribuicaoFaixaEtaria();
  const distribuicaoBase = getDistribuicaoBase();

  // Obter dados da pesquisa
  const dadosPesquisa = getAnalisePesquisa();

  // Obter dados do gráfico de ativações (Top 10)
  const chartData = getCheckInsPorAtivacao().slice(0, 10);

  // Obter dados do gráfico de check-ins por dia
  const chartDataPorDia = getCheckInsPorDia();

  // Obter dados de picos por horário
  const { chartData: chartDataPicos, datasDisponiveis: datasDisponiveisPicos } = getPicosPorHorario(dataSelecionadaPicos);

  // Obter dados do funil de conversão
  const funnelData = getFunnelData();

  // Handler para clicar na barra
  const handleBarClick = (data) => {
    if (ativacaoSelecionada === data.id) {
      // Se clicar na mesma ativação, desseleciona
      setAtivacaoSelecionada(null);
      const newFilters = { ...filters };
      delete newFilters.ativacaoSelecionada;
      updateFilters(newFilters);
    } else {
      // Seleciona nova ativação
      setAtivacaoSelecionada(data.id);
      updateFilters({
        ...filters,
        ativacaoSelecionada: data.id
      });
    }
  };

  // Tooltip customizado para gráfico de ativações
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="card shadow-sm" style={{ padding: '10px', border: '1px solid #ccc' }}>
          <p className="mb-1" style={{ fontWeight: 'bold' }}>{data.nome}</p>
          <p className="mb-1" style={{ color: '#0d6efd' }}>
            Check-ins: <strong>{data.checkins}</strong>
          </p>
          <p className="mb-0" style={{ color: '#ffc107' }}>
            Média Avaliação: <strong>{data.mediaAvaliacao.toFixed(2)}</strong> ⭐
          </p>
        </div>
      );
    }
    return null;
  };

  // Tooltip customizado para gráfico por dia
  const CustomTooltipPorDia = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="card shadow-sm" style={{ padding: '10px', border: '1px solid #ccc' }}>
          <p className="mb-1" style={{ fontWeight: 'bold' }}>{data.dataFormatada}</p>
          <p className="mb-1" style={{ color: '#198754' }}>
            Check-ins: <strong>{data.checkins}</strong>
          </p>
          <p className="mb-0" style={{ color: '#ffc107' }}>
            Média Avaliação: <strong>{data.mediaAvaliacao > 0 ? data.mediaAvaliacao.toFixed(2) : 'Sem avaliações'}</strong> {data.mediaAvaliacao > 0 && '⭐'}
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Erro ao carregar dados</h4>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* Logos Responsivas */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex flex-wrap justify-content-center align-items-center gap-3 gap-md-4">
            <img
              src="/images/COP30_Official_Logo.svg"
              alt="COP30 Logo"
              className="img-fluid"
              style={{
                height: 'auto',
                width: '100%',
                maxWidth: '150px',
                maxHeight: '120px',
                objectFit: 'contain'
              }}
            />
            <img
              src="/images/a_gente_importa_globo_1.webp"
              alt="A Gente Importa Globo"
              className="img-fluid"
              style={{
                height: 'auto',
                width: '100%',
                maxWidth: '150px',
                maxHeight: '120px',
                objectFit: 'contain'
              }}
            />
            <img
              src="/images/bb_logo.webp"
              alt="Banco do Brasil Logo"
              className="img-fluid"
              style={{
                height: 'auto',
                width: '100%',
                maxWidth: '150px',
                maxHeight: '120px',
                objectFit: 'contain'
              }}
            />
          </div>
        </div>
      </div>

      {/* Componente de Filtros */}
      <Filtros />

      {/* Alerta de Ativação Selecionada */}
      {ativacaoSelecionada && (
        <div className="alert alert-warning alert-dismissible fade show" role="alert">
          <strong>Filtro Ativo:</strong> Mostrando dados apenas dos usuários da ativação selecionada.
          <button
            type="button"
            className="btn-close"
            onClick={() => {
              setAtivacaoSelecionada(null);
              const newFilters = { ...filters };
              delete newFilters.ativacaoSelecionada;
              updateFilters(newFilters);
            }}
          ></button>
        </div>
      )}

      {/* Cards de Métricas */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-subtitle mb-2 text-muted">Total de Usuários com Ativações</h6>                  
                  <h2 className="card-title mb-0 mt-2" style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#0d6efd' }}>
                    {metrics.totalUsuariosComAtivacoes}
                  </h2>
                </div>
                <div className="bg-primary bg-opacity-10 rounded-circle p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#0d6efd" className="bi bi-people-fill" viewBox="0 0 16 16">
                    <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7Zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-5.784 6A2.238 2.238 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.325 6.325 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1h4.216ZM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-subtitle mb-2 text-muted">Total de Check-ins</h6>
                  <h2 className="card-title mb-0 mt-2" style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#198754' }}>
                    {metrics.totalCheckins}
                  </h2>
                </div>
                <div className="bg-success bg-opacity-10 rounded-circle p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#198754" className="bi bi-check-circle-fill" viewBox="0 0 16 16">
                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-subtitle mb-2 text-muted">Total de Resgates</h6>
                  <h2 className="card-title mb-0 mt-2" style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#dc3545' }}>
                    {metrics.totalResgates}
                  </h2>
                </div>
                <div className="bg-danger bg-opacity-10 rounded-circle p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#dc3545" className="bi bi-gift-fill" viewBox="0 0 16 16">
                    <path d="M3 2.5a2.5 2.5 0 0 1 5 0 2.5 2.5 0 0 1 5 0v.006c0 .07 0 .27-.038.494H15a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h2.038A2.968 2.968 0 0 1 3 2.506V2.5zm1.068.5H7v-.5a1.5 1.5 0 1 0-3 0c0 .085.002.274.045.43a.522.522 0 0 0 .023.07zM9 3h2.932a.56.56 0 0 0 .023-.07c.043-.156.045-.345.045-.43a1.5 1.5 0 0 0-3 0V3zM1 4v.5h3.5V4H1zm5.5 0v.5h3V4h-3zm4.5 0v.5H15V4h-4zM0 5.5V14a1 1 0 0 0 1 1h6V5.5H0zm8 0V15h6a1 1 0 0 0 1-1V5.5H8z"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-subtitle mb-2 text-muted">IEM Geral Pesquisa</h6>                  
                  <h2 className="card-title mb-0 mt-2" style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#6f42c1' }}>
                    {dadosPesquisa ? dadosPesquisa.iemGeral : 0}%
                  </h2>
                  <small className="text-muted">Experiência de Marca</small>
                </div>
                <div className="bg-purple bg-opacity-10 rounded-circle p-3" style={{ backgroundColor: 'rgba(111, 66, 193, 0.1)' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#6f42c1" className="bi bi-graph-up-arrow" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M0 0h1v15h15v1H0V0Zm10 3.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0V4.9l-3.613 4.417a.5.5 0 0 1-.74.037L7.06 6.767l-3.656 5.027a.5.5 0 0 1-.808-.588l4-5.5a.5.5 0 0 1 .758-.06l2.609 2.61L13.445 4H10.5a.5.5 0 0 1-.5-.5Z"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cards de Distribuição */}
      <div className="row g-3 mb-4">
        {/* Card de Distribuição por Faixa Etária */}
        <div className="col-md-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#6f42c1" className="bi bi-bar-chart-fill me-2" viewBox="0 0 16 16">
                  <path d="M1 11a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1v-3zm5-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7zm5-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V2z"/>
                </svg>
                Distribuição por Faixa Etária
              </h5>
              <p className="text-muted small mb-3">Distribuição dos usuários por faixa etária</p>
              <div className="table-responsive">
                <table className="table table-sm table-hover">
                  <thead>
                    <tr>
                      <th>Faixa Etária</th>
                      <th className="text-end">Quantidade</th>
                      <th className="text-end">Percentual</th>
                    </tr>
                  </thead>
                  <tbody>
                    {distribuicaoFaixaEtaria.map((item) => (
                      <tr key={item.faixa}>
                        <td>{item.label}</td>
                        <td className="text-end">
                          <span className="badge bg-primary">{item.quantidade}</span>
                        </td>
                        <td className="text-end">
                          <div className="d-flex align-items-center justify-content-end">
                            <div className="progress me-2" style={{ width: '100px', height: '20px' }}>
                              <div
                                className="progress-bar bg-primary"
                                role="progressbar"
                                style={{ width: `${item.percentual}%` }}
                                aria-valuenow={item.percentual}
                                aria-valuemin="0"
                                aria-valuemax="100"
                              ></div>
                            </div>
                            <strong>{item.percentual}%</strong>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Card de Distribuição da Base */}
        <div className="col-md-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#17a2b8" className="bi bi-pie-chart-fill me-2" viewBox="0 0 16 16">
                  <path d="M15.985 8.5H8.207l-5.5 5.5a8 8 0 0 0 13.277-5.5zM2 13.292A8 8 0 0 1 7.5.015v7.778l-5.5 5.5zM8.5.015V7.5h7.485A8.001 8.001 0 0 0 8.5.015z"/>
                </svg>
                Distribuição da Base
              </h5>
              <p className="text-muted small mb-4">Distribuição entre clientes e não clientes do Banco do Brasil</p>

              <div className="row text-center mb-4">
                <div className="col-6">
                  <div className="p-3 bg-success bg-opacity-10 rounded">
                    <div className="text-muted small mb-2">Com Conta BB</div>
                    <h3 className="mb-0" style={{ color: '#198754', fontWeight: 'bold' }}>{distribuicaoBase.comConta}</h3>
                    <div className="text-success fw-bold mt-1">{distribuicaoBase.comContaPerc}%</div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="p-3 bg-danger bg-opacity-10 rounded">
                    <div className="text-muted small mb-2">Sem Conta BB</div>
                    <h3 className="mb-0" style={{ color: '#dc3545', fontWeight: 'bold' }}>{distribuicaoBase.semConta}</h3>
                    <div className="text-danger fw-bold mt-1">{distribuicaoBase.semContaPerc}%</div>
                  </div>
                </div>
              </div>

              <div className="progress" style={{ height: '30px' }}>
                <div
                  className="progress-bar bg-success"
                  role="progressbar"
                  style={{ width: `${distribuicaoBase.comContaPerc}%` }}
                  aria-valuenow={distribuicaoBase.comContaPerc}
                  aria-valuemin="0"
                  aria-valuemax="100"
                >
                  {distribuicaoBase.comContaPerc > 10 && `${distribuicaoBase.comContaPerc}%`}
                </div>
                <div
                  className="progress-bar bg-danger"
                  role="progressbar"
                  style={{ width: `${distribuicaoBase.semContaPerc}%` }}
                  aria-valuenow={distribuicaoBase.semContaPerc}
                  aria-valuemin="0"
                  aria-valuemax="100"
                >
                  {distribuicaoBase.semContaPerc > 10 && `${distribuicaoBase.semContaPerc}%`}
                </div>
              </div>

              <div className="mt-3 text-center">
                <small className="text-muted">
                  Total de usuários: <strong>{distribuicaoBase.total}</strong>
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Linha com 2 gráficos */}
      <div className="row mb-4">
        {/* Gráfico de Check-ins por Dia */}
        <div className="col-md-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title mb-2">Check-ins por Dia</h5>
              <p className="text-muted small mb-4">
                Visualize a distribuição de check-ins ao longo dos dias
              </p>
              {chartDataPorDia.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={chartDataPorDia}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="dataFormatada"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis />
                    <Tooltip content={<CustomTooltipPorDia />} />
                    <Legend />
                    <Bar
                      dataKey="checkins"
                      fill="#198754"
                      name="Check-ins"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-5">
                  <p className="text-muted">Nenhum dado disponível para exibir</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Gráfico de Picos de Horário */}
        <div className="col-md-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h5 className="card-title mb-2">Picos de Horário de Check-ins</h5>
                  <p className="text-muted small mb-0">
                    Horários com maior número de check-ins
                  </p>
                </div>
                <div style={{ minWidth: '150px' }}>
                  <select
                    className="form-select form-select-sm"
                    value={dataSelecionadaPicos || ''}
                    onChange={(e) => setDataSelecionadaPicos(e.target.value || null)}
                  >
                    <option value="">Todas as datas</option>
                    {datasDisponiveisPicos.map((data) => (
                      <option key={data.valor} value={data.valor}>
                        {data.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {chartDataPicos.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart
                    data={chartDataPicos}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient id="colorCriacoes" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6f42c1" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#6f42c1" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="horaFormatada"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
                      labelStyle={{ fontWeight: 'bold' }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="check-ins"
                      stroke="#6f42c1"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorCriacoes)"
                      name="Check-ins"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-5">
                  <p className="text-muted">Nenhum dado disponível para exibir</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Linha com Funil e Check-ins por Ativação */}
      <div className="row mb-4">
        {/* Gráfico de Funil de Atividades */}
        <div className="col-md-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title mb-2">Visão Geral de Atividades</h5>
              <p className="text-muted small mb-4">
                Total de registros por tipo de atividade
              </p>
              {funnelData.length > 0 ? (
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                  <div style={{ width: '100%', maxWidth: '500px' }}>
                    {funnelData.map((item, index) => {
                      const widthPercent = item.percentual;
                      const minWidth = 40; // Largura mínima em percentual para visibilidade
                      const adjustedWidth = Math.max(minWidth, widthPercent);

                      return (
                        <div
                          key={index}
                          className="mb-2"
                          style={{
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            position: 'relative'
                          }}
                        >
                          <div
                            style={{
                              width: `${adjustedWidth}%`,
                              backgroundColor: item.cor,
                              color: 'white',
                              padding: '18px 20px',
                              borderRadius: '10px',
                              textAlign: 'center',
                              fontSize: '14px',
                              fontWeight: '600',
                              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                              transition: 'all 0.3s ease',
                              cursor: 'default',
                              position: 'relative',
                              overflow: 'hidden'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-3px)';
                              e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.15)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                            }}
                          >
                            <div style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
                              pointerEvents: 'none'
                            }}></div>
                            <div style={{ position: 'relative', zIndex: 1 }}>
                              <div style={{ fontSize: '13px', marginBottom: '8px', opacity: 0.95 }}>
                                {item.etapa}
                              </div>
                              <div style={{ fontSize: '28px', fontWeight: 'bold', letterSpacing: '1px' }}>
                                {item.quantidade.toLocaleString('pt-BR')}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-5">
                  <p className="text-muted">Nenhum dado disponível para exibir</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Gráfico de Check-ins por Ativação */}
        <div className="col-md-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <h5 className="card-title mb-2">Check-ins por Ativação (Top 10)</h5>
                  <p className="text-muted small mb-0">
                    Clique em uma barra para filtrar os dados por ativação
                  </p>
                </div>
                {/* Média Geral de Avaliações - Minimalista */}
                <div className="text-end" style={{ minWidth: '120px' }}>
                  <div style={{ fontSize: '0.7rem', color: '#6c757d', marginBottom: '2px' }}>Média Geral</div>
                  <div className="d-flex align-items-center justify-content-end">
                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ffc107' }}>
                      {metrics.mediaGeralAvaliacoes.toFixed(2)}
                    </span>
                    <span style={{ fontSize: '0.9rem', color: '#ffc107', marginLeft: '4px' }}>⭐</span>
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#adb5bd' }}>de 5.00</div>
                </div>
              </div>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis
                      type="category"
                      dataKey="nome"
                      width={140}
                      style={{ fontSize: '12px' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar
                      dataKey="checkins"
                      name="Check-ins"
                      radius={[0, 8, 8, 0]}
                      onClick={handleBarClick}
                      cursor="pointer"
                    >
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={ativacaoSelecionada === null || ativacaoSelecionada === entry.id ? '#0d6efd' : '#c0c0c0'}
                          opacity={ativacaoSelecionada === null || ativacaoSelecionada === entry.id ? 1 : 0.3}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-5">
                  <p className="text-muted">Nenhum dado disponível para exibir</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Seção de Análise da Pesquisa de Satisfação */}
      {dadosPesquisa && (
        <>
          {/* Divisor */}
          <div className="row my-5">
            <div className="col-12">
              <hr className="border-primary" style={{ borderWidth: '2px' }} />
              <h2 className="text-center text-primary mt-4 mb-4">Análise da Pesquisa de Satisfação</h2>
              <p className="text-center text-muted mb-4">Total de respostas: <strong>{dadosPesquisa.totalRespostas}</strong></p>
            </div>
          </div>

          {/* Blocos da Pesquisa - Grid 3x2 (5 blocos + conhecimento) */}
          <div className="row g-4 mb-4">
            {/* Bloco de Conhecimento */}
            <div className="col-md-6">
              <div className="card border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
                <div className="card-body text-white">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <h4 className="card-title mb-0">
                      <span style={{ fontSize: '1.5rem' }}>🧠</span> {dadosPesquisa.blocoConhecimento.titulo}
                    </h4>
                    {/* IEM do Bloco - Minimalista */}
                    <div className="text-end" style={{ minWidth: '80px' }}>
                      <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>IEM</div>
                      <div style={{ fontSize: '1.8rem', fontWeight: 'bold', lineHeight: 1 }}>
                        {dadosPesquisa.blocoConhecimento.iem}<span style={{ fontSize: '1rem' }}>%</span>
                      </div>
                    </div>
                  </div>

                  {/* Perguntas */}
                  <div className="mt-3">
                    <p className="mb-3" style={{ fontSize: '0.95rem', fontWeight: '600' }}>Perguntas incluídas:</p>
                    {dadosPesquisa.blocoConhecimento.perguntas.map((item, index) => (
                      <div key={index} className="mb-3 p-3 rounded" style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                        <div className="mb-2" style={{ fontSize: '0.9rem' }}>
                          {index + 1}. {item.pergunta}
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <span style={{ fontSize: '0.85rem', opacity: 0.9 }}>Percentual: </span>
                            <strong style={{ fontSize: '1.1rem' }}>{item.percentual}%</strong>
                          </div>
                          <div>
                            <span style={{ fontSize: '0.85rem', opacity: 0.9 }}>{item.total} respostas</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Bloco de Satisfação */}
            <div className="col-md-6">
              <div className="card border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <div className="card-body text-white">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <h4 className="card-title mb-0">
                      <span style={{ fontSize: '1.5rem' }}>😊</span> {dadosPesquisa.blocoSatisfacao.titulo}
                    </h4>
                    {/* IEM do Bloco - Minimalista */}
                    <div className="text-end" style={{ minWidth: '80px' }}>
                      <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>IEM</div>
                      <div style={{ fontSize: '1.8rem', fontWeight: 'bold', lineHeight: 1 }}>
                        {dadosPesquisa.blocoSatisfacao.iem}<span style={{ fontSize: '1rem' }}>%</span>
                      </div>
                    </div>
                  </div>

                  {/* Perguntas */}
                  <div className="mt-3">
                    <p className="mb-3" style={{ fontSize: '0.95rem', fontWeight: '600' }}>Perguntas incluídas:</p>
                    {dadosPesquisa.blocoSatisfacao.perguntas.map((item, index) => (
                      <div key={index} className="mb-3 p-3 rounded" style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                        <div className="mb-2" style={{ fontSize: '0.9rem' }}>
                          {index + 1}. {item.pergunta}
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <span style={{ fontSize: '0.85rem', opacity: 0.9 }}>Média: </span>
                            <strong style={{ fontSize: '1.1rem' }}>{item.media}</strong>
                          </div>
                          <div>
                            <span style={{ fontSize: '0.85rem', opacity: 0.9 }}>Grau: </span>
                            <strong style={{ fontSize: '1.1rem' }}>{item.grau}%</strong>
                          </div>
                          <div>
                            <span style={{ fontSize: '0.85rem', opacity: 0.9 }}>{item.total} respostas</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Bloco de Intenção de Relacionamento */}
            <div className="col-md-6">
              <div className="card border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                <div className="card-body text-white">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <h4 className="card-title mb-0">
                      <span style={{ fontSize: '1.5rem' }}>🤝</span> {dadosPesquisa.blocoIntencao.titulo}
                    </h4>
                    {/* IEM do Bloco - Minimalista */}
                    <div className="text-end" style={{ minWidth: '80px' }}>
                      <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>IEM</div>
                      <div style={{ fontSize: '1.8rem', fontWeight: 'bold', lineHeight: 1 }}>
                        {dadosPesquisa.blocoIntencao.iem}<span style={{ fontSize: '1rem' }}>%</span>
                      </div>
                      <div style={{ fontSize: '0.6rem', opacity: 0.75 }}>Top 2 Box</div>
                    </div>
                  </div>

                  {/* Perguntas */}
                  <div className="mt-3">
                    <p className="mb-3" style={{ fontSize: '0.95rem', fontWeight: '600' }}>Perguntas incluídas:</p>
                    {dadosPesquisa.blocoIntencao.perguntas.map((item, index) => (
                      <div key={index} className="mb-3 p-3 rounded" style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                        <div className="mb-2" style={{ fontSize: '0.9rem' }}>
                          {index + 1}. {item.pergunta}
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <span style={{ fontSize: '0.85rem', opacity: 0.9 }}>Média: </span>
                            <strong style={{ fontSize: '1.1rem' }}>{item.media}</strong>
                          </div>
                          <div>
                            <span style={{ fontSize: '0.85rem', opacity: 0.9 }}>Top 2 Box: </span>
                            <strong style={{ fontSize: '1.1rem' }}>{item.percentual}%</strong>
                          </div>
                          <div>
                            <span style={{ fontSize: '0.85rem', opacity: 0.9 }}>{item.total} respostas</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Bloco Posicionamento */}
            <div className="col-md-6">
              <div className="card border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                <div className="card-body text-white">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <h4 className="card-title mb-0">
                      <span style={{ fontSize: '1.5rem' }}>🎯</span> {dadosPesquisa.blocoPosicionamento.titulo}
                    </h4>
                    {/* IEM do Bloco - Minimalista */}
                    <div className="text-end" style={{ minWidth: '80px' }}>
                      <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>IEM</div>
                      <div style={{ fontSize: '1.8rem', fontWeight: 'bold', lineHeight: 1 }}>
                        {dadosPesquisa.blocoPosicionamento.iem}<span style={{ fontSize: '1rem' }}>%</span>
                      </div>
                    </div>
                  </div>

                  {/* Perguntas */}
                  <div className="mt-3">
                    <p className="mb-3" style={{ fontSize: '0.95rem', fontWeight: '600' }}>Perguntas incluídas:</p>
                    {dadosPesquisa.blocoPosicionamento.perguntas.map((item, index) => (
                      <div key={index} className="mb-3 p-3 rounded" style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                        <div className="mb-2" style={{ fontSize: '0.9rem' }}>
                          {index + 1}. {item.pergunta}
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <span style={{ fontSize: '0.85rem', opacity: 0.9 }}>Média: </span>
                            <strong style={{ fontSize: '1.1rem' }}>{item.media}</strong>
                          </div>
                          <div>
                            <span style={{ fontSize: '0.85rem', opacity: 0.9 }}>Grau: </span>
                            <strong style={{ fontSize: '1.1rem' }}>{item.grau}%</strong>
                          </div>
                          <div>
                            <span style={{ fontSize: '0.85rem', opacity: 0.9 }}>{item.total} respostas</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Bloco Territórios */}
            <div className="col-md-6">
              <div className="card border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
                <div className="card-body text-white">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <h4 className="card-title mb-0">
                      <span style={{ fontSize: '1.5rem' }}>🌎</span> {dadosPesquisa.blocoTerritorios.titulo}
                    </h4>
                    {/* IEM do Bloco - Minimalista */}
                    <div className="text-end" style={{ minWidth: '80px' }}>
                      <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>IEM</div>
                      <div style={{ fontSize: '1.8rem', fontWeight: 'bold', lineHeight: 1 }}>
                        {dadosPesquisa.blocoTerritorios.iem}<span style={{ fontSize: '1rem' }}>%</span>
                      </div>
                    </div>
                  </div>

                  {/* Perguntas */}
                  <div className="mt-3">
                    <p className="mb-3" style={{ fontSize: '0.95rem', fontWeight: '600' }}>Perguntas incluídas:</p>
                    {dadosPesquisa.blocoTerritorios.perguntas.map((item, index) => (
                      <div key={index} className="mb-3 p-3 rounded" style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                        <div className="mb-2" style={{ fontSize: '0.9rem' }}>
                          {index + 1}. {item.pergunta}
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <span style={{ fontSize: '0.85rem', opacity: 0.9 }}>Média: </span>
                            <strong style={{ fontSize: '1.1rem' }}>{item.media}</strong>
                          </div>
                          <div>
                            <span style={{ fontSize: '0.85rem', opacity: 0.9 }}>Grau: </span>
                            <strong style={{ fontSize: '1.1rem' }}>{item.grau}%</strong>
                          </div>
                          <div>
                            <span style={{ fontSize: '0.85rem', opacity: 0.9 }}>{item.total} respostas</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bloco de Comentários Qualitativos */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <h4 className="card-title mb-4 text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-chat-quote-fill me-2" viewBox="0 0 16 16">
                      <path d="M16 8c0 3.866-3.582 7-8 7a9.06 9.06 0 0 1-2.347-.306c-.584.296-1.925.864-4.181 1.234-.2.032-.352-.176-.273-.362.354-.836.674-1.95.77-2.966C.744 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7zM7.194 6.766a1.688 1.688 0 0 0-.227-.272 1.467 1.467 0 0 0-.469-.324l-.008-.004A1.785 1.785 0 0 0 5.734 6C4.776 6 4 6.746 4 7.667c0 .92.776 1.666 1.734 1.666.343 0 .662-.095.931-.26-.137.389-.39.804-.81 1.22a.405.405 0 0 0 .011.59c.173.16.447.155.614-.01 1.334-1.329 1.37-2.758.941-3.706a2.461 2.461 0 0 0-.227-.4zM11 9.073c-.136.389-.39.804-.81 1.22a.405.405 0 0 0 .012.59c.172.16.446.155.613-.01 1.334-1.329 1.37-2.758.942-3.706a2.466 2.466 0 0 0-.228-.4 1.686 1.686 0 0 0-.227-.273 1.466 1.466 0 0 0-.469-.324l-.008-.004A1.785 1.785 0 0 0 10.07 6c-.957 0-1.734.746-1.734 1.667 0 .92.777 1.666 1.734 1.666.343 0 .662-.095.931-.26z"/>
                    </svg>
                    Comentários da Pesquisa de Satisfação
                  </h4>
                  <p className="text-muted mb-4">Total de comentários: <strong>{dadosPesquisa.comentarios.length}</strong></p>

                  {dadosPesquisa.comentarios.length === 0 ? (
                    <div className="alert alert-info">
                      <p className="mb-0">Nenhum comentário disponível.</p>
                    </div>
                  ) : (
                    <div className="row g-3">
                      {dadosPesquisa.comentarios.map((item, index) => (
                        <div key={index} className="col-12">
                          <div className="p-3 rounded" style={{ backgroundColor: '#f8f9fa', borderLeft: '4px solid #0d6efd' }}>
                            <p className="mb-2" style={{ fontSize: '1rem', lineHeight: '1.6' }}>{item.comentario}</p>
                            <div className="d-flex gap-3 align-items-center mt-2">
                              <small className="text-muted">
                                <strong>Idade:</strong> {item.faixaEtaria}
                              </small>
                              <small className="text-muted">
                                <strong>Cliente BB:</strong>{' '}
                                <span className={`badge ${item.clienteBB === 'Sim' ? 'bg-success' : 'bg-secondary'}`}>
                                  {item.clienteBB}
                                </span>
                              </small>
                              <small className="text-muted ms-auto">
                                {new Date(item.data).toLocaleString('pt-BR', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </small>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

    </div>
  );
};

export default Dashboard;
