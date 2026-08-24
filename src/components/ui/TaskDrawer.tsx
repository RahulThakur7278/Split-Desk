import React, { useState, useCallback, useMemo } from 'react';
import type { Task, User, TaskPriority, TaskStatus } from '../../types';
import { useBoardStore } from '../../stores/board.store';
import { useToast } from '../../hooks/useToast';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Avatar from '../ui/Avatar';
import Select from '../ui/Select';
import Input from '../ui/Input';
import Modal from '../ui/Modal';

interface TaskDrawerProps {
  task: Task;
  users: User[];
  onClose: () => void;
}

/**
 * Slide-in side drawer for viewing and editing task details.
 * Includes editable fields, comments section, and delete confirmation.
 */
const TaskDrawer: React.FC<TaskDrawerProps> = ({ task, users, onClose }) => {
  const { editTask, deleteTask, addComment, comments: allComments } = useBoardStore();
  const { success } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newComment, setNewComment] = useState('');

  const [editData, setEditData] = useState({
    title: task.title,
    description: task.description,
    priority: task.priority,
    status: task.status,
    assigneeId: task.assigneeId,
    dueDate: task.dueDate,
  });

  const taskComments = useMemo(
    () => allComments.filter((c) => c.taskId === task.id).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ),
    [allComments, task.id]
  );

  const assignee = useMemo(
    () => users.find((u) => u.id === task.assigneeId),
    [users, task.assigneeId]
  );

  const handleSave = useCallback(() => {
    editTask(task.id, editData);
    setIsEditing(false);
    success('Task updated', `"${editData.title}" has been updated.`);
  }, [editTask, task.id, editData, success]);

  const handleDelete = useCallback(() => {
    deleteTask(task.id);
    success('Task deleted', `"${task.title}" has been removed.`);
    onClose();
  }, [deleteTask, task.id, task.title, success, onClose]);

  const handleAddComment = useCallback(() => {
    if (!newComment.trim()) return;
    addComment(task.id, 1, newComment.trim());
    setNewComment('');
    success('Comment added');
  }, [addComment, task.id, newComment, success]);

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getCommentAuthor = (authorId: number): User | undefined => {
    return users.find((u) => u.id === authorId);
  };

  const statusOptions = [
    { value: 'backlog', label: 'Backlog' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'review', label: 'Review' },
    { value: 'done', label: 'Done' },
  ];

  const priorityOptions = [
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
  ];

  const assigneeOptions = users.map((u) => ({ value: u.id, label: u.name }));

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className="fixed right-0 top-0 z-50 h-full w-full sm:w-[480px] bg-white dark:bg-slate-800 shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300"
        role="complementary"
        aria-label="Task details"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white truncate pr-4">
            Task Details
          </h2>
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
            ) : (
              <Button variant="primary" size="sm" onClick={handleSave}>
                Save
              </Button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-300 dark:hover:bg-slate-700 transition-colors"
              aria-label="Close drawer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Title */}
          {isEditing ? (
            <Input
              label="Title"
              value={editData.title}
              onChange={(e) => setEditData((prev) => ({ ...prev, title: e.target.value }))}
            />
          ) : (
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{task.title}</h3>
          )}

          {/* Description */}
          {isEditing ? (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Description
              </label>
              <textarea
                value={editData.description}
                onChange={(e) => setEditData((prev) => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="block w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
          ) : (
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{task.description}</p>
          )}

          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-4">
            {isEditing ? (
              <>
                <Select
                  label="Status"
                  options={statusOptions}
                  value={editData.status}
                  onChange={(e) => setEditData((prev) => ({ ...prev, status: e.target.value as TaskStatus }))}
                />
                <Select
                  label="Priority"
                  options={priorityOptions}
                  value={editData.priority}
                  onChange={(e) => setEditData((prev) => ({ ...prev, priority: e.target.value as TaskPriority }))}
                />
                <Select
                  label="Assignee"
                  options={assigneeOptions}
                  value={editData.assigneeId}
                  onChange={(e) => setEditData((prev) => ({ ...prev, assigneeId: Number(e.target.value) }))}
                />
                <Input
                  label="Due Date"
                  type="date"
                  value={editData.dueDate}
                  onChange={(e) => setEditData((prev) => ({ ...prev, dueDate: e.target.value }))}
                />
              </>
            ) : (
              <>
                <div>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</span>
                  <div className="mt-1">
                    <Badge variant="status" status={task.status}>{task.status.replace('-', ' ')}</Badge>
                  </div>
                </div>
                <div>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Priority</span>
                  <div className="mt-1">
                    <Badge variant="priority" priority={task.priority}>{task.priority}</Badge>
                  </div>
                </div>
                <div>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Assignee</span>
                  <div className="mt-1.5 flex items-center gap-2">
                    <Avatar src={assignee?.avatar} alt={assignee?.name ?? 'Unassigned'} name={assignee?.name} size="xs" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">{assignee?.name ?? 'Unassigned'}</span>
                  </div>
                </div>
                <div>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Due Date</span>
                  <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{formatDate(task.dueDate)}</p>
                </div>
              </>
            )}
          </div>

          {/* Timestamps */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-1.5">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Created {formatDate(task.createdAt)}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Updated {formatDate(task.updatedAt)}
            </p>
            {task.completedAt && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400">
                Completed {formatDate(task.completedAt)}
              </p>
            )}
          </div>

          {/* Comments */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
              Comments ({taskComments.length})
            </h4>

            {/* Add comment */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                placeholder="Add a comment..."
                className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                aria-label="New comment"
              />
              <Button variant="primary" size="sm" onClick={handleAddComment} disabled={!newComment.trim()}>
                Post
              </Button>
            </div>

            {/* Comment list */}
            <div className="space-y-3">
              {taskComments.map((comment) => {
                const author = getCommentAuthor(comment.authorId);
                return (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar
                      src={author?.avatar}
                      alt={author?.name ?? 'Unknown'}
                      name={author?.name}
                      size="sm"
                    />
                    <div className="flex-1 bg-slate-50 dark:bg-slate-700/30 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {author?.name ?? 'Unknown'}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{comment.message}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Delete action */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button variant="danger" size="sm" fullWidth onClick={() => setShowDeleteConfirm(true)}>
              Delete Task
            </Button>
          </div>
        </div>
      </aside>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Task"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Are you sure you want to delete "<strong>{task.title}</strong>"? This action cannot be undone.
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default TaskDrawer;
