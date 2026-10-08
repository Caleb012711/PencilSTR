import React, { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
} from '@dnd-kit/core';
import { useDealStore } from '../../store/useDealStore';
import { Deal, PipelineStage } from '../../types/deal';
import { calculateUnderwriteMetrics } from '../../utils/underwriterMath';

interface PipelineKanbanViewProps {
  onOpenDealDrawer: (deal: Deal) => void;
  onOpenUnderwriter: (deal: Deal) => void;
  onOpenAudit: (deal: Deal) => void;
}

const STAGES: { id: PipelineStage; label: string; description: string }[] = [
  { id: 'inbox', label: '1. SCANNED INBOX', description: 'Swept from radar & URLs' },
  { id: 'underwriting', label: '2. UNDERWRITING', description: 'Pro forma & DSCR modeling' },
  { id: 'due_diligence', label: '3. DUE DILIGENCE', description: 'HOA CC&R audit & inspection' },
  { id: 'offer_sent', label: '4. OFFER SENT', description: 'LOI & contract negotiation' },
  { id: 'under_contract', label: '5. UNDER CONTRACT', description: 'Escrow & financing approval' },
  { id: 'acquired', label: '6. ACQUIRED', description: 'Live operational portfolio' },
];

const nextStageMap: Record<PipelineStage, PipelineStage | null> = {
  inbox: 'underwriting',
  underwriting: 'due_diligence',
  due_diligence: 'offer_sent',
  offer_sent: 'under_contract',
  under_contract: 'acquired',
  acquired: null,
};

const prevStageMap: Record<PipelineStage, PipelineStage | null> = {
  inbox: null,
  underwriting: 'inbox',
  due_diligence: 'underwriting',
  offer_sent: 'due_diligence',
  under_contract: 'offer_sent',
  acquired: 'under_contract',
};

// ----------------------------------------------------
// Draggable Deal Card Component
// ----------------------------------------------------
interface DealCardProps {
  deal: Deal;
  onOpenDealDrawer: (deal: Deal) => void;
  onOpenUnderwriter: (deal: Deal) => void;
  onOpenAudit: (deal: Deal) => void;
  onMoveStage: (dealId: string, stage: PipelineStage) => void;
  onDelete: (dealId: string) => void;
  isOverlay?: boolean;
}

const DealCard: React.FC<DealCardProps> = ({
  deal,
  onOpenDealDrawer,
  onOpenUnderwriter,
  onOpenAudit,
  onMoveStage,
  onDelete,
  isOverlay = false,
}) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: deal.id,
    data: { deal },
  });

  const metrics = calculateUnderwriteMetrics(deal);

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        // Prevent opening drawer if dragging occurred
        if (!isDragging) {
          onOpenDealDrawer(deal);
        }
      }}
      style={{
        opacity: isDragging ? 0.35 : 1,
        transform: isOverlay ? 'scale(1.03)' : undefined,
      }}
      className={`bg-white dark:bg-[#181816] rounded-xl border transition-all p-3.5 shadow-2xs hover:shadow-md group select-none ${
        isOverlay
          ? 'border-[#111110] dark:border-[#F4F3EF] shadow-xl ring-2 ring-[#111110]/20 cursor-grabbing z-50'
          : 'border-[#E5E4DF] dark:border-[#262624] hover:border-[#111110] dark:hover:border-[#73716B] cursor-grab active:cursor-grabbing'
      }`}
    >
      {/* Image & Quick Badges */}
      <div className="relative h-32 rounded-lg overflow-hidden mb-2.5 bg-[#EBEAE6] dark:bg-[#20201D]">
        <img
          src={deal.imageUrl}
          alt={deal.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 left-2 flex items-center gap-1.5">
          <span className="bg-[#111110]/85 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded font-bold">
            MLS #{deal.mlsNumber}
          </span>
        </div>

        {/* HOA Status Pill */}
        <div className="absolute top-2 right-2">
          {(deal.audit?.str_status || 'PERMITTED') === 'PERMITTED' && (
            <span className="bg-[#ECFDF5]/95 dark:bg-[#065F46]/80 border border-[#A7F3D0] dark:border-[#059669]/60 text-[#065F46] dark:text-[#34D399] text-[9px] font-mono font-bold px-1.5 py-0.5 rounded">
              HOA: PERMITTED
            </span>
          )}
          {deal.audit?.str_status === 'CONDITIONAL' && (
            <span className="bg-[#FFFBEB]/95 dark:bg-[#92400E]/80 border border-[#FDE68A] dark:border-[#D97706]/60 text-[#92400E] dark:text-[#FBBF24] text-[9px] font-mono font-bold px-1.5 py-0.5 rounded">
              HOA: CONDITIONAL
            </span>
          )}
          {deal.audit?.str_status === 'PROHIBITED' && (
            <span className="bg-[#FEF2F2]/95 dark:bg-[#991B1B]/80 border border-[#FECACA] dark:border-[#DC2626]/60 text-[#991B1B] dark:text-[#FCA5A5] text-[9px] font-mono font-bold px-1.5 py-0.5 rounded">
              HOA: RESTRICTED
            </span>
          )}
        </div>

        {/* Price banner */}
        <div className="absolute bottom-2 left-2 bg-white/95 dark:bg-[#141413]/95 backdrop-blur-xs px-2.5 py-0.5 rounded border border-[#E5E4DF] dark:border-[#262624]">
          <span className="font-mono font-extrabold text-xs text-[#111110] dark:text-[#F4F3EF]">
            ${(deal.price || 625000).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Deal Info */}
      <div className="mb-2">
        <h4 className="font-semibold text-xs text-[#111110] dark:text-[#F4F3EF] leading-snug line-clamp-1 group-hover:underline">
          {deal.title}
        </h4>
        <p className="text-[11px] font-mono text-[#666562] dark:text-[#A3A19B] truncate">
          {deal.address}, {deal.city}, {deal.state}
        </p>
      </div>

      {/* Quick Specs */}
      <div className="flex items-center gap-2 text-[10px] font-mono text-[#8F8D88] dark:text-[#73716B] mb-2.5 pb-2 border-b border-[#E5E4DF] dark:border-[#262624]">
        <span>{deal.beds} Beds</span>
        <span>•</span>
        <span>{deal.baths} Baths</span>
        <span>•</span>
        <span>{(deal.sqft || 2800).toLocaleString()} SqFt</span>
        <span className="ml-auto uppercase text-[#666562] dark:text-[#A3A19B] font-semibold">{deal.financing?.strategy || 'dscr'}</span>
      </div>

      {/* Underwriting Yield Badges */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="p-1.5 bg-[#FAF9F6] dark:bg-[#141413] rounded border border-[#E5E4DF] dark:border-[#262624]">
          <span className="text-[9px] font-mono text-[#8F8D88] dark:text-[#73716B] block uppercase">
            CoC Yield
          </span>
          <span className="font-mono font-bold text-xs text-[#0B3B24] dark:text-[#34D399] tabular-nums">
            {metrics.cashOnCashReturn.toFixed(1)}%
          </span>
        </div>

        <div className="p-1.5 bg-[#FAF9F6] dark:bg-[#141413] rounded border border-[#E5E4DF] dark:border-[#262624]">
          <span className="text-[9px] font-mono text-[#8F8D88] dark:text-[#73716B] block uppercase">
            DSCR Ratio
          </span>
          <span
            className={`font-mono font-bold text-xs tabular-nums ${
              metrics.dscrBadge === 'green'
                ? 'text-[#0B3B24] dark:text-[#34D399]'
                : metrics.dscrBadge === 'amber'
                ? 'text-[#D97706] dark:text-[#FBBF24]'
                : 'text-[#DC2626] dark:text-[#F87171]'
            }`}
          >
            {metrics.dscrRatio.toFixed(2)}x
          </span>
        </div>
      </div>

      {/* Card Actions & Stage Movers */}
      <div
        className="flex items-center justify-between pt-1 text-xs"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {/* Fast Action Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onOpenUnderwriter(deal)}
            className="px-2 py-1 bg-[#111110] dark:bg-[#F4F3EF] text-white dark:text-[#111110] hover:bg-black dark:hover:bg-white rounded text-[10px] font-mono font-bold transition-colors cursor-pointer"
            title="Open Pro Forma Studio"
          >
            Underwrite
          </button>
          <button
            onClick={() => onOpenAudit(deal)}
            className="px-2 py-1 bg-[#FAF9F6] dark:bg-[#1C1C1A] border border-[#E5E4DF] dark:border-[#2E2E2A] text-[#111110] dark:text-[#F4F3EF] hover:bg-[#EBEAE6] dark:hover:bg-[#252522] rounded text-[10px] font-mono font-bold transition-colors cursor-pointer"
            title="View CC&R & Zoning Audit"
          >
            Audit
          </button>
        </div>

        {/* Stage Shift Buttons */}
        <div className="flex items-center gap-1">
          {prevStageMap[deal.stage] && (
            <button
              onClick={() => onMoveStage(deal.id, prevStageMap[deal.stage]!)}
              className="p-1 rounded hover:bg-[#EBEAE6] dark:hover:bg-[#252522] text-[#8F8D88] dark:text-[#73716B] hover:text-[#111110] dark:hover:text-[#F4F3EF] cursor-pointer"
              title={`Move back to ${prevStageMap[deal.stage]}`}
            >
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13 8H3M3 8L7 4M3 8L7 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          )}
          {nextStageMap[deal.stage] && (
            <button
              onClick={() => onMoveStage(deal.id, nextStageMap[deal.stage]!)}
              className="p-1 rounded hover:bg-[#EBEAE6] dark:hover:bg-[#252522] text-[#8F8D88] dark:text-[#73716B] hover:text-[#111110] dark:hover:text-[#F4F3EF] cursor-pointer"
              title={`Advance to ${nextStageMap[deal.stage]}`}
            >
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          )}
          <button
            onClick={() => onDelete(deal.id)}
            className="p-1 rounded hover:bg-[#FEE2E2] dark:hover:bg-[#7F1D1D]/30 text-[#8F8D88] dark:text-[#73716B] hover:text-[#DC2626] transition-colors cursor-pointer ml-0.5"
            title="Remove Deal"
          >
            <svg className="w-4 h-4 text-red-500" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 4.5H13M5.5 4.5V3C5.5 2.5 6 2 6.5 2H9.5C10 2 10.5 2.5 10.5 3V4.5M4 4.5L4.8 13C4.9 13.6 5.4 14 6 14H10C10.6 14 11.1 13.6 11.2 13L12 4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------
// Droppable Kanban Column Component
// ----------------------------------------------------
interface KanbanColumnProps {
  stage: { id: PipelineStage; label: string; description: string };
  deals: Deal[];
  stageVolume: number;
  onOpenDealDrawer: (deal: Deal) => void;
  onOpenUnderwriter: (deal: Deal) => void;
  onOpenAudit: (deal: Deal) => void;
  onMoveStage: (dealId: string, stage: PipelineStage) => void;
  onDelete: (dealId: string) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  stage,
  deals,
  stageVolume,
  onOpenDealDrawer,
  onOpenUnderwriter,
  onOpenAudit,
  onMoveStage,
  onDelete,
}) => {
  const { isOver, setNodeRef } = useDroppable({
    id: stage.id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`w-80 flex flex-col rounded-xl border transition-colors h-full shadow-2xs ${
        isOver
          ? 'bg-[#EAE8E0] dark:bg-[#252522] border-[#111110] dark:border-[#F4F3EF] ring-2 ring-[#111110]/10'
          : 'bg-[#F3F2ED] dark:bg-[#151514] border-[#E5E4DF] dark:border-[#262624]'
      }`}
    >
      {/* Column Header */}
      <div className="p-3 border-b border-[#E5E4DF] dark:border-[#262624] bg-white dark:bg-[#1C1C1A] rounded-t-xl">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs font-bold text-[#111110] dark:text-[#F4F3EF] tracking-wider">
            {stage.label}
          </span>
          <span className="w-5 h-5 rounded-full bg-[#FAF9F6] dark:bg-[#141413] border border-[#E5E4DF] dark:border-[#2E2E2A] text-[11px] font-mono font-bold text-[#111110] dark:text-[#F4F3EF] flex items-center justify-center">
            {deals.length}
          </span>
        </div>
        <div className="flex items-center justify-between text-[11px] font-mono text-[#8F8D88] dark:text-[#73716B] mt-1">
          <span className="truncate">{stage.description}</span>
          <span className="font-semibold text-[#111110] dark:text-[#F4F3EF]">
            ${(stageVolume / 1000).toFixed(0)}k
          </span>
        </div>
      </div>

      {/* Column Cards Container */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {deals.length === 0 ? (
          <div className="h-32 border-2 border-dashed border-[#E5E4DF] dark:border-[#2E2E2A] rounded-lg flex flex-col items-center justify-center text-center p-4">
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3"/><path d="M8 5V8L10 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
            <p className="text-xs font-mono text-[#8F8D88] dark:text-[#73716B]">Drop target here</p>
          </div>
        ) : (
          deals.map((deal) => (
            <DealCard
              key={deal.id}
              deal={deal}
              onOpenDealDrawer={onOpenDealDrawer}
              onOpenUnderwriter={onOpenUnderwriter}
              onOpenAudit={onOpenAudit}
              onMoveStage={onMoveStage}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  );
};

// ----------------------------------------------------
// Main Kanban Board Component
// ----------------------------------------------------
export const PipelineKanbanView: React.FC<PipelineKanbanViewProps> = ({
  onOpenDealDrawer,
  onOpenUnderwriter,
  onOpenAudit,
}) => {
  const {
    deals,
    searchQuery,
    moveDealStage,
    deleteDeal,
    setSelectedDealId,
    setIngestModalOpen,
  } = useDealStore();

  const [filterStrategy, setFilterStrategy] = useState<string>('all');
  const [activeDragDeal, setActiveDragDeal] = useState<Deal | null>(null);

  // Configure pointer sensor with small activation distance constraint
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  // Filter deals based on global search and strategy
  const filteredDeals = deals.filter((deal) => {
    const matchesSearch =
      searchQuery.trim() === '' ||
      deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.mlsNumber.includes(searchQuery);

    const matchesStrategy =
      filterStrategy === 'all' || deal.financing.strategy === filterStrategy;

    return matchesSearch && matchesStrategy;
  });

  const getStageDeals = (stage: PipelineStage) =>
    filteredDeals.filter((d) => d.stage === stage);

  const getStageVolume = (stage: PipelineStage) => {
    const stageDeals = getStageDeals(stage);
    return stageDeals.reduce((sum, d) => sum + d.price, 0);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const deal = event.active.data.current?.deal as Deal;
    if (deal) {
      setActiveDragDeal(deal);
      setSelectedDealId(deal.id);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragDeal(null);

    if (over && active.id) {
      const dealId = active.id as string;
      const targetStage = over.id as PipelineStage;
      if (STAGES.some((s) => s.id === targetStage)) {
        moveDealStage(dealId, targetStage);
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#FAF9F6] dark:bg-[#0E0E0D] text-[#111110] dark:text-[#F4F3EF] h-full overflow-hidden transition-colors duration-200">
      {/* Subheader Toolbar */}
      <div className="bg-white dark:bg-[#141413] border-b border-[#E5E4DF] dark:border-[#262624] px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-serif text-lg font-bold text-[#111110] dark:text-[#F4F3EF]">
              Acquisition Pipeline
            </span>
            <span className="text-xs font-mono bg-[#E5E4DF] dark:bg-[#262624] px-2 py-0.5 rounded font-semibold text-[#666562] dark:text-[#A3A19B]">
              {deals.length} Target{deals.length === 1 ? '' : 's'}
            </span>
          </div>

          <div className="h-4 w-px bg-[#E5E4DF] dark:bg-[#262624] hidden sm:block" />

          {/* Strategy Filter Tabs */}
          <div className="flex items-center gap-1 bg-[#FAF9F6] dark:bg-[#1C1C1A] p-1 rounded-lg border border-[#E5E4DF] dark:border-[#262624] text-xs font-mono">
            {['all', 'dscr', 'conventional', 'seller_carry'].map((strat) => (
              <button
                key={strat}
                onClick={() => setFilterStrategy(strat)}
                className={`px-2.5 py-1 rounded transition-colors uppercase font-bold text-[10px] cursor-pointer ${
                  filterStrategy === strat
                    ? 'bg-[#111110] dark:bg-[#F4F3EF] text-white dark:text-[#111110] shadow-2xs'
                    : 'text-[#666562] dark:text-[#A3A19B] hover:text-[#111110] dark:hover:text-[#F4F3EF]'
                }`}
              >
                {strat === 'all'
                  ? 'All Debt'
                  : strat === 'seller_carry'
                  ? 'Creative'
                  : strat.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Aggregate Pipeline Total & Add Action */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="text-right">
            <span className="text-[#8F8D88] dark:text-[#73716B] text-[10px] uppercase block">
              Aggregate Pipeline Capital
            </span>
            <span className="font-bold text-[#111110] dark:text-[#F4F3EF] text-sm">
              $
              {deals
                .reduce((sum, d) => sum + d.price, 0)
                .toLocaleString()}
            </span>
          </div>

          <button
            onClick={() => setIngestModalOpen(true)}
            className="flex items-center gap-1.5 bg-[#111110] text-white text-xs font-mono font-bold px-3.5 py-2 rounded-lg hover:bg-black transition-colors cursor-pointer shadow-xs"
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
            <span>+ Ingest Link</span>
          </button>
        </div>
      </div>

      {/* DndContext Wrapping Kanban Board */}
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
          <div className="flex gap-4 h-full min-w-max pb-4">
            {STAGES.map((stage) => {
              const stageDeals = getStageDeals(stage.id);
              const stageVol = getStageVolume(stage.id);

              return (
                <KanbanColumn
                  key={stage.id}
                  stage={stage}
                  deals={stageDeals}
                  stageVolume={stageVol}
                  onOpenDealDrawer={(deal) => {
                    setSelectedDealId(deal.id);
                    onOpenDealDrawer(deal);
                  }}
                  onOpenUnderwriter={(deal) => {
                    setSelectedDealId(deal.id);
                    onOpenUnderwriter(deal);
                  }}
                  onOpenAudit={(deal) => {
                    setSelectedDealId(deal.id);
                    onOpenAudit(deal);
                  }}
                  onMoveStage={moveDealStage}
                  onDelete={deleteDeal}
                />
              );
            })}
          </div>
        </div>

        {/* Drag Overlay for smooth preview */}
        <DragOverlay>
          {activeDragDeal ? (
            <DealCard
              deal={activeDragDeal}
              onOpenDealDrawer={() => {}}
              onOpenUnderwriter={() => {}}
              onOpenAudit={() => {}}
              onMoveStage={() => {}}
              onDelete={() => {}}
              isOverlay
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};
