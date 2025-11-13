import { useState, useEffect } from 'react';
import { Offcanvas, Button, Form } from 'react-bootstrap';
import { useData } from '../context/DataContext';
import DateRangeFilter from './DateRangeFilter';

const Filtros = () => {
  const {
    filters,
    updateFilters,
    clearFilters,
    getFilterStats
  } = useData();

  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [showDateRangeModal, setShowDateRangeModal] = useState(false);
  const [temContaBB, setTemContaBB] = useState(filters.temContaBB || '');
  const [faixasEtariasSelecionadas, setFaixasEtariasSelecionadas] = useState(filters.faixasEtarias || []);
  const [dataInicio, setDataInicio] = useState(filters.dataInicio || '');
  const [dataFim, setDataFim] = useState(filters.dataFim || '');

  // Estatísticas dos filtros
  const stats = getFilterStats();

  // Opções de Faixa Etária
  const faixasEtarias = [
    { value: '', label: 'Todas as faixas' },
    { value: 'menor18', label: 'Menor de 18 anos' },
    { value: '18-24', label: 'Entre 18 e 24 anos' },
    { value: '25-40', label: 'Entre 25 e 40 anos' },
    { value: '41-59', label: 'Entre 41 e 59 anos' },
    { value: '60+', label: '60 anos ou mais' },
    { value: 'naoInformado', label: 'Não informado' }
  ];

  // Aplicar filtros automaticamente quando os valores mudarem
  useEffect(() => {
    const newFilters = {};

    if (temContaBB) newFilters.temContaBB = temContaBB;
    if (faixasEtariasSelecionadas.length > 0) newFilters.faixasEtarias = faixasEtariasSelecionadas;
    if (dataInicio) newFilters.dataInicio = dataInicio;
    if (dataFim) newFilters.dataFim = dataFim;

    updateFilters(newFilters);
  }, [temContaBB, faixasEtariasSelecionadas, dataInicio, dataFim, updateFilters]);

  const handleLimparFiltros = () => {
    setTemContaBB('');
    setFaixasEtariasSelecionadas([]);
    setDataInicio('');
    setDataFim('');
    clearFilters();
  };

  const handleToggleFaixaEtaria = (value) => {
    setFaixasEtariasSelecionadas(prev => {
      if (prev.includes(value)) {
        return prev.filter(v => v !== value);
      } else {
        return [...prev, value];
      }
    });
  };

  const handleApplyDateRange = (startDate, endDate) => {
    if (startDate && endDate) {
      const formattedStart = startDate.toISOString().split('T')[0];
      const formattedEnd = endDate.toISOString().split('T')[0];
      setDataInicio(formattedStart);
      setDataFim(formattedEnd);
    } else {
      setDataInicio('');
      setDataFim('');
    }
  };

  const formatDateRangeDisplay = () => {
    if (dataInicio && dataFim) {
      const start = new Date(dataInicio).toLocaleDateString('pt-BR');
      const end = new Date(dataFim).toLocaleDateString('pt-BR');
      if (start === end) return start;
      return `${start} - ${end}`;
    }
    return 'Selecionar período';
  };

  return (
    <>
      {/* Botão para abrir Filtros */}
      <div
        className="d-flex justify-content-end mb-3"
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 1000
        }}
      >
        <Button variant="primary" onClick={() => setShowOffcanvas(true)}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            className="bi bi-funnel-fill me-2"
            viewBox="0 0 16 16"
          >
            <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5v-2z" />
          </svg>
          Filtros
          {stats.hasActiveFilters && (
            <span className="badge bg-light text-primary ms-2">{Object.keys(filters).length}</span>
          )}
        </Button>
      </div>

      {/* Offcanvas de Filtros */}
      <Offcanvas show={showOffcanvas} onHide={() => setShowOffcanvas(false)} placement="end">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Filtros</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Form>
            {/* Filtro de Tem Conta BB */}
            <Form.Group className="mb-3">
              <Form.Label>Tem Conta BB</Form.Label>
              <Form.Select
                value={temContaBB}
                onChange={(e) => setTemContaBB(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="true">Sim</option>
                <option value="false">Não</option>
              </Form.Select>
            </Form.Group>

            {/* Filtro de Faixa Etária */}
            <Form.Group className="mb-3">
              <Form.Label>Faixa Etária (Seleção múltipla)</Form.Label>
              <div className="border rounded p-3">
                {faixasEtarias
                  .filter(faixa => faixa.value !== '')
                  .map((faixa) => (
                    <Form.Check
                      key={faixa.value}
                      type="checkbox"
                      id={`faixa-${faixa.value}`}
                      label={faixa.label}
                      checked={faixasEtariasSelecionadas.includes(faixa.value)}
                      onChange={() => handleToggleFaixaEtaria(faixa.value)}
                      className="mb-2"
                    />
                  ))}
                {faixasEtariasSelecionadas.length === 0 && (
                  <Form.Text className="text-muted small d-block mt-2">
                    Nenhuma faixa selecionada (mostrando todas)
                  </Form.Text>
                )}
                {faixasEtariasSelecionadas.length > 0 && (
                  <Form.Text className="text-primary small d-block mt-2">
                    {faixasEtariasSelecionadas.length} faixa(s) selecionada(s)
                  </Form.Text>
                )}
              </div>
            </Form.Group>

            {/* Filtro de Data com Range Picker */}
            <Form.Group className="mb-3">
              <Form.Label>Período</Form.Label>
              <div className="d-grid">
                <Button
                  variant="outline-primary"
                  onClick={() => setShowDateRangeModal(true)}
                  className="text-start d-flex align-items-center justify-content-between"
                >
                  <span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      className="bi bi-calendar-range me-2"
                      viewBox="0 0 16 16"
                    >
                      <path d="M9 7a1 1 0 0 1 1-1h5v2h-5a1 1 0 0 1-1-1zM1 9h4a1 1 0 0 1 0 2H1V9z"/>
                      <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
                    </svg>
                    {formatDateRangeDisplay()}
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-chevron-right"
                    viewBox="0 0 16 16"
                  >
                    <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
                  </svg>
                </Button>
              </div>
              {(dataInicio && dataFim) && (
                <Form.Text className="text-muted d-block mt-2">
                  <small>
                    Filtrando dados do período selecionado
                  </small>
                </Form.Text>
              )}
            </Form.Group>

            {/* Botão Limpar Filtros */}
            <div className="d-grid gap-2 mt-4">
              <Button variant="outline-secondary" onClick={handleLimparFiltros}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  className="bi bi-x-circle me-2"
                  viewBox="0 0 16 16"
                >
                  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                  <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
                </svg>
                Limpar Todos os Filtros
              </Button>
            </div>

            {/* Estatísticas dos Filtros */}
            {stats.hasActiveFilters && (
              <div className="alert alert-info mt-4 mb-0" role="alert">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  className="bi bi-info-circle-fill me-2"
                  viewBox="0 0 16 16"
                >
                  <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />
                </svg>
                Mostrando <strong>{stats.filtered}</strong> de <strong>{stats.total}</strong> check-ins
                ({stats.percentage}% dos dados)
              </div>
            )}
          </Form>
        </Offcanvas.Body>
      </Offcanvas>

      {/* Modal de Seleção de Intervalo de Datas */}
      <DateRangeFilter
        show={showDateRangeModal}
        onHide={() => setShowDateRangeModal(false)}
        onApply={handleApplyDateRange}
        initialStartDate={dataInicio}
        initialEndDate={dataFim}
      />
    </>
  );
};

export default Filtros;
