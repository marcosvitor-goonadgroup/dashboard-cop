import { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useData } from '../context/DataContext';
import Filtros from '../components/Filtros';

const PesquisaSatisfacao = () => {
  const { loading, error, getAnalisePesquisa } = useData();

  // Obter dados da pesquisa
  const dadosPesquisa = getAnalisePesquisa();

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

  if (!dadosPesquisa || dadosPesquisa.totalRespostas === 0) {
    return (
      <div className="container-fluid py-4">
        <Filtros />
        <div className="alert alert-info" role="alert">
          <h4 className="alert-heading">Nenhuma resposta encontrada</h4>
          <p>Não há respostas de pesquisa disponíveis no momento.</p>
        </div>
      </div>
    );
  }

  const { blocoSatisfacao, blocoIntencao, comentarios, totalRespostas } = dadosPesquisa;

  return (
    <div className="container-fluid py-4">
      {/* Componente de Filtros */}
      <Filtros />

      {/* Título da Página */}
      <div className="row mb-4">
        <div className="col-12">
          <h2 className="text-primary mb-2">Análise da Pesquisa de Satisfação</h2>
          <p className="text-muted">Total de respostas: <strong>{totalRespostas}</strong></p>
        </div>
      </div>

      {/* Blocos de Satisfação e Intenção lado a lado */}
      <div className="row g-4 mb-4">
        {/* Bloco de Satisfação */}
        <div className="col-md-6">
          <div className="card border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <div className="card-body text-white">
              <h4 className="card-title mb-4">
                <span style={{ fontSize: '1.5rem' }}>😊</span> {blocoSatisfacao.titulo}
              </h4>

              {/* Média Geral */}
              <div className="row mb-4">
                <div className="col-6 text-center">
                  <div className="mb-2" style={{ fontSize: '0.9rem', opacity: 0.9 }}>Nota Média</div>
                  <div style={{ fontSize: '3rem', fontWeight: 'bold' }}>
                    {blocoSatisfacao.mediaGeral.media}
                    <span style={{ fontSize: '1.5rem', opacity: 0.8 }}>/5</span>
                  </div>
                </div>
                <div className="col-6 text-center">
                  <div className="mb-2" style={{ fontSize: '0.9rem', opacity: 0.9 }}>Grau de Satisfação</div>
                  <div style={{ fontSize: '3rem', fontWeight: 'bold' }}>
                    {blocoSatisfacao.mediaGeral.grau}
                    <span style={{ fontSize: '1.5rem', opacity: 0.8 }}>%</span>
                  </div>
                </div>
              </div>

              {/* Perguntas */}
              <div className="mt-4">
                <p className="mb-3" style={{ fontSize: '0.95rem', fontWeight: '600' }}>Perguntas incluídas:</p>
                {blocoSatisfacao.perguntas.map((item, index) => (
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
              <h4 className="card-title mb-4">
                <span style={{ fontSize: '1.5rem' }}>🤝</span> {blocoIntencao.titulo}
              </h4>

              {/* Média Geral */}
              <div className="row mb-4">
                <div className="col-6 text-center">
                  <div className="mb-2" style={{ fontSize: '0.9rem', opacity: 0.9 }}>Nota Média</div>
                  <div style={{ fontSize: '3rem', fontWeight: 'bold' }}>
                    {blocoIntencao.mediaGeral.media}
                    <span style={{ fontSize: '1.5rem', opacity: 0.8 }}>/5</span>
                  </div>
                </div>
                <div className="col-6 text-center">
                  <div className="mb-2" style={{ fontSize: '0.9rem', opacity: 0.9 }}>Grau de Satisfação</div>
                  <div style={{ fontSize: '3rem', fontWeight: 'bold' }}>
                    {blocoIntencao.mediaGeral.grau}
                    <span style={{ fontSize: '1.5rem', opacity: 0.8 }}>%</span>
                  </div>
                </div>
              </div>

              {/* Perguntas */}
              <div className="mt-4">
                <p className="mb-3" style={{ fontSize: '0.95rem', fontWeight: '600' }}>Perguntas incluídas:</p>
                {blocoIntencao.perguntas.map((item, index) => (
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
              <p className="text-muted mb-4">Total de comentários: <strong>{comentarios.length}</strong></p>

              {comentarios.length === 0 ? (
                <div className="alert alert-info">
                  <p className="mb-0">Nenhum comentário disponível.</p>
                </div>
              ) : (
                <div className="row g-3">
                  {comentarios.map((item, index) => (
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
    </div>
  );
};

export default PesquisaSatisfacao;
