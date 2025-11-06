import { useState, useEffect } from 'react'
import { FaTasks, FaExternalLinkAlt, FaCheck } from 'react-icons/fa'

const Tasks = ({ user, refreshUserData }) => {
    const [tasks, setTasks] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [completingTask, setCompletingTask] = useState(null)
    const [message, setMessage] = useState('')

    useEffect(() => {
        loadTasks()
    }, [])

    const loadTasks = async () => {
        try {
            setIsLoading(true)
            const token = sessionStorage.getItem('authToken')
            const headers = {}
            if (token) {
                headers['Authorization'] = `Bearer ${token}`
            }

            const response = await fetch(`${import.meta.env.VITE_API_URL}/task/all`, {
                headers: headers
            })

            if (response.ok) {
                const data = await response.json()
                setTasks(data.tasks || [])
                setError(null)
            } else {
                setError('Не удалось загрузить задания')
            }
        } catch (err) {
            setError('Ошибка сети при загрузке заданий')
            console.error('Error loading tasks:', err)
        } finally {
            setIsLoading(false)
        }
    }

    const handleTaskClick = async (task) => {
        if (task.completed) return

        // Open link in new tab
        window.open(task.link, '_blank')

        // Complete task after a short delay
        setTimeout(() => {
            completeTask(task)
        }, 1000)
    }

    const completeTask = async (task) => {
        try {
            setCompletingTask(task.id)
            setMessage('')

            const token = sessionStorage.getItem('authToken')
            const response = await fetch(`${import.meta.env.VITE_API_URL}/task/complete`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ taskId: task.id })
            })

            const result = await response.json()

            if (response.ok && result.status === 'ok') {
                setMessage(`✅ ${result.message}`)
                loadTasks() // Refresh tasks
                if (refreshUserData) {
                    refreshUserData() // Refresh user balance
                }
            } else {
                setMessage(`❌ ${result.error || 'Ошибка при выполнении'}`)
            }
        } catch (error) {
            setMessage('❌ Ошибка сети при выполнении')
            console.error('Error completing task:', error)
        } finally {
            setCompletingTask(null)
        }
    }

    return (
        <div className="tasks-section">
            <h3 style={{ marginBottom: '16px', color: 'var(--tg-theme-text-color)', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaTasks /> Задания ({tasks.filter(t => !t.completed).length})
            </h3>

            {message && (
                <div style={{
                    padding: '12px',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    backgroundColor: message.includes('✅') ? 'rgba(39, 174, 96, 0.1)' : 'rgba(231, 76, 60, 0.1)',
                    color: message.includes('✅') ? '#27ae60' : '#e74c3c',
                    fontSize: '14px',
                    textAlign: 'center'
                }}>
                    {message}
                </div>
            )}

            {isLoading && (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏳</div>
                    <div style={{ color: 'var(--tg-theme-hint-color)', fontSize: '14px' }}>Загрузка заданий...</div>
                </div>
            )}

            {error && (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>❌</div>
                    <div style={{ color: 'var(--tg-theme-hint-color)', fontSize: '14px', marginBottom: '12px' }}>{error}</div>
                    <button className="btn" onClick={loadTasks} style={{ margin: 0, padding: '8px 16px', fontSize: '12px' }}>
                        Попробовать снова
                    </button>
                </div>
            )}

            {!isLoading && !error && tasks.length === 0 && (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>📋</div>
                    <div style={{ color: 'var(--tg-theme-hint-color)', fontSize: '14px' }}>Заданий пока нет</div>
                </div>
            )}

            {!isLoading && !error && tasks.length > 0 && (
                <div className="tasks-list">
                    {tasks.map(task => (
                        <div 
                            key={task.id} 
                            className={`task-item ${task.completed ? 'completed' : ''}`}
                            onClick={() => handleTaskClick(task)}
                            style={{
                                opacity: task.completed ? 0.6 : 1,
                                cursor: task.completed ? 'default' : 'pointer'
                            }}
                        >
                            <div className="task-content">
                                <div className="task-header">
                                    <h4 className="task-title">{task.title}</h4>
                                    <div className="task-reward">{task.reward} 🪙</div>
                                </div>
                                <p className="task-description">{task.description}</p>
                                <div className="task-footer">
                                    {task.completed ? (
                                        <div className="task-status completed">
                                            <FaCheck style={{ marginRight: '4px' }} />
                                            Выполнено
                                        </div>
                                    ) : (
                                        <div className="task-status">
                                            <FaExternalLinkAlt style={{ marginRight: '4px' }} />
                                            {completingTask === task.id ? 'Выполняется...' : 'Нажмите для выполнения'}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <style jsx>{`
                .tasks-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .task-item {
                    background: var(--tg-theme-bg-color);
                    border-radius: 12px;
                    padding: 16px;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    transition: all 0.2s ease;
                }

                .task-item:not(.completed):hover {
                    transform: translateY(-1px);
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                }

                .task-item.completed {
                    background: rgba(39, 174, 96, 0.1);
                }

                .task-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 8px;
                }

                .task-title {
                    font-size: 16px;
                    font-weight: 600;
                    color: var(--tg-theme-text-color);
                    margin: 0;
                    flex: 1;
                }

                .task-reward {
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--tg-theme-button-color);
                    margin-left: 12px;
                }

                .task-description {
                    font-size: 14px;
                    color: var(--tg-theme-hint-color);
                    margin: 0 0 12px 0;
                    line-height: 1.4;
                }

                .task-footer {
                    display: flex;
                    justify-content: flex-end;
                }

                .task-status {
                    font-size: 12px;
                    color: var(--tg-theme-hint-color);
                    display: flex;
                    align-items: center;
                }

                .task-status.completed {
                    color: #27ae60;
                }
            `}</style>
        </div>
    )
}

export default Tasks