import React, { useState, useCallback } from 'react';
import { useBoardStore } from '../../stores/board.store';
import { useToast } from '../../hooks/useToast';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import type { User, Sprint, TaskPriority } from '../../types';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  sprints: Sprint[];
}

/**
 * Modal form for creating a new task.
 * Validates required fields and adds task to backlog.
 */
const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ isOpen, onClose, users, sprints }) => {
  const { addTask } = useBoardStore();
  const { success } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as TaskPriority,
    assigneeId: users[0]?.id ?? 1,
    dueDate: new Date().toISOString().split('T')[0],
    sprintId: sprints[sprints.length - 1]?.id ?? 1,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.dueDate) newErrors.dueDate = 'Due date is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!validate()) return;

      addTask({
        ...formData,
        title: formData.title.trim(),
        description: formData.description.trim(),
      });

      success('Task created', `"${formData.title.trim()}" added to backlog.`);

      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        assigneeId: users[0]?.id ?? 1,
        dueDate: new Date().toISOString().split('T')[0],
        sprintId: sprints[sprints.length - 1]?.id ?? 1,
      });
      setErrors({});
      onClose();
    },
    [formData, addTask, success, onClose, users, sprints]
  );

  const priorityOptions = [
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
  ];

  const assigneeOptions = users.map((u) => ({ value: u.id, label: u.name }));
  const sprintOptions = sprints.map((s) => ({ value: s.id, label: s.name }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Task" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Title"
          value={formData.title}
          onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
          error={errors.title}
          placeholder="Enter task title"
          required
        />

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            rows={3}
            placeholder="Describe the task..."
            className="block w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-slate-400 transition-all"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Priority"
            options={priorityOptions}
            value={formData.priority}
            onChange={(e) => setFormData((prev) => ({ ...prev, priority: e.target.value as TaskPriority }))}
          />
          <Select
            label="Assignee"
            options={assigneeOptions}
            value={formData.assigneeId}
            onChange={(e) => setFormData((prev) => ({ ...prev, assigneeId: Number(e.target.value) }))}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Due Date"
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData((prev) => ({ ...prev, dueDate: e.target.value }))}
            error={errors.dueDate}
            required
          />
          <Select
            label="Sprint"
            options={sprintOptions}
            value={formData.sprintId}
            onChange={(e) => setFormData((prev) => ({ ...prev, sprintId: Number(e.target.value) }))}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Create Task
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateTaskModal;
