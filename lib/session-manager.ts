export class SessionManager {
  private static readonly DEVICE_ID_KEY = 'sidejot_device_id'
  private static readonly TAB_ID_KEY = 'sidejot_tab_id'

  private static instance: SessionManager

  private _deviceId = ''
  private _tabId = ''
  private _isInitialized = false

  private constructor() {
    // Don't try to access localStorage in constructor
    // We'll initialize in a separate method
  }

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager()
    }
    return SessionManager.instance
  }

  initialize(): void {
    // Skip if already initialized or not in browser
    if (this._isInitialized || typeof window === 'undefined') return

    this._deviceId =
      localStorage.getItem(SessionManager.DEVICE_ID_KEY) ||
      this.generateAndStoreDeviceId()
    this._tabId =
      sessionStorage.getItem(SessionManager.TAB_ID_KEY) ||
      this.generateAndStoreTabId()

    this._isInitialized = true
  }

  get deviceId(): string {
    if (!this._isInitialized && typeof window !== 'undefined') {
      this.initialize()
    }
    return this._deviceId
  }

  get tabId(): string {
    if (!this._isInitialized && typeof window !== 'undefined') {
      this.initialize()
    }
    return this._tabId
  }

  get sessionId(): string {
    if (!this._isInitialized && typeof window !== 'undefined') {
      this.initialize()
    }
    return `${this._deviceId}:${this._tabId}`
  }

  private generateAndStoreDeviceId(): string {
    const newDeviceId = crypto.randomUUID()
    localStorage.setItem(SessionManager.DEVICE_ID_KEY, newDeviceId)
    return newDeviceId
  }

  private generateAndStoreTabId(): string {
    const newTabId = crypto.randomUUID()
    sessionStorage.setItem(SessionManager.TAB_ID_KEY, newTabId)
    return newTabId
  }
}
