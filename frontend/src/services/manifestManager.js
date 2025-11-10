// Dynamic PWA Manifest Loader
class PWAManifestManager {
  constructor() {
    this.currentManifest = null;
    this.manifestElement = null;
  }

  // Determine which manifest to load based on current route
  getManifestPath() {
    const path = window.location.pathname;
    
    if (path.startsWith('/admin')) {
      return '/manifest-admin.json';
    } else {
      return '/manifest-citizen.json';
    }
  }

  // Load appropriate manifest
  async loadManifest() {
    const manifestPath = this.getManifestPath();
    
    // Only reload if manifest changed
    if (this.currentManifest === manifestPath) {
      return;
    }

    // Remove existing manifest
    if (this.manifestElement) {
      document.head.removeChild(this.manifestElement);
    }

    // Add new manifest
    this.manifestElement = document.createElement('link');
    this.manifestElement.rel = 'manifest';
    this.manifestElement.href = manifestPath;
    document.head.appendChild(this.manifestElement);

    this.currentManifest = manifestPath;
    
    console.log('PWA Manifest loaded:', manifestPath);
  }

  // Initialize and listen for route changes
  init() {
    // Load initial manifest
    this.loadManifest();

    // Listen for route changes
    window.addEventListener('popstate', () => {
      this.loadManifest();
    });

    // Listen for programmatic navigation
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = (...args) => {
      originalPushState.apply(history, args);
      setTimeout(() => this.loadManifest(), 100);
    };

    history.replaceState = (...args) => {
      originalReplaceState.apply(history, args);
      setTimeout(() => this.loadManifest(), 100);
    };
  }

  // Get current manifest type
  getCurrentManifestType() {
    return this.currentManifest?.includes('admin') ? 'admin' : 'citizen';
  }
}

export default new PWAManifestManager();