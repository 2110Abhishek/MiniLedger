import { registerRootComponent } from 'expo';
import { Platform } from 'react-native';
import App from './App';

// Inject full-viewport background reset on web
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const existing = document.getElementById('miniledger-web-reset');
  if (!existing) {
    const style = document.createElement('style');
    style.id = 'miniledger-web-reset';
    style.textContent = `
      html, body, #root {
        width: 100% !important;
        min-height: 100vh !important;
        margin: 0 !important;
        padding: 0 !important;
        background-color: #05070E !important;
        color: #F8FAFC !important;
        overflow-x: hidden !important;
        box-sizing: border-box !important;
      }
      * {
        box-sizing: border-box !important;
      }
    `;
    document.head.appendChild(style);
  }
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
registerRootComponent(App);
