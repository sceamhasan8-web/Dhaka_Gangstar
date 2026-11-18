// IndexedDB & LocalStorage Save Progression Manager for Dhaka City Gangstar

export class SaveManager {
  constructor(game) {
    this.game = game;
    this.dbName = 'DhakaCityGangstarDB';
    this.storeName = 'playerSave';
    this.db = null;

    this.initDB();
  }

  initDB() {
    const request = indexedDB.open(this.dbName, 1);

    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(this.storeName)) {
        db.createObjectStore(this.storeName, { keyPath: 'id' });
      }
    };

    request.onsuccess = (e) => {
      this.db = e.target.result;
      console.log('Dhaka City Gangstar Save Database ready.');
      this.autoLoad();
    };

    request.onerror = (e) => {
      console.warn('IndexedDB unavailable, falling back to LocalStorage:', e);
      this.autoLoadLocalStorage();
    };
  }

  saveGame() {
    const saveData = {
      id: 'current_save',
      timestamp: Date.now(),
      money: this.game.player.money,
      health: this.game.player.health,
      posX: this.game.player.position.x,
      posY: this.game.player.position.y,
      posZ: this.game.player.position.z,
      currentMission: this.game.missionManager ? this.game.missionManager.currentMissionIndex : 0
    };

    if (this.db) {
      try {
        const tx = this.db.transaction([this.storeName], 'readwrite');
        const store = tx.objectStore(this.storeName);
        store.put(saveData);
        tx.oncomplete = () => {
          if (this.game.ui) this.game.ui.showToast('GAME SAVED SUCCESSFULLY! 💾');
        };
      } catch (e) {
        this.saveLocalStorage(saveData);
      }
    } else {
      this.saveLocalStorage(saveData);
    }
  }

  saveLocalStorage(data) {
    localStorage.setItem('DhakaGangstarSave', JSON.stringify(data));
    if (this.game.ui) this.game.ui.showToast('GAME SAVED (LOCALSTORAGE)! 💾');
  }

  autoLoad() {
    if (!this.db) {
      this.autoLoadLocalStorage();
      return;
    }

    const tx = this.db.transaction([this.storeName], 'readonly');
    const store = tx.objectStore(this.storeName);
    const getReq = store.get('current_save');

    getReq.onsuccess = () => {
      if (getReq.result) {
        this.applySaveData(getReq.result);
      } else {
        this.autoLoadLocalStorage();
      }
    };
  }

  autoLoadLocalStorage() {
    const raw = localStorage.getItem('DhakaGangstarSave');
    if (raw) {
      try {
        const data = JSON.parse(raw);
        this.applySaveData(data);
      } catch (e) {}
    }
  }

  applySaveData(data) {
    if (data.money !== undefined) this.game.player.money = data.money;
    if (data.health !== undefined) this.game.player.health = data.health;
    if (data.posX !== undefined && data.posZ !== undefined) {
      this.game.player.position.set(data.posX, data.posY || 0, data.posZ);
    }
    if (data.currentMission !== undefined && this.game.missionManager) {
      this.game.missionManager.startMission(data.currentMission);
    }
    console.log('Loaded previous save file.');
  }

  resetProgress() {
    if (this.db) {
      const tx = this.db.transaction([this.storeName], 'readwrite');
      tx.objectStore(this.storeName).clear();
    }
    localStorage.removeItem('DhakaGangstarSave');
    this.game.player.money = 15000;
    this.game.player.health = 100;
    this.game.player.position.set(0, 0, 140);
    if (this.game.missionManager) this.game.missionManager.startMission(0);
    if (this.game.ui) this.game.ui.showToast('PROGRESS RESET TO NEW GAME.');
  }
}

