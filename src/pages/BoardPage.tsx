import React, { useState, useCallback, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useBoardStore } from '../stores/board.store';
import { useTasks, useUsers, useSprints } from '../hooks/useTasks';
import { useToast } from '../hooks/useToast';
import KanbanColumn from '../components/board/KanbanColumn';
import TaskCard from '../components/board/TaskCard';
import TaskDrawer from '../components/ui/TaskDrawer';
import CreateTaskModal from '../components/ui/CreateTaskModal';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import { BoardColumnSkeleton } from '../components/ui/Skeleton';
import type { Task, TaskStatus } from '../types';

const COLUMNS: { id: TaskStatus; title: string }[] = [
  { id: 'backlog', title: 'Backlog' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'review', title: 'Review' },
  { id: 'done', title: 'Done' },
];

/**
 * Kanban board page with drag-and-drop, filtering, and task management.
 *
 * Architecture:
 * - @dnd-kit handles drag interactions
 * - Zustand board store manages state
 * - Tasks filtered via memoized selectors
 * - Undo support for drag-and-drop actions
 */
const BoardPage: React.FC = () => {
  const { isLoading } = useTasks();
  const { data: users = [] } = useUsers();
  const { data: sprints = [] } = useSprints();
  const { tasks, moveTask, reorderTask, undoLastAction, previousState } = useBoardStore();
  const { addToast } = useToast();

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterPriority, setFilterPriority] = useState<string>('');
  const [filterAssignee, setFilterAssignee] = useState<string>('');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  /** Filtered tasks */
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (filterPriority && task.priority !== filterPriority) return false;
      if (filterAssignee && task.assigneeId !== Number(filterAssignee)) return false;
      return true;
    });
  }, [tasks, filterPriority, filterAssignee]);

  /** Group tasks by column */
  const columnTasks = useMemo(() => {
    const grouped: Record<TaskStatus, Task[]> = {
      backlog: [],
      'in-progress': [],
      review: [],
      done: [],
    };
    filteredTasks.forEach((task) => {
      grouped[task.status].push(task);
    });
    Object.values(grouped).forEach((arr) => arr.sort((a, b) => a.order - b.order));
    return grouped;
  }, [filteredTasks]);

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const task = tasks.find((t) => t.id === event.active.id);
      if (task) setActiveTask(task);
    },
    [tasks]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveTask(null);

      if (!over) return;

      const activeTask = tasks.find((t) => t.id === active.id);
      if (!activeTask) return;

      const overId = over.id;

      /** Determine target column */
      let targetColumn: TaskStatus;
      let targetOrder: number;

      const isOverColumn = COLUMNS.some((c) => c.id === overId);
      if (isOverColumn) {
        targetColumn = overId as TaskStatus;
        targetOrder = columnTasks[targetColumn].length + 1;
      } else {
        const overTask = tasks.find((t) => t.id === overId);
        if (!overTask) return;
        targetColumn = overTask.status;
        targetOrder = overTask.order;
      }

      if (activeTask.status === targetColumn && activeTask.order === targetOrder) return;

      if (activeTask.status === targetColumn) {
        reorderTask(activeTask.id, targetOrder);
      } else {
        moveTask(activeTask.id, targetColumn, targetOrder);
      }

      addToast({
        type: 'info',
        title: 'Task moved',
        message: `"${activeTask.title}" moved to ${targetColumn.replace('-', ' ')}`,
        duration: 4000,
        action: previousState
          ? {
              label: 'Undo',
              onClick: undoLastAction,
            }
          : undefined,
      });
    },
    [tasks, columnTasks, moveTask, reorderTask, addToast, previousState, undoLastAction]
  );

  const handleDragOver = useCallback(
    (_event: DragOverEvent) => {
      /** Optional: could implement live preview here */
    },
    []
  );

  const handleTaskClick = useCallback(
    (task: Task) => {
      /** Get the latest version of the task from store */
      const latest = tasks.find((t) => t.id === task.id);
      setSelectedTask(latest ?? task);
    },
    [tasks]
  );

  const priorityOptions = [
    { value: '', label: 'All Priorities' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
  ];

  const assigneeOptions = [
    { value: '', label: 'All Assignees' },
    ...users.map((u) => ({ value: u.id, label: u.name })),
  ];

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-7xl mx-auto">
        <div className="h-10 w-48 rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse" />
        <div className="flex gap-4 overflow-x-auto pb-4 justify-start md:justify-center">
          {[1, 2, 3, 4].map((i) => (
            <BoardColumnSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Sprint Board</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {tasks.length} tasks across {COLUMNS.length} columns
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowCreateModal(true)}
          leftIcon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          }
        >
          Add Task
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="w-40">
          <Select
            options={priorityOptions}
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            aria-label="Filter by priority"
          />
        </div>
        <div className="w-44">
          <Select
            options={assigneeOptions}
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value)}
            aria-label="Filter by assignee"
          />
        </div>
        {(filterPriority || filterAssignee) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setFilterPriority('');
              setFilterAssignee('');
            }}
          >
            Clear filters
          </Button>
        )}
      </div>

      {/* Kanban board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
      >
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 lg:mx-0 lg:px-0 justify-start md:justify-center">
          {COLUMNS.map((column) => (
            <KanbanColumn
              key={column.id}
              id={column.id}
              title={column.title}
              tasks={columnTasks[column.id]}
              users={users}
              onTaskClick={handleTaskClick}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <TaskCard
              task={activeTask}
              assignee={users.find((u) => u.id === activeTask.assigneeId)}
              onClick={() => {}}
              isDragOverlay
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Task drawer */}
      {selectedTask && (
        <TaskDrawer
          task={selectedTask}
          users={users}
          onClose={() => setSelectedTask(null)}
        />
      )}

      {/* Create task modal */}
      <CreateTaskModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        users={users}
        sprints={sprints}
      />
    </div>
  );
};

export default BoardPage;
