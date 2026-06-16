import { useState, useEffect } from 'react'
import type { NotificationConfig } from '@/types/vehicle'
import {
  fetchNotificationConfig,
  saveNotificationConfig,
  toggleNotificationEnabled,
  testNotification,
} from '@/api/fleet'

export default function NotificationPanel() {
  const [config, setConfig] = useState<NotificationConfig | null>(null)
  const [originalConfig, setOriginalConfig] = useState<NotificationConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    setLoading(true)
    try {
      const data = await fetchNotificationConfig()
      setConfig(data)
      setOriginalConfig(data)
    } catch (error) {
      showMessage('error', '加载配置失败')
    } finally {
      setLoading(false)
    }
  }

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 3000)
  }

  const handleSave = async () => {
    if (!config) return
    setSaving(true)
    try {
      const saved = await saveNotificationConfig(config)
      setConfig(saved)
      setOriginalConfig(saved)
      showMessage('success', '配置保存成功')
    } catch (error) {
      showMessage('error', '保存失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async () => {
    setSaving(true)
    try {
      const updated = await toggleNotificationEnabled()
      setConfig(updated)
      setOriginalConfig(updated)
      showMessage('success', updated.enabled ? '通知已启用' : '通知已禁用')
    } catch (error) {
      showMessage('error', '操作失败')
    } finally {
      setSaving(false)
    }
  }

  const handleTest = async () => {
    setTesting(true)
    try {
      const msg = await testNotification()
      showMessage('success', msg || '测试通知已发送')
    } catch (error) {
      showMessage('error', '测试失败')
    } finally {
      setTesting(false)
    }
  }

  const handleReset = () => {
    if (originalConfig) {
      setConfig({ ...originalConfig })
    }
  }

  const hasChanges = () => {
    if (!config || !originalConfig) return false
    return JSON.stringify(config) !== JSON.stringify(originalConfig)
  }

  const updateField = <K extends keyof NotificationConfig>(key: K, value: NotificationConfig[K]) => {
    if (config) {
      setConfig({ ...config, [key]: value })
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-gray-500">加载配置...</span>
        </div>
      </div>
    )
  }

  if (!config) return null

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${config.enabled ? 'bg-green-100' : 'bg-gray-100'}`}>
            <svg className={`w-4 h-4 ${config.enabled ? 'text-green-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-800">通知策略</h3>
            <p className="text-xs text-gray-500">
              {config.enabled ? '🟢 通知已启用' : '⚫ 通知已禁用'}
            </p>
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 p-4 space-y-4">
          {message && (
            <div className={`px-3 py-2 rounded-lg text-xs font-medium ${
              message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700 font-medium">全局开关</span>
            <button
              onClick={handleToggle}
              disabled={saving}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                config.enabled ? 'bg-green-500' : 'bg-gray-300'
              } ${saving ? 'opacity-50' : ''}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow ${
                config.enabled ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div>
            <label className="block text-sm text-gray-700 font-medium mb-1">企业微信 Webhook 地址</label>
            <input
              type="url"
              value={config.wechatWebhookUrl}
              onChange={(e) => updateField('wechatWebhookUrl', e.target.value)}
              placeholder="https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=..."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="mt-1 text-xs text-gray-400">在企微群 → 群机器人 → 添加机器人中获取</p>
          </div>

          <div className="border-t border-gray-50 pt-3">
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <span className="text-base">🔌</span> 断线检测
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">启用断线告警</span>
                <button
                  onClick={() => updateField('enableOfflineAlert', !config.enableOfflineAlert)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    config.enableOfflineAlert ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                >
                  <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform shadow ${
                    config.enableOfflineAlert ? 'translate-x-5' : 'translate-x-1'
                  }`} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">离线超时（分钟）</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => updateField('offlineTimeoutMinutes', Math.max(1, config.offlineTimeoutMinutes - 1))}
                    className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-50"
                  >
                    −
                  </button>
                  <span className="w-10 text-center text-sm font-medium text-gray-800">{config.offlineTimeoutMinutes}</span>
                  <button
                    onClick={() => updateField('offlineTimeoutMinutes', Math.min(60, config.offlineTimeoutMinutes + 1))}
                    className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-50 pt-3">
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <span className="text-base">🔥</span> 温度暴顶检测
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">启用暴顶告警</span>
                <button
                  onClick={() => updateField('enableTempSpikeAlert', !config.enableTempSpikeAlert)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    config.enableTempSpikeAlert ? 'bg-orange-500' : 'bg-gray-300'
                  }`}
                >
                  <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform shadow ${
                    config.enableTempSpikeAlert ? 'translate-x-5' : 'translate-x-1'
                  }`} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">暴顶阈值（°C）</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => updateField('tempSpikeThreshold', Math.max(8, config.tempSpikeThreshold - 1))}
                    className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-50"
                  >
                    −
                  </button>
                  <span className="w-12 text-center text-sm font-medium text-gray-800">{config.tempSpikeThreshold}°C</span>
                  <button
                    onClick={() => updateField('tempSpikeThreshold', Math.min(50, config.tempSpikeThreshold + 1))}
                    className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-50 pt-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-gray-700 font-medium">通知冷却时间</span>
                <p className="text-xs text-gray-400">同一设备重复告警的最小间隔</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => updateField('cooldownMinutes', Math.max(1, config.cooldownMinutes - 1))}
                  className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-50"
                >
                  −
                </button>
                <span className="w-10 text-center text-sm font-medium text-gray-800">{config.cooldownMinutes}分</span>
                <button
                  onClick={() => updateField('cooldownMinutes', Math.min(120, config.cooldownMinutes + 1))}
                  className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-50"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={handleSave}
              disabled={saving || !hasChanges()}
              className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? '保存中...' : '保存配置'}
            </button>
            <button
              onClick={handleTest}
              disabled={testing || !config.wechatWebhookUrl}
              className="px-4 py-2 bg-amber-50 text-amber-700 text-sm font-medium rounded-lg border border-amber-200 hover:bg-amber-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {testing ? '发送中...' : '测试通知'}
            </button>
            {hasChanges() && (
              <button
                onClick={handleReset}
                className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                重置
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
