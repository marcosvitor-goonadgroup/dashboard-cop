import { useState, useEffect, useMemo } from 'react';
import { DateRangePicker } from 'react-date-range';
import { ptBR } from 'date-fns/locale/pt-BR';
import { Modal, Button } from 'react-bootstrap';
import { useData } from '../context/DataContext';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import './DateRangeFilter.css';

const DateRangeFilter = ({ show, onHide, onApply, initialStartDate, initialEndDate }) => {
  const { data } = useData();

  // Usar useMemo para calcular as datas mínimas e máximas apenas quando os dados mudarem
  const { minDate, maxDate } = useMemo(() => {
    if (!data || !data.tables) return { minDate: new Date(), maxDate: new Date() };

    const checkins = data.tables.checkins?.data || [];
    const resgates = data.tables.resgates?.data || [];
    const pesquisas = data.tables.pesquisa_experiencias?.data || [];

    // Coletar todas as datas
    const allDates = [];

    checkins.forEach(c => {
      if (c.created_at) allDates.push(new Date(c.created_at));
    });

    resgates.forEach(r => {
      if (r.created_at) allDates.push(new Date(r.created_at));
    });

    pesquisas.forEach(p => {
      if (p.created_at) allDates.push(new Date(p.created_at));
    });

    if (allDates.length === 0) {
      return { minDate: new Date(), maxDate: new Date() };
    }

    const minDate = new Date(Math.min(...allDates));
    const maxDate = new Date(Math.max(...allDates));

    return { minDate, maxDate };
  }, [data]);

  const [dateRange, setDateRange] = useState([
    {
      startDate: initialStartDate ? new Date(initialStartDate) : minDate,
      endDate: initialEndDate ? new Date(initialEndDate) : maxDate,
      key: 'selection'
    }
  ]);

  // Atualizar o range quando o modal for aberto pela primeira vez
  useEffect(() => {
    if (show && !initialStartDate && !initialEndDate) {
      setDateRange([{
        startDate: minDate,
        endDate: maxDate,
        key: 'selection'
      }]);
    }
  }, [show]);

  const handleDateRangeChange = (item) => {
    setDateRange([item.selection]);
  };

  const handleApply = () => {
    const { startDate, endDate } = dateRange[0];
    onApply(startDate, endDate);
    onHide();
  };

  const handleClear = () => {
    onApply(null, null);
    onHide();
  };

  const formatDateRange = () => {
    const { startDate, endDate } = dateRange[0];
    const start = startDate.toLocaleDateString('pt-BR');
    const end = endDate.toLocaleDateString('pt-BR');

    if (start === end) {
      return start;
    }
    return `${start} - ${end}`;
  };

  return (
    <Modal show={show} onHide={onHide} centered className="date-range-modal">
      <Modal.Header closeButton>
        <Modal.Title>Filtrar por Período</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-0">
        <div className="date-range-filter-container">
          <DateRangePicker
            ranges={dateRange}
            onChange={handleDateRangeChange}
            locale={ptBR}
            months={1}
            direction="horizontal"
            showSelectionPreview={true}
            moveRangeOnFirstSelection={false}
            className="custom-date-range-picker"
            rangeColors={['#0d6efd']}
            minDate={minDate}
            maxDate={maxDate}
          />
        </div>
        <div className="selected-range-info p-3 bg-light border-top">
          <small className="text-muted d-block mb-1">Período selecionado:</small>
          <strong>{formatDateRange()}</strong>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={handleClear}>
          Limpar Filtro
        </Button>
        <Button variant="primary" onClick={handleApply}>
          Aplicar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DateRangeFilter;
